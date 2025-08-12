import HeroHeader from "@/components/HeroHeader";
import SubmissionForm from "@/components/SubmissionForm";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 cave-aurora" aria-hidden="true" />
      <div className="absolute inset-0 -z-20 bg-background" aria-hidden="true" />

      <HeroHeader />

      <main className="container mx-auto max-w-3xl pb-16 pt-8">
        <section aria-labelledby="envio" className="animate-enter">
          <h2 id="envio" className="sr-only">Envio de Perguntas</h2>
          <SubmissionForm />
        </section>
      </main>
    </div>
  );
};

export default Index;
