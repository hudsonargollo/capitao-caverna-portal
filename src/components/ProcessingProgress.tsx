import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Loader2, X } from 'lucide-react';

interface ProcessingStep {
  id: string;
  name: string;
  progress: number;
  completed?: boolean;
  error?: string;
}

interface ProcessingSession {
  id: string;
  currentStep: string;
  progress: number;
  message: string;
  estimatedTimeRemaining: number | null;
  steps: ProcessingStep[];
  completed?: boolean;
  error?: string;
  result?: any;
}

interface ProcessingProgressProps {
  sessionId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function ProcessingProgress({ 
  sessionId, 
  onComplete, 
  onError, 
  onCancel 
}: ProcessingProgressProps) {
  const [session, setSession] = useState<ProcessingSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Conectar ao stream de updates
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pergunte-ao-capitao.perfilsouiuri.workers.dev';
    const streamUrl = `${apiUrl}/processing-stream?session_id=${sessionId}`;
    
    const es = new EventSource(streamUrl);
    setEventSource(es);

    es.onopen = () => {
      setIsConnected(true);
      console.log('Connected to processing stream');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status' || data.type === 'update') {
          setSession(data.session);
          
          // Verificar se processamento foi concluído
          if (data.session.completed && data.session.result) {
            onComplete?.(data.session.result);
            es.close();
          }
          
          // Verificar se houve erro
          if (data.session.error) {
            onError?.(data.session.error);
            es.close();
          }
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    es.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      
      // Tentar reconectar após 3 segundos
      setTimeout(() => {
        if (es.readyState === EventSource.CLOSED) {
          // Reconectar
          const newEs = new EventSource(streamUrl);
          setEventSource(newEs);
        }
      }, 3000);
    };

    // Cleanup
    return () => {
      es.close();
      setEventSource(null);
      setIsConnected(false);
    };
  }, [sessionId, onComplete, onError]);

  const handleCancel = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStepIcon = (step: ProcessingStep, isCurrentStep: boolean) => {
    if (step.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (step.completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (isCurrentStep) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStepStatus = (step: ProcessingStep, isCurrentStep: boolean) => {
    if (step.error) return 'error';
    if (step.completed) return 'completed';
    if (isCurrentStep) return 'processing';
    return 'pending';
  };

  if (!session) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Conectando ao processamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {session.completed ? '🎉 Processamento Concluído!' : 'Processando sua pergunta...'}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
            {!session.completed && !session.error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Geral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{session.message}</span>
            <span className="text-gray-500">{session.progress}%</span>
          </div>
          <Progress value={session.progress} className="h-3" />
          {session.estimatedTimeRemaining && (
            <div className="text-sm text-gray-500 text-center">
              Tempo estimado restante: {formatTime(session.estimatedTimeRemaining)}
            </div>
          )}
        </div>

        {/* Etapas Detalhadas */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">Etapas do Processamento</h3>
          {session.steps.map((step) => {
            const isCurrentStep = session.currentStep === step.id;
            const status = getStepStatus(step, isCurrentStep);
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : status === 'processing'
                    ? 'bg-blue-50 border-blue-200'
                    : status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {getStepIcon(step, isCurrentStep)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${
                      status === 'completed' ? 'text-green-700' :
                      status === 'processing' ? 'text-blue-700' :
                      status === 'error' ? 'text-red-700' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {step.progress}%
                    </span>
                  </div>
                  
                  {isCurrentStep && step.progress > 0 && (
                    <Progress 
                      value={step.progress} 
                      className="h-1 mt-1" 
                    />
                  )}
                  
                  {step.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Erro Geral */}
        {session.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">Erro no Processamento</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{session.error}</p>
          </div>
        )}

        {/* Resultado Final */}
        {session.completed && session.result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700">Processamento Concluído!</span>
            </div>
            <p className="text-sm text-green-600">
              Sua pergunta foi processada com sucesso. O Capitão Caverna está pronto para responder!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProcessingProgress;

