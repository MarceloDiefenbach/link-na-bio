import { navigate } from "../lib/router";
import { Button } from "../components/ui/button";

const HIGHLIGHTS = [
  {
    title: "Gerencie tudo em um só lugar",
    description: "Organize fluxos, acompanhe progresso e mantenha o time alinhado com uma plataforma única.",
  },
  {
    title: "Automatize tarefas repetitivas",
    description: "Configure processos simples para ganhar tempo e focar no que importa para o seu produto.",
  },
  {
    title: "Escale com confiança",
    description: "Monitore métricas essenciais e adapte seu SaaS rapidamente conforme o negócio cresce.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-500">Seu SaaS aqui</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Uma landing page genérica pronta para personalizar.
            </h1>
          </div>
          <p className="text-lg text-neutral-600 max-w-xl">
            Use esta estrutura como ponto de partida para apresentar seu produto. Edite textos, cores e chamadas para
            ação conforme a identidade da sua solução.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => navigate("/register")}>Começar agora</Button>
            <Button className="w-full sm:w-auto" variant="ghost" onClick={() => navigate("/login")}>
              Acessar conta
            </Button>
          </div>
        </div>
      </header>
      <section className="bg-white border-t border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map(item => (
            <div key={item.title} className="rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-neutral-500">
          Substitua este rodapé pelas informações e links institucionais do seu projeto.
        </div>
      </footer>
    </div>
  );
}
