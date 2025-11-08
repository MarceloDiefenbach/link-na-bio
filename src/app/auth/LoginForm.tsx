import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { navigate } from "../../lib/router";
import { useLanguage } from "../../contexts/LanguageContext";
import { authLabels } from "./labels";

export function LoginForm({ onSwitch, onSuccess }: { onSwitch?: () => void; onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { lang } = useLanguage();
  const lbl = authLabels[lang].login;

  useEffect(() => {
    api.me().then(res => {
      if (res.ok) navigate("/app");
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.ok) {
        setMessage(lbl.success);
        navigate("/app");
      } else {
        setMessage(res.error);
      }
    } finally {
      setLoading(false);
      onSuccess?.();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm w-full flex flex-col items-center border rounded-lg p-6 shadow-sm">
        <p className="mt-4 text-xl font-bold tracking-tight">{lbl.title}</p>

        <form onSubmit={onSubmit} className="w-full space-y-4 mt-8">
          <div className="space-y-1">
            <Label htmlFor="email">{lbl.email.label}</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lbl.email.placeholder}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{lbl.password.label}</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={lbl.password.placeholder}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? lbl.loading : lbl.submit}
          </Button>
        </form>

        <p className="mt-5 text-sm text-center">
          {lbl.switchPrompt}
          <button type="button" onClick={onSwitch} className="ml-1 underline">
            {lbl.switchCta}
          </button>
        </p>
        {message && (
          <div
            className="text-sm mt-2"
            style={{ color: message.includes("!") ? "#16a34a" : "#dc2626" }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
