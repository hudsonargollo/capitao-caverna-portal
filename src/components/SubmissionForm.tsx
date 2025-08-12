import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { uploadQuestion, testResponse, UploadProgress, QuestionResponse } from "@/lib/api";
import LoadingStates from "./LoadingStates";
import ResponseDisplay from "./ResponseDisplay";

const ACCEPT = "video/*,audio/*";

const SubmissionForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestion, setTestQuestion] = useState("");
  
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewURL(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type.startsWith("video/") || f.type.startsWith("audio/"))) {
      setFile(f);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isTestMode) {
      await handleTestSubmit();
    } else {
      await handleFileSubmit();
    }
  };

  const handleFileSubmit = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setResponse(null);
    
    try {
      const result = await uploadQuestion(file, setProgress);
      
      if (result.success && result.data) {
        setResponse(result.data);
        toast({
          title: "Pergunta enviada!",
          description: "O Capitão Caverna respondeu sua pergunta!",
        });
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no envio",
        description: "Não foi possível processar sua pergunta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleTestSubmit = async () => {
    if (!testQuestion.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    
    // Simular progresso para modo teste
    setProgress({
      stage: 'generating',
      progress: 50,
      message: 'Gerando resposta...'
    });
    
    try {
      const result = await testResponse(testQuestion);
      
      if (result.success && result.data) {
        setProgress({
          stage: 'complete',
          progress: 100,
          message: 'Resposta pronta!'
        });
        
        // Delay para mostrar o estado completo
        setTimeout(() => {
          setResponse(result.data);
          setProgress(null);
          toast({
            title: "Resposta gerada!",
            description: "O Capitão Caverna respondeu sua pergunta!",
          });
        }, 1000);
      } else {
        throw new Error(result.error || 'Erro na API');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar a resposta. Tente novamente.",
        variant: "destructive",
      });
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setFile(null);
    setResponse(null);
    setTestQuestion("");
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handleShare = () => {
    if (response) {
      const shareText = `Pergunta para o Capitão Caverna:\n\n"${response.question}"\n\nResposta:\n${response.response}\n\n#ModoCaverna #CapitaoCaverna`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Resposta do Capitão Caverna',
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copiado!",
          description: "Resposta copiada para a área de transferência.",
        });
      }
    }
  };

  // Se há uma resposta, mostrar ela
  if (response) {
    return (
      <ResponseDisplay 
        response={response}
        onNewQuestion={handleNewQuestion}
        onShare={handleShare}
      />
    );
  }

  // Se está carregando, mostrar estados de loading
  if (isLoading && progress) {
    return <LoadingStates progress={progress} />;
  }

  const isVideo = file?.type.startsWith("video/");
  const isAudio = file?.type.startsWith("audio/");

  return (
    <form onSubmit={onSubmit} className="w-full">
      {/* Toggle Modo Teste */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-4 p-1 bg-background/40 rounded-lg border border-border/60">
          <Button
            type="button"
            variant={!isTestMode ? "neon" : "ghost"}
            size="sm"
            onClick={() => setIsTestMode(false)}
            className={!isTestMode ? "hover-glow" : ""}
          >
            Modo Normal
          </Button>
          <Button
            type="button"
            variant={isTestMode ? "neon" : "ghost"}
            size="sm"
            onClick={() => setIsTestMode(true)}
            className={isTestMode ? "hover-glow" : ""}
          >
            Modo Teste
          </Button>
        </div>
      </div>

      {isTestMode ? (
        /* Modo Teste - Input de texto */
        <div className="space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 ring-1 ring-border">
            <div className="space-y-4">
              <label htmlFor="test-question" className="block text-sm font-medium">
                Digite sua pergunta para o Capitão Caverna:
              </label>
              <textarea
                id="test-question"
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                placeholder="Como posso melhorar meu foco e eliminar distrações?"
                className="w-full min-h-[120px] p-4 rounded-lg bg-background/60 border border-border/60 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Modo teste: sua pergunta será enviada diretamente para a API sem upload de arquivo.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="neon"
              size="xl"
              className="hover-glow animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_24px_hsl(var(--accent)/0.25)]"
              disabled={!testQuestion.trim() || isLoading}
              aria-disabled={!testQuestion.trim() || isLoading}
            >
              {isLoading ? "Gerando..." : "Testar Resposta"}
            </Button>
          </div>
        </div>
      ) : (
        /* Modo Normal - Upload de arquivo */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`relative rounded-2xl p-6 sm:p-8 transition-colors ${drag ? "ring-2 ring-accent/70" : "ring-1 ring-border"}`}
        >
          <div className="block">
            <AspectRatio ratio={16/9}>
              <div className="neon-frame group h-full w-full overflow-hidden rounded-xl">
                {previewURL ? (
                  isVideo ? (
                    <video src={previewURL} controls className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background/40">
                      <audio src={previewURL} controls className="w-11/12" />
                    </div>
                  )
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-center px-6">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-background/60 text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.2)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-base font-medium">Grave sua pergunta em vídeo ou áudio</p>
                    <p className="mt-1 text-sm text-muted-foreground">Use a câmera ou o microfone do seu dispositivo</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <Button type="button" variant="neon" size="lg" onClick={() => videoInputRef.current?.click()} className="hover-glow">
                        Gravar Vídeo
                      </Button>
                      <Button type="button" variant="secondary" size="lg" onClick={() => audioInputRef.current?.click()}>
                        Gravar Áudio
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </AspectRatio>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              capture="user"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              capture
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <div className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
              Selecionado: <span className="text-foreground">{file.name}</span>
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            Ao enviar sua mídia, você concorda e autoriza o uso da sua imagem, voz e do conteúdo desta pergunta para publicação nas redes sociais e em outros materiais do Capitão Caverna.
          </p>

          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              variant="neon"
              size="xl"
              className="hover-glow animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_24px_hsl(var(--accent)/0.25)]"
              disabled={!file || isLoading}
              aria-disabled={!file || isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Pergunta"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default SubmissionForm;
