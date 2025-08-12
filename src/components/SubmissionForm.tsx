import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const ACCEPT = "video/*,audio/*";

const SubmissionForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [drag, setDrag] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    if (!file || !consent) return;
    toast({
      title: "Pergunta enviada!",
      description: "Recebemos seu arquivo. Obrigado por participar da alcatéia!",
    });
    // TODO: Integrate Supabase Storage + RLS + Auth in next step
    setFile(null);
    setConsent(false);
    if (inputRef.current) inputRef.current.value = "";
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
        <label htmlFor="file" className="block cursor-pointer">
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
                <div className="flex h-full w-full flex-col items-center justify-center text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-background/60 text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.2)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                      <path d="M3 12h2m2 0h2m2 0h2m2 0h2m2 0h2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-base font-medium">Arraste seu vídeo/áudio aqui</p>
                  <p className="mt-1 text-sm text-muted-foreground">ou clique para selecionar. MP4, MOV, MP3, WAV.</p>
                </div>
              )}
            </div>
          </AspectRatio>
          <input
            id="file"
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {file && (
          <div className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
            Selecionado: <span className="text-foreground">{file.name}</span>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(Boolean(v))}
            aria-describedby="consent-desc"
          />
          <Label htmlFor="consent" className="cursor-pointer leading-relaxed">
            Eu concordo e autorizo o uso da minha imagem, voz e do conteúdo desta pergunta
            para publicação nas redes sociais e em outros materiais do Capitão Caverna.
          </Label>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            type="submit"
            variant="neon"
            size="xl"
            className="hover-glow"
            disabled={!file || !consent}
            aria-disabled={!file || !consent}
          >
            Enviar Pergunta
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SubmissionForm;
