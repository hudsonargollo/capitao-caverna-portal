import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const ACCEPT = "video/*,audio/*";

const SubmissionForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    toast({
      title: "Pergunta enviada!",
      description: "Recebemos seu arquivo. Obrigado por participar da alcatéia!",
    });
    // TODO: Integrate Supabase Storage + RLS + Auth in next step
    setFile(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const isVideo = file?.type.startsWith("video/")
  const isAudio = file?.type.startsWith("audio/")

  return (
    <form onSubmit={onSubmit} className="w-full">
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
            disabled={!file}
            aria-disabled={!file}
          >
            Enviar Pergunta
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SubmissionForm;
