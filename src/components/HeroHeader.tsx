import { cn } from "@/lib/utils";

const HeroHeader = () => {
  return (
    <header className="container mx-auto max-w-3xl pt-12 sm:pt-16">
      <div className="flex items-center gap-5">
        <img
          src="/lovable-uploads/0d5b63a6-5ae3-4484-94c5-cf8d7ffeecf3.png"
          alt="Mascote Capitão Caverna com letreiro 'Modo Caverna ON'"
          loading="lazy"
          className={cn(
            "h-20 w-20 rounded-lg object-cover shadow-[0_0_24px_hsl(var(--accent)/0.3)]"
          )}
        />
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Pergunte ao Capitão
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Envie sua pergunta em vídeo ou áudio e entre para a alcatéia.
          </p>
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
