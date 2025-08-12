import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { UploadProgress } from "@/lib/api";
import { Upload, Mic, Brain, CheckCircle } from "lucide-react";

interface LoadingStatesProps {
  progress: UploadProgress;
}

const LoadingStates = ({ progress }: LoadingStatesProps) => {
  const getIcon = () => {
    switch (progress.stage) {
      case 'uploading':
        return <Upload className="h-6 w-6" />;
      case 'transcribing':
        return <Mic className="h-6 w-6" />;
      case 'generating':
        return <Brain className="h-6 w-6" />;
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Upload className="h-6 w-6" />;
    }
  };

  const getStageText = () => {
    switch (progress.stage) {
      case 'uploading':
        return 'Enviando arquivo';
      case 'transcribing':
        return 'Transcrevendo áudio';
      case 'generating':
        return 'Gerando resposta do Capitão';
      case 'complete':
        return 'Concluído!';
      default:
        return 'Processando';
    }
  };

  const getDescription = () => {
    switch (progress.stage) {
      case 'uploading':
        return 'Fazendo upload do seu arquivo...';
      case 'transcribing':
        return 'Convertendo sua pergunta em texto...';
      case 'generating':
        return 'O Capitão Caverna está preparando sua resposta...';
      case 'complete':
        return 'Sua resposta está pronta!';
      default:
        return 'Aguarde um momento...';
    }
  };

  return (
    <div className="w-full animate-enter">
      <Card className="neon-frame">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Ícone animado */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background border border-accent/30 text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.2)]">
                {getIcon()}
              </div>
            </div>

            {/* Texto principal */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {getStageText()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getDescription()}
              </p>
            </div>

            {/* Barra de progresso */}
            <div className="w-full max-w-sm space-y-2">
              <Progress 
                value={progress.progress} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.message}</span>
                <span>{progress.progress}%</span>
              </div>
            </div>

            {/* Indicadores de etapas */}
            <div className="flex items-center space-x-4 text-xs">
              <div className={`flex items-center space-x-1 ${
                ['uploading', 'transcribing', 'generating', 'complete'].includes(progress.stage) 
                  ? 'text-accent' : 'text-muted-foreground'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  ['uploading', 'transcribing', 'generating', 'complete'].includes(progress.stage)
                    ? 'bg-accent' : 'bg-muted-foreground/30'
                }`} />
                <span>Upload</span>
              </div>

              <div className={`flex items-center space-x-1 ${
                ['transcribing', 'generating', 'complete'].includes(progress.stage) 
                  ? 'text-accent' : 'text-muted-foreground'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  ['transcribing', 'generating', 'complete'].includes(progress.stage)
                    ? 'bg-accent' : 'bg-muted-foreground/30'
                }`} />
                <span>Transcrição</span>
              </div>

              <div className={`flex items-center space-x-1 ${
                ['generating', 'complete'].includes(progress.stage) 
                  ? 'text-accent' : 'text-muted-foreground'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  ['generating', 'complete'].includes(progress.stage)
                    ? 'bg-accent' : 'bg-muted-foreground/30'
                }`} />
                <span>Geração</span>
              </div>

              <div className={`flex items-center space-x-1 ${
                progress.stage === 'complete' 
                  ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  progress.stage === 'complete'
                    ? 'bg-green-500' : 'bg-muted-foreground/30'
                }`} />
                <span>Pronto</span>
              </div>
            </div>

            {/* Mensagem motivacional */}
            <div className="text-center text-xs text-muted-foreground max-w-sm">
              <p>
                O Capitão Caverna está analisando sua pergunta com toda a sabedoria da alcatéia. 
                Aguarde um momento...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingStates;

