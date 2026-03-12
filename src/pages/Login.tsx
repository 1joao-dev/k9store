import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, AlertCircle, Eye, EyeOff, LogIn, UserPlus, KeyRound, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import logo from "@/assets/k9-logo.png";

type View = "login" | "signup" | "forgot";

export default function Login() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors";

  const switchView = (v: View) => {
    setView(v);
    setError("");
    setMessage("");
  };

  // Debounced username availability check
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // Validate: only letters, numbers, underscores
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_username_available", { p_username: trimmed });
      if (!error) {
        setUsernameStatus(data ? "available" : "taken");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/admin");
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError("Nome de usuário deve ter pelo menos 3 caracteres.");
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Nome de usuário só pode ter letras, números e _");
      setLoading(false);
      return;
    }
    if (usernameStatus === "taken") {
      setError("Esse nome de usuário já está em uso.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: trimmedUsername },
      },
    });
    if (error) setError(error.message);
    else setMessage("Verifique seu email para confirmar a conta.");
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setMessage("Email de recuperação enviado! Verifique sua caixa de entrada.");
    setLoading(false);
  };

  const titles: Record<View, { title: string; subtitle: string }> = {
    login: { title: "Bem-vindo de volta", subtitle: "Entre na sua conta K9 Store" },
    signup: { title: "Criar conta", subtitle: "Registre-se na K9 Store" },
    forgot: { title: "Esqueceu a senha?", subtitle: "Enviaremos um link de recuperação" },
  };

  const usernameIcon = {
    idle: null,
    checking: <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />,
    available: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
    taken: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px"
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img src={logo} alt="K9" className="h-16 w-16 rounded-2xl mx-auto mb-5 k9-glow" />
          <h1 className="text-2xl font-black tracking-tight">
            {titles[view].title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-primary">{titles[view].title.split(" ").slice(-1)}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">{titles[view].subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-background/50">
          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive mb-4">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary mb-4">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              {message}
            </motion.div>
          )}

          {/* Login Form */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className={`${inputClass} pl-9`} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Senha</label>
                  <button type="button" onClick={() => switchView("forgot")} className="text-[10px] text-primary hover:underline">
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={`${inputClass} pl-9 pr-9`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <LogIn className="h-3.5 w-3.5" />
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] text-muted-foreground/50">ou</span></div>
              </div>
              <button type="button" onClick={() => switchView("signup")} className="w-full py-2.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-all inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                <UserPlus className="h-3.5 w-3.5" />
                Criar uma conta
              </button>
            </form>
          )}

          {/* Signup Form */}
          {view === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome de usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
                    placeholder="seu_username"
                    required
                    minLength={3}
                    maxLength={20}
                    className={`${inputClass} pl-9 pr-9 ${
                      usernameStatus === "available" ? "border-primary/40" :
                      usernameStatus === "taken" ? "border-destructive/40" : ""
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameIcon[usernameStatus]}
                  </div>
                </div>
                <p className={`text-[10px] mt-1 ${
                  usernameStatus === "available" ? "text-primary" :
                  usernameStatus === "taken" ? "text-destructive" :
                  "text-muted-foreground/50"
                }`}>
                  {usernameStatus === "checking" && "Verificando..."}
                  {usernameStatus === "available" && "✓ Disponível!"}
                  {usernameStatus === "taken" && "✗ Já está em uso"}
                  {usernameStatus === "idle" && username.length > 0 && username.length < 3 && "Mínimo 3 caracteres"}
                  {usernameStatus === "idle" && username.length === 0 && "Letras, números e _ (3-20 caracteres)"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className={`${inputClass} pl-9`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className={`${inputClass} pl-9 pr-9`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || usernameStatus === "taken" || usernameStatus === "checking" || username.trim().length < 3}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {loading ? "Criando..." : "Criar conta"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Já tem conta?{" "}
                <button type="button" onClick={() => switchView("login")} className="text-primary hover:underline font-medium">Entrar</button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email da conta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className={`${inputClass} pl-9`} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <KeyRound className="h-3.5 w-3.5" />
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Lembrou a senha?{" "}
                <button type="button" onClick={() => switchView("login")} className="text-primary hover:underline font-medium">Voltar ao login</button>
              </p>
            </form>
          )}
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Voltar à loja
          </button>
        </div>
      </motion.div>
    </div>
  );
}
