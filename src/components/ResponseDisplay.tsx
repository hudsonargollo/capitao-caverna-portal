import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuestionResponse } from "@/lib/api";
import { Share2, RotateCcw, Clock, Zap } from "lucide-react";

interface ResponseDisplayProps {
  response: QuestionResponse;
  onNewQuestion: () => void;
  onShare?: () => void;
}

const ResponseDisplay = ({ response, onNewQuestion, onShare }: ResponseDisplayProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="w-full space-y-6 animate-enter">
      {/* Header com status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-600">
            Resposta do Capitão Caverna
          </span>
        </div>
        
        {response.from_cache && (
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Cache Hit
          </Badge>
        )}
      </div>

      {/* Resposta Principal */}
      <Card className="neon-frame">
        <CardHeader>
          <CardTitle className="text-lg">Resposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {response.response}
            </p>
          </div>

          <Separator />

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-medium">
                {formatDuration(response.phoneme_analysis.estimated_duration_seconds)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Palavras:</span>
              <span className="font-medium">{response.word_count}</span>
            </div>

            {response.from_cache && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Cache Hits:</span>
                  <span className="font-medium">{response.cache_hits}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Cached:</span>
                  <span className="font-medium text-xs">
                    {response.cached_at ? new Date(response.cached_at).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Análise Fonética (Opcional) */}
          {showDetails && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Análise Fonética</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Fonemas:</span>
                  <span className="ml-2 font-medium">
                    {response.phoneme_analysis.total_phonemes}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Formas da boca:</span>
                  <span className="ml-2 font-medium">
                    {response.phoneme_analysis.unique_mouth_shapes.length}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {response.phoneme_analysis.unique_mouth_shapes.map((shape, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {shape}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onNewQuestion}
              variant="neon"
              size="lg"
              className="flex-1 hover-glow"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Fazer Nova Pergunta
            </Button>
            
            <Button
              onClick={onShare}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Resposta
            </Button>
          </div>

          {/* Toggle Details */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              {showDetails ? 'Ocultar' : 'Ver'} detalhes técnicos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      <div className="text-center text-xs text-muted-foreground">
        Gerado em {new Date(response.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default ResponseDisplay;

