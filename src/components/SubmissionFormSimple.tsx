import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { uploadQuestion, testResponse } from "@/lib/api";

const SubmissionFormSimple = () => {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestion, setTestQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Simple toast replacement
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type.startsWith("video/") || f.type.startsWith("audio/"))) {
      setFile(f);
      showToast(`Arquivo selecionado: ${f.name}`);
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
    if (!file) {
      showToast('Selecione um arquivo de vídeo ou áudio.', 'error');
      return;
    }
    
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      const result = await uploadQuestion(file);
      
      if (result.success) {
        showToast('Upload iniciado! Processando...');
        
        // Simular delay de processamento
        setTimeout(() => {
          setResponse({
            question: "Pergunta do arquivo enviado",
            response: "Resposta simulada do Capitão Caverna para teste.",
            audio_url: null,
            video_url: null,
            timestamp: new Date().toISOString()
          });
          setIsLoading(false);
          showToast('Processamento concluído!');
        }, 3000);
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsLoading(false);
      showToast('Erro ao enviar arquivo. Tente novamente.', 'error');
    }
  };

  const handleTestSubmit = async () => {
    if (!testQuestion.trim()) {
      showToast('Digite uma pergunta para testar.', 'error');
      return;
    }
    
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      const result = await testResponse(testQuestion);
      
      if (result.success && result.data) {
        setResponse(result.data);
        showToast('Resposta gerada com sucesso!');
      } else {
        throw new Error(result.error || 'Erro na API');
      }
    } catch (error) {
      console.error('Test error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      showToast('Erro ao gerar resposta. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setFile(null);
    setResponse(null);
    setTestQuestion("");
    setError(null);
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
        showToast('Resposta copiada para a área de transferência.');
      }
    }
  };

  // Se há uma resposta, mostrar ela
  if (response) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl p-6 sm:p-8 ring-1 ring-border bg-background/60">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-600">Resposta do Capitão Caverna</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Sua pergunta:</h3>
                <p className="text-muted-foreground italic">"{response.question}"</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Resposta do Capitão:</h3>
                <p className="leading-relaxed">{response.response}</p>
              </div>
              
              {response.audio_url && (
                <div>
                  <h4 className="font-medium mb-2">Áudio:</h4>
                  <audio controls className="w-full">
                    <source src={response.audio_url} type="audio/mpeg" />
                  </audio>
                </div>
              )}
              
              {response.video_url && (
                <div>
                  <h4 className="font-medium mb-2">Vídeo do Capitão:</h4>
                  <video controls className="w-full rounded-lg">
                    <source src={response.video_url} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleNewQuestion} variant="outline" className="flex-1">
                Fazer Nova Pergunta
              </Button>
              <Button onClick={handleShare} variant="secondary" className="flex-1">
                Compartilhar Resposta
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se está carregando
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl p-6 sm:p-8 ring-1 ring-border bg-background/60">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <h3 className="text-lg font-semibold">
              {isTestMode ? 'Gerando resposta...' : 'Processando arquivo...'}
            </h3>
            <p className="text-muted-foreground">
              {isTestMode 
                ? 'O Capitão Caverna está preparando sua resposta.' 
                : 'Transcrevendo áudio e gerando resposta personalizada.'
              }
            </p>
          </div>
        </div>
      </div>
    );
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
            variant={!isTestMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsTestMode(false)}
          >
            Modo Normal
          </Button>
          <Button
            type="button"
            variant={isTestMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsTestMode(true)}
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
              variant="default"
              size="xl"
              className="animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_24px_hsl(var(--accent)/0.25)]"
              disabled={!testQuestion.trim() || isLoading}
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
                      <Button 
                        type="button" 
                        variant="default" 
                        size="lg" 
                        onClick={() => videoInputRef.current?.click()}
                      >
                        Gravar Vídeo
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="lg" 
                        onClick={() => audioInputRef.current?.click()}
                      >
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
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <div className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
              Selecionado: <span className="text-foreground">{file.name}</span>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              variant="default"
              size="xl"
              className="animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_24px_hsl(var(--accent)/0.25)]"
              disabled={!file || isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Pergunta"}
            </Button>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
};

export default SubmissionFormSimple;

