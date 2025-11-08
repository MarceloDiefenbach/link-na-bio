import { useEffect, useState } from "react";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { navigate } from "../lib/router";

interface PageData {
  slug: string;
  title?: string | null;
  description?: string | null;
  instagram_url?: string | null;
}

export function PublicProfilePage({ slug }: { slug: string }) {
  const [page, setPage] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.getPublicPage(slug).then(res => {
      if (!active) return;
      if (!res.ok) {
        setError(res.error);
        setPage(null);
      } else {
        setPage(res.data);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-300">
        Carregando página...
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-center px-6">
        <p className="text-2xl font-semibold text-neutral-800">Página não encontrada</p>
        <p className="mt-2 text-neutral-500 max-w-md">
          O endereço <strong>{slug}</strong> ainda não foi criado ou está indisponível.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate("/")}>Ir para a página inicial</Button>
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Entrar para criar a sua
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full bg-neutral-900 rounded-3xl px-8 py-12 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.5em] text-neutral-500">Link na bio</p>
          <h1 className="text-4xl font-bold leading-tight">{page.title || `/${page.slug}`}</h1>
        </div>
        <p className="text-neutral-200 whitespace-pre-wrap text-lg leading-relaxed">
          {page.description || "Esta pessoa ainda não escreveu uma descrição, mas já reservou o endereço dela por aqui."}
        </p>

        {page.instagram_url ? (
          <a
            href={page.instagram_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-white text-neutral-900 rounded-full font-semibold px-6 py-3"
          >
            Abrir Instagram
          </a>
        ) : (
          <p className="text-sm text-neutral-500">
            Não há link do Instagram cadastrado ainda.
          </p>
        )}

        <div className="pt-6 border-t border-neutral-800 text-sm text-neutral-500">
          Quer uma página assim?{" "}
          <button
            type="button"
            className="underline"
            onClick={() => navigate("/register")}
          >
            Crie a sua gratuitamente.
          </button>
        </div>
      </div>
    </div>
  );
}
