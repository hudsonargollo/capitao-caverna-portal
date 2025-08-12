import { cn } from "@/lib/utils";

const HeroHeader = () => {
  return (
    <header className="container mx-auto max-w-3xl pt-12 sm:pt-16">
      <div className="">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Pergunte ao Capitão
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Grave e envie sua pergunta em vídeo ou áudio. Modo Caverna ON.
        </p>
      </div>
    </header>
  );
};

export default HeroHeader;
