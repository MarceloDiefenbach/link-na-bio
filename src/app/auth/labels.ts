import type { Language } from "../../contexts/LanguageContext";

type LoginLabels = {
  title: string;
  email: { label: string; placeholder: string };
  password: { label: string; placeholder: string };
  submit: string;
  loading: string;
  switchPrompt: string;
  switchCta: string;
  success: string;
};

type RegisterLabels = {
  title: string;
  name: { label: string; placeholder: string };
  email: { label: string; placeholder: string };
  password: { label: string; placeholder: string };
  submit: string;
  loading: string;
  switchPrompt: string;
  switchCta: string;
  success: string;
};

export const authLabels: Record<Language, { login: LoginLabels; register: RegisterLabels }> = {
  pt: {
    login: {
      title: "Entrar",
      email: { label: "Email", placeholder: "voce@exemplo.com" },
      password: { label: "Senha", placeholder: "••••••••" },
      submit: "Entrar",
      loading: "Entrando...",
      switchPrompt: "Não tem conta?",
      switchCta: "Cadastre-se",
      success: "Login realizado!",
    },
    register: {
      title: "Crie sua conta",
      name: { label: "Nome", placeholder: "Seu nome" },
      email: { label: "Email", placeholder: "voce@exemplo.com" },
      password: { label: "Senha", placeholder: "Mínimo 6 caracteres" },
      submit: "Cadastrar",
      loading: "Cadastrando...",
      switchPrompt: "Já tem conta?",
      switchCta: "Entrar",
      success: "Cadastro realizado!",
    },
  },
  en: {
    login: {
      title: "Sign in",
      email: { label: "Email", placeholder: "you@example.com" },
      password: { label: "Password", placeholder: "••••••••" },
      submit: "Sign in",
      loading: "Signing in...",
      switchPrompt: "Don't have an account?",
      switchCta: "Sign up",
      success: "Logged in!",
    },
    register: {
      title: "Create your account",
      name: { label: "Name", placeholder: "Your name" },
      email: { label: "Email", placeholder: "you@example.com" },
      password: { label: "Password", placeholder: "At least 6 characters" },
      submit: "Sign up",
      loading: "Signing up...",
      switchPrompt: "Already have an account?",
      switchCta: "Sign in",
      success: "Registered!",
    },
  },
};
