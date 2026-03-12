import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import logo from "@/assets/k9-logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Verifique seu email para confirmar a conta.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="K9" className="h-14 w-14 rounded-2xl mx-auto mb-4 k9-glow" />
          <h1 className="text-xl font-bold">
            {isSignUp ? "Criar conta" : "Entrar no"} <span className="text-primary">Admin</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isSignUp ? "Crie sua conta para acessar" : "Acesse o painel administrativo"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              {message}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {loading ? "Carregando..." : isSignUp ? "Criar conta" : "Entrar"}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }} className="text-primary hover:underline">
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Voltar à loja
          </button>
        </div>
      </div>
    </div>
  );
}
