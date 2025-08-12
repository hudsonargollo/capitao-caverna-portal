import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Upload, 
  Video, 
  Mic, 
  Play,
  RotateCcw,
  TestTube
} from 'lucide-react';
import { uploadQuestion, testResponse } from '@/lib/api';
import ProcessingProgress from './ProcessingProgress';
import VideoResponse from './VideoResponse';

type SubmissionState = 'idle' | 'processing' | 'completed' | 'error';

export function SubmissionFormUpdated() {
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modo teste
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestion, setTestQuestion] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`Arquivo selecionado: ${selectedFile.name}`);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      toast.success(`Arquivo selecionado: ${droppedFile.name}`);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const startRecording = async (type: 'video' | 'audio') => {
    try {
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: type === 'video' ? 'video/webm' : 'audio/webm' 
        });
        const file = new File([blob], `recording.${type === 'video' ? 'webm' : 'webm'}`, {
          type: blob.type
        });
        setFile(file);
        setIsRecording(false);
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
        
        toast.success(`${type === 'video' ? 'Vídeo' : 'Áudio'} gravado com sucesso!`);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info(`Gravando ${type}... Clique novamente para parar.`);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erro ao acessar câmera/microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVideoRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording('video');
    }
  };

  const handleAudioRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording('audio');
    }
  };

  const handleSubmit = async () => {
    if (!consent) {
      toast.error('Você deve concordar com os termos para continuar.');
      return;
    }

    if (isTestMode) {
      await handleTestSubmit();
      return;
    }

    if (!file) {
      toast.error('Selecione um arquivo de vídeo ou áudio.');
      return;
    }

    try {
      setSubmissionState('processing');
      setError(null);
      
      const response = await uploadQuestion(file);
      
      if (response.success) {
        setSessionId(response.session_id);
        toast.success('Upload iniciado! Acompanhe o progresso abaixo.');
      } else {
        throw new Error(response.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setSubmissionState('error');
      toast.error('Erro ao enviar arquivo. Tente novamente.');
    }
  };

  const handleTestSubmit = async () => {
    if (!testQuestion.trim()) {
      toast.error('Digite uma pergunta para testar.');
      return;
    }

    try {
      setSubmissionState('processing');
      setError(null);
      
      const response = await testResponse(testQuestion);
      
      if (response.success) {
        setResult(response);
        setSubmissionState('completed');
        toast.success('Resposta gerada com sucesso!');
      } else {
        throw new Error(response.error || 'Erro na geração de resposta');
      }
    } catch (error) {
      console.error('Test response error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setSubmissionState('error');
      toast.error('Erro ao gerar resposta. Tente novamente.');
    }
  };

  const handleProcessingComplete = (processingResult: any) => {
    setResult(processingResult);
    setSubmissionState('completed');
    setSessionId(null);
    toast.success('Processamento concluído! 🎉');
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setSubmissionState('error');
    setSessionId(null);
    toast.error(`Erro no processamento: ${errorMessage}`);
  };

  const handleProcessingCancel = () => {
    setSubmissionState('idle');
    setSessionId(null);
    setError(null);
    toast.info('Processamento cancelado.');
  };

  const resetForm = () => {
    setFile(null);
    setTestQuestion('');
    setSubmissionState('idle');
    setSessionId(null);
    setResult(null);
    setError(null);
    setConsent(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Renderizar estado de processamento
  if (submissionState === 'processing' && sessionId) {
    return (
      <ProcessingProgress
        sessionId={sessionId}
        onComplete={handleProcessingComplete}
        onError={handleProcessingError}
        onCancel={handleProcessingCancel}
      />
    );
  }

  // Renderizar resultado final
  if (submissionState === 'completed' && result) {
    return (
      <VideoResponse
        result={result}
        onNewQuestion={resetForm}
      />
    );
  }

  // Renderizar formulário principal
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Toggle Modo Teste */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={!isTestMode ? "default" : "outline"}
          onClick={() => setIsTestMode(false)}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Modo Normal</span>
        </Button>
        <Button
          variant={isTestMode ? "default" : "outline"}
          onClick={() => setIsTestMode(true)}
          className="flex items-center space-x-2"
        >
          <TestTube className="w-4 h-4" />
          <span>Modo Teste</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {isTestMode ? (
            /* Modo Teste - Input de texto */
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  Modo Teste Ativo
                </Badge>
                <h3 className="text-lg font-semibold mb-2">
                  Digite sua pergunta para o Capitão Caverna:
                </h3>
                <p className="text-sm text-gray-600">
                  Modo teste: sua pergunta será enviada diretamente para a API sem upload de arquivo.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-question">Sua pergunta:</Label>
                <Textarea
                  id="test-question"
                  placeholder="Como posso melhorar meu foco e eliminar distrações?"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          ) : (
            /* Modo Normal - Upload de arquivo */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Grave sua pergunta em vídeo ou áudio
                </h3>
                <p className="text-sm text-gray-600">
                  Use a câmera ou o microfone do seu dispositivo
                </p>
              </div>

              {/* Área de Upload/Drop */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {file ? file.name : 'Grave sua pergunta em vídeo ou áudio'}
                </p>
                <p className="text-sm text-gray-500">
                  {file 
                    ? `Arquivo selecionado: ${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : 'Use a câmera ou o microfone do seu dispositivo'
                  }
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Botões de Gravação */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleVideoRecord}
                  className="flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>{isRecording ? 'Parar Gravação' : 'Gravar Vídeo'}</span>
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleAudioRecord}
                  className="flex items-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? 'Parar Gravação' : 'Gravar Áudio'}</span>
                </Button>
              </div>

              {isRecording && (
                <div className="text-center">
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 Gravando...
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Consentimento */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed">
              Ao enviar sua mídia, você concorda e autoriza o uso da sua imagem, voz e do conteúdo desta pergunta para publicação nas redes sociais e em outros materiais do Capitão Caverna.
            </Label>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Botão de Envio */}
          <Button
            onClick={handleSubmit}
            disabled={(!file && !isTestMode) || (!testQuestion.trim() && isTestMode) || !consent || submissionState === 'processing'}
            className="w-full"
            size="lg"
          >
            {submissionState === 'processing' ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {isTestMode ? <Play className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                <span>{isTestMode ? 'Testar Resposta' : 'Enviar Pergunta'}</span>
              </div>
            )}
          </Button>

          {/* Reset */}
          {(file || testQuestion || error) && (
            <Button
              variant="outline"
              onClick={resetForm}
              className="w-full flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar e Recomeçar</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SubmissionFormUpdated;

