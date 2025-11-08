import { useEffect, useState } from "react";
import { api } from "../api";
import { ProfilePage } from "../api/pages";
import { Button } from "../components/ui/button";
import { navigate } from "../lib/router";

export function PageDashboard() {
  const [pages, setPages] = useState<ProfilePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getMyPages().then(res => {
      if (!active) return;
      if (!res.ok) {
        setError(res.error);
        if (res.error.toLowerCase().includes("autenticado")) {
          navigate("/login");
        }
      } else {
        setPages(res.data || []);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        Carregando suas páginas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-2xl font-semibold text-neutral-800">Não foi possível carregar</p>
        <p className="mt-2 text-neutral-500 max-w-sm">{error}</p>
        <Button className="mt-6" onClick={() => navigate("/login")}>
          Fazer login novamente
        </Button>
      </div>
    );
  }

  const hasPages = pages.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-400">Minhas páginas</p>
            <h1 className="text-3xl font-semibold mt-2">Gerencie seus links</h1>
            <p className="text-neutral-500 text-sm">
              Crie quantos links quiser e compartilhe cada URL individualmente.
            </p>
          </div>
          <Button onClick={() => navigate("/app/pagina")}>Criar nova página</Button>
        </header>

        {hasPages ? (
          <div className="space-y-4">
            {pages.map(page => {
              const publicUrl =
                typeof window === "undefined" ? `/${page.slug}` : `${window.location.origin}/${page.slug}`;
              const copyLink = async () => {
                try {
                  if (typeof navigator === "undefined" || !navigator.clipboard) {
                    throw new Error("Clipboard API indisponível");
                  }
                  await navigator.clipboard.writeText(publicUrl);
                  setCopiedSlug(page.slug);
                  setTimeout(() => setCopiedSlug(current => (current === page.slug ? null : current)), 2000);
                } catch {
                  alert("Não foi possível copiar o link agora.");
                }
              };
              return (
                <div
                  key={page.id}
                  className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-500">/{page.slug}</p>
                    <h3 className="text-xl font-semibold">{page.title || "Sem título"}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {page.description || "Adicione uma descrição para esta página."}
                    </p>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-neutral-500 underline"
                    >
                      {publicUrl}
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => navigate(`/app/pagina/${page.slug}`)}>
                      Editar
                    </Button>
                    <Button onClick={copyLink}>
                      {copiedSlug === page.slug ? "Copiado!" : "Copiar link"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-neutral-200 rounded-xl p-12 text-center space-y-4">
            <p className="text-xl font-semibold text-neutral-800">Nenhuma página criada ainda</p>
            <p className="text-neutral-500">
              Clique no botão acima para criar sua primeira página e começar a compartilhar seus links.
            </p>
            <Button onClick={() => navigate("/app/pagina")}>Criar primeira página</Button>
          </div>
        )}
      </div>
    </div>
  );
}
