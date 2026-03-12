import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import logo from "@/assets/k9-logo.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors";

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // No recovery token, redirect
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px"
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="K9" className="h-16 w-16 rounded-2xl mx-auto mb-5 k9-glow" />
          <h1 className="text-2xl font-black tracking-tight">
            Nova <span className="text-primary">senha</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">Defina sua nova senha</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-background/50">
          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-sm font-semibold">Senha alterada com sucesso!</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecionando para o login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className={`${inputClass} pl-9 pr-9`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required minLength={6} className={`${inputClass} pl-9`} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <KeyRound className="h-3.5 w-3.5" />
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
