import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { navigate } from "../lib/router";

type FormState = {
  slug: string;
  title: string;
  description: string;
  instagram_url: string;
};

const INITIAL_STATE: FormState = {
  slug: "",
  title: "",
  description: "",
  instagram_url: "",
};

function sanitizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function PageBuilder({ slug }: { slug?: string | null }) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [pageId, setPageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setMessage(null);
    setError(null);
    setNotFound(false);

    if (!slug) {
      setForm(INITIAL_STATE);
      setPageId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getMyPage(slug).then(res => {
      if (!active) return;
      if (!res.ok) {
        setError(res.error);
        if (res.error.toLowerCase().includes("autenticado")) {
          navigate("/login");
        }
      } else if (!res.data) {
        setNotFound(true);
      } else {
        setForm({
          slug: res.data.slug || "",
          title: res.data.title || "",
          description: res.data.description || "",
          instagram_url: res.data.instagram_url || "",
        });
        setPageId(res.data.id);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [slug]);

  const publicUrl = useMemo(() => {
    if (!form.slug) return null;
    if (typeof window === "undefined") return `/${form.slug}`;
    return `${window.location.origin}/${form.slug}`;
  }, [form.slug]);

  const hostLabel = useMemo(() => {
    if (typeof window === "undefined") return "seusite.com";
    const host = window.location.host;
    if (host === "0.0.0.0:3000" || host === "127.0.0.1:3000") return "seusite.com";
    return host || "seusite.com";
  }, []);

  const onChange = (field: keyof FormState) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.slug) {
      setMessage("Escolha um endereço para sua página.");
      return;
    }
    setSaving(true);
    const payload = {
      id: pageId ?? undefined,
      slug: form.slug,
      title: form.title.trim() || undefined,
      description: form.description.trim() || undefined,
      instagram_url: form.instagram_url.trim() || undefined,
    };
    const res = await api.savePage(payload);
    setSaving(false);
    if (!res.ok) {
      setMessage(res.error);
      if (res.error.toLowerCase().includes("autenticado")) {
        navigate("/login");
      }
      return;
    }
    setMessage("Página salva com sucesso!");
    setPageId(res.data.id);
    setForm({
      slug: res.data.slug || "",
      title: res.data.title || "",
      description: res.data.description || "",
      instagram_url: res.data.instagram_url || "",
    });
    const targetPath = `/app/pagina/${res.data.slug}`;
    if (typeof window !== "undefined" && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        Carregando editor...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-2xl font-semibold text-neutral-800">Página não encontrada</p>
        <p className="mt-2 text-neutral-500 max-w-sm">
          Não conseguimos localizar uma página com o endereço informado. Talvez ela tenha sido removida ou pertença a outro usuário.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate("/app")}>Voltar para a lista</Button>
          <Button variant="ghost" onClick={() => navigate("/app/pagina")}>
            Criar nova página
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-2xl font-semibold text-neutral-800">Algo deu errado</p>
        <p className="mt-2 text-neutral-500 max-w-sm">{error}</p>
        <Button className="mt-6" onClick={() => navigate("/login")}>
          Fazer login novamente
        </Button>
      </div>
    );
  }

  const isEditing = Boolean(slug);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-white border rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-neutral-400">
                {isEditing ? "Editar página" : "Nova página"}
              </p>
              <h1 className="text-2xl font-semibold mt-2">
                {isEditing ? "Atualize as informações" : "Crie seu link na bio"}
              </h1>
            </div>
            <button
              className="text-sm text-neutral-500 underline"
              type="button"
              onClick={() => navigate("/app")}
            >
              Voltar para a lista
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="slug">Endereço da página</Label>
              <div className="flex flex-col gap-2">
                <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                  <span className="bg-neutral-100 px-3 py-2 text-sm text-neutral-500 hidden sm:inline">
                    {hostLabel}/
                  </span>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={e => onChange("slug")(sanitizeSlugInput(e.target.value))}
                    placeholder="seu-nome"
                    className="border-0 focus-visible:ring-0"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Use letras minúsculas, números e hífens. Máximo de 40 caracteres.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => onChange("title")(e.target.value.slice(0, 120))}
                placeholder="Ex.: Olá, eu sou a Ana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={e => onChange("description")(e.target.value.slice(0, 600))}
                placeholder="Um texto curto sobre você ou seu projeto."
                className="w-full min-h-[140px] rounded-lg border border-neutral-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              />
              <p className="text-xs text-neutral-500 text-right">{form.description.length}/600</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Link do Instagram</Label>
              <Input
                id="instagram"
                value={form.instagram_url}
                onChange={e => onChange("instagram_url")(e.target.value.slice(0, 255))}
                placeholder="@seuusuario ou https://instagram.com/seuusuario"
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar página"}
            </Button>
            {message && (
              <p className="text-sm text-center text-neutral-600">
                {message}
              </p>
            )}
          </form>
        </div>

        <div className="bg-neutral-900 text-white rounded-3xl p-8 flex flex-col gap-6">
          <div>
            <p className="text-sm text-neutral-400">Pré-visualização</p>
            {publicUrl ? (
              <a
                href={publicUrl}
                className="text-lg font-semibold text-white underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                {publicUrl}
              </a>
            ) : (
              <p className="text-lg font-semibold text-neutral-300">Defina um endereço para liberar sua página</p>
            )}
          </div>
          <div className="rounded-2xl bg-neutral-800 p-6 space-y-4">
            <p className="text-2xl font-bold">
              {form.title || "Seu título incrível aqui"}
            </p>
            <p className="text-sm text-neutral-200 whitespace-pre-wrap">
              {form.description ||
                "Use este espaço para contar sua história, compartilhar o que você faz e direcionar as pessoas para o seu Instagram."}
            </p>
            {form.instagram_url && (
              <a
                href={
                  form.instagram_url.startsWith("http")
                    ? form.instagram_url
                    : `https://instagram.com/${form.instagram_url.replace(/^@/, "")}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white text-neutral-900 text-sm font-medium px-4 py-2"
              >
                Abrir Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
