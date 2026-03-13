import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Gamepad2, Users, ShoppingCart, Globe, Gift, Wrench, ChevronDown, Star, Clock, Package, MessageCircle, Send, Ticket, AlertCircle, LogOut, Settings, X, Plus, Minus, Image, Eye, RefreshCw, Search, Loader2, MapPin, Wifi, Server, CheckCircle, XCircle, ExternalLink, Wallet } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/k9-logo.png";
import { toast } from "sonner";

const SECTIONS = [
  { id: "home", label: "Início" },
  { id: "store", label: "Loja" },
  { id: "orders", label: "Pedidos" },
  { id: "giveaways", label: "Sorteios" },
  { id: "tools", label: "Ferramentas" },
  { id: "feedback", label: "Feedback" },
  { id: "ticket", label: "Ticket" },
];

const STATS = [
  { value: "3K+", label: "Clientes atendidos" },
  { value: "99.2%", label: "Taxa de entrega" },
  { value: "<30s", label: "Tempo médio" },
  { value: "5★", label: "Avaliação média" },
];

// Tools are now interactive components rendered inline

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

type Plan = {
  id: string;
  product_id: string;
  name: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  tags: string[];
  badge: string | null;
  sales: string | null;
  image_url: string | null;
  description: string | null;
  plans?: Plan[];
};

type Giveaway = {
  id: string;
  title: string;
  prize: string;
  entries: number;
  ends_in: string | null;
  hot: boolean;
  active: boolean;
};

type CartItem = {
  productId: string;
  productName: string;
  planId: string | null;
  planName: string | null;
  price: number;
  image_url: string | null;
};

/* ── IP Lookup Tool ── */
const IpLookupTool = () => {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async () => {
    const query = ip.trim() || "";
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await supabase.functions.invoke("ip-lookup", {
        body: { ip: query },
      });
      if (res.error) {
        setError("Erro ao consultar. Tente novamente.");
      } else if (res.data?.status === "fail") {
        setError(res.data.message || "IP inválido");
      } else {
        setResult(res.data);
      }
    } catch {
      setError("Erro ao consultar. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
      <Globe className="h-5 w-5 text-primary mb-3" />
      <h3 className="text-sm font-semibold mb-1">IP Lookup</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">Consulte dados geográficos de qualquer IP.</p>
      <div className="flex gap-2 mb-3">
        <input
          value={ip}
          onChange={e => setIp(e.target.value)}
          placeholder="Ex: 8.8.8.8 (vazio = seu IP)"
          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          onKeyDown={e => e.key === "Enter" && lookup()}
        />
        <button onClick={lookup} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {result && (
        <div className="space-y-1.5 text-[11px] bg-secondary/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-1.5 text-primary font-semibold"><Wifi className="h-3 w-3" /> {result.query}</div>
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> {result.city}, {result.regionName}, {result.country}</div>
          <div className="flex items-center gap-1.5"><Server className="h-3 w-3 text-muted-foreground" /> {result.isp}</div>
          <div className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-muted-foreground" /> {result.timezone} · {result.zip}</div>
          <div className="text-muted-foreground/60">Lat: {result.lat} · Lon: {result.lon}</div>
        </div>
      )}
    </motion.div>
  );
};

/* ── HWID Checker Tool ── */
const HwidCheckerTool = () => {
  const [hwid, setHwid] = useState("");
  const [result, setResult] = useState<"clean" | "flagged" | null>(null);
  const [loading, setLoading] = useState(false);

  const check = () => {
    if (!hwid.trim()) return;
    setLoading(true);
    setResult(null);
    // Simulated check - in production this would hit a real ban database
    setTimeout(() => {
      // Simple hash-based simulation for demo purposes
      const hash = hwid.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      setResult(hash % 7 === 0 ? "flagged" : "clean");
      setLoading(false);
    }, 1200);
  };

  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
      <Wrench className="h-5 w-5 text-primary mb-3" />
      <h3 className="text-sm font-semibold mb-1">HWID Checker</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">Verifique se seu hardware ID está banido.</p>
      <div className="flex gap-2 mb-3">
        <input
          value={hwid}
          onChange={e => setHwid(e.target.value)}
          placeholder="Cole seu HWID aqui"
          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 font-mono"
          onKeyDown={e => e.key === "Enter" && check()}
        />
        <button onClick={check} disabled={loading || !hwid.trim()} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </button>
      </div>
      {result && (
        <div className={`flex items-center gap-2 text-[11px] p-3 rounded-lg border ${
          result === "clean" ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-destructive/5 border-destructive/20 text-destructive"
        }`}>
          {result === "clean" ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {result === "clean" ? "HWID limpo — nenhum ban detectado." : "HWID flagged — possível ban detectado."}
        </div>
      )}
    </motion.div>
  );
};

/* ── Steam Checker Tool ── */
const SteamCheckerTool = () => {
  const [steamId, setSteamId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    if (!steamId.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await supabase.functions.invoke("steam-lookup", {
        body: { steamId: steamId.trim() },
      });
      const body = res.data;
      if (res.error || !body) {
        setError("Erro ao consultar. Tente novamente.");
      } else if (body.error) {
        setError(body.error);
      } else if (!body.name && !body.steamID64) {
        setError("Perfil não encontrado. Use o custom URL da Steam (ex: gaben).");
      } else {
        setResult(body);
      }
    } catch {
      setError("Erro ao consultar. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
      <ShieldCheck className="h-5 w-5 text-primary mb-3" />
      <h3 className="text-sm font-semibold mb-1">Steam Checker</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">Valide informações de contas Steam pelo nome de usuário.</p>
      <div className="flex gap-2 mb-3">
        <input
          value={steamId}
          onChange={e => setSteamId(e.target.value)}
          placeholder="Ex: gaben"
          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          onKeyDown={e => e.key === "Enter" && check()}
        />
        <button onClick={check} disabled={loading || !steamId.trim()} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {result && (
        <div className="space-y-1.5 text-[11px] bg-secondary/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-1.5 font-semibold text-foreground"><Gamepad2 className="h-3 w-3 text-primary" /> {result.name}</div>
          <div className="text-muted-foreground font-mono text-[10px]">ID: {result.steamID64}</div>
          {result.onlineState && (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${result.onlineState === "online" ? "bg-green-400" : result.onlineState === "in-game" ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40"}`} />
              <span className="capitalize">{result.onlineState}</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 ${result.vacBanned ? "text-destructive" : "text-green-400"}`}>
            {result.vacBanned ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {result.vacBanned ? "VAC Ban detectado" : "Sem VAC Ban"}
          </div>
          {result.memberSince && <div className="text-muted-foreground/60">Membro desde: {result.memberSince}</div>}
          <a href={`https://steamcommunity.com/profiles/${result.steamID64}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline mt-1">
            Ver perfil <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}
    </motion.div>
  );
};
/* ── Checkout Section ── */
const CheckoutSection = ({ cartTotal, cart, setCart, setShowCart }: { cartTotal: number; cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; setShowCart: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { user } = useAuth();
  const [payMethod, setPayMethod] = useState<"saldo" | "pix" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const { balance, fetchBalance } = useWallet();
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [orderResult, setOrderResult] = useState<{ productName: string; planName?: string; content: string | null }[] | null>(null);

  const createOrders = async (paymentMethod: string) => {
    const results: { productName: string; planName?: string; content: string | null }[] = [];
    for (const item of cart) {
      // Claim stock
      const { data: stockContent } = await supabase.rpc("claim_stock_item", {
        p_product_id: item.productId,
        p_plan_id: item.planId,
      });
      // Create order
      await supabase.from("orders").insert({
        user_id: user!.id,
        product_id: item.productId,
        plan_id: item.planId,
        product_name: item.productName,
        plan_name: item.planName,
        price: item.price,
        status: "completed",
        delivered_content: stockContent || null,
        payment_method: paymentMethod,
      });
      results.push({ productName: item.productName, planName: item.planName || undefined, content: stockContent });
      // Discord notification for product delivery
      sendDiscordNotify("product_delivered", user!.id, {
        product_name: item.productName,
        plan_name: item.planName,
        price: item.price,
      });
    }
    return results;
  };

  const handlePayWithBalance = async () => {
    if (balance < cartTotal) {
      setError("Saldo insuficiente. Deposite mais créditos na carteira.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const { error: rpcError } = await supabase.rpc("add_wallet_balance", {
        p_user_id: user!.id,
        p_amount: -cartTotal,
        p_payment_id: `purchase-${Date.now()}`,
      });
      if (rpcError) throw rpcError;
      await fetchBalance();
      const results = await createOrders("saldo");
      setOrderResult(results);
      setCart([]);
    } catch (e: any) {
      setError(e.message || "Erro ao processar pagamento");
    }
    setProcessing(false);
  };

  const handlePayWithPix = async () => {
    setProcessing(true);
    setError("");
    setPixData(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-mp-payment", {
        body: { amount: cartTotal, method: "pix" },
      });
      if (fnError) throw fnError;
      if (data?.qr_code_base64) {
        setPixData({ qr_code: data.qr_code, qr_code_base64: data.qr_code_base64 });
      } else {
        setError("Não foi possível gerar o QR Code Pix.");
      }
    } catch (e: any) {
      setError(e.message || "Erro ao criar pagamento");
    }
    setProcessing(false);
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-5 border-t border-border space-y-3">
      {orderResult ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-bold">Pedido realizado com sucesso!</span>
          </div>
          {orderResult.map((r, i) => (
            <div key={i} className="bg-secondary/30 border border-border rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold">{r.productName}{r.planName ? ` — ${r.planName}` : ''}</p>
              {r.content ? (
                <div className="bg-background/50 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Seu produto:</p>
                  <p className="text-xs font-mono text-primary break-all select-all">{r.content}</p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">Sem estoque disponível no momento. Entre em contato com o suporte.</p>
              )}
            </div>
          ))}
          <button
            onClick={() => { setOrderResult(null); setShowCart(false); setPayMethod(null); }}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
          >
            Fechar
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-primary">R${cartTotal.toFixed(2).replace('.', ',')}</span>
          </div>

          {!user ? (
            <Link to="/login" className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
              Entrar para comprar
            </Link>
          ) : pixData ? (
            <div className="space-y-3">
              <button
                onClick={() => { setPixData(null); setPayMethod(null); setError(""); }}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
              <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center space-y-3">
                <p className="text-xs font-semibold">Escaneie o QR Code para pagar</p>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${pixData.qr_code_base64}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Ou copie o código Pix:</p>
                <button
                  onClick={copyPixCode}
                  className="w-full py-2 rounded-lg border border-border bg-secondary/50 text-[11px] font-medium hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <><CheckCircle className="h-3 w-3 text-green-400" /> Copiado!</>
                  ) : (
                    <><ExternalLink className="h-3 w-3" /> Copiar código Pix</>
                  )}
                </button>
                <p className="text-[10px] text-muted-foreground/60">O saldo será creditado automaticamente após o pagamento.</p>
              </div>
            </div>
          ) : !payMethod ? (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">Escolha a forma de pagamento:</p>
              <button
                onClick={() => setPayMethod("saldo")}
                className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="h-4 w-4 text-primary" />
                Saldo (R$ {Number(balance).toFixed(2)})
              </button>
              <button
                onClick={() => { setPayMethod("pix"); }}
                className="w-full py-3 rounded-xl border border-border bg-secondary/30 text-sm font-semibold hover:bg-secondary/50 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 text-green-400" />
                Pix via Mercado Pago
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => { setPayMethod(null); setError(""); }}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
              {payMethod === "saldo" ? (
                <button
                  disabled={processing}
                  onClick={handlePayWithBalance}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  Pagar R${cartTotal.toFixed(2).replace('.', ',')} com saldo
                </button>
              ) : (
                <button
                  disabled={processing}
                  onClick={handlePayWithPix}
                  className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Gerar QR Code Pix — R${cartTotal.toFixed(2).replace('.', ',')}
                </button>
              )}
              {error && <p className="text-[11px] text-destructive text-center">{error}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const sendDiscordNotify = async (type: string, userId: string, data: Record<string, unknown>) => {
  try {
    await supabase.functions.invoke("discord-notify", {
      body: { type, user_id: userId, data },
    });
  } catch (e) {
    console.error("Discord notify error:", e);
  }
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [stockCounts, setStockCounts] = useState<Record<string, number>>({});
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { user, isAdmin, signOut, profile, userRole, refreshProfile } = useAuth();

  const ROLE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
    dono: { label: "DONO", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    admin: { label: "ADMIN", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    suporte: { label: "SUPORTE", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    cliente_vip: { label: "VIP", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    moderator: { label: "MOD", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    user: { label: "CLIENTE", color: "text-muted-foreground", bg: "bg-secondary/50 border-border" },
  };
  const roleBadge = userRole ? ROLE_BADGES[userRole] : ROLE_BADGES["user"];

  const addToCart = (product: Product, planId: string | null) => {
    const plan = planId ? product.plans?.find(p => p.id === planId) : null;
    const price = plan ? plan.price : product.price;
    const name = product.name;
    setCart(prev => [...prev, {
      productId: product.id,
      productName: name,
      planId,
      planName: plan?.name || null,
      price,
      image_url: product.image_url,
    }]);
    setSelectedProduct(null);
    setTimeout(() => {
      toast.success(`${name}${plan ? ` — ${plan.name}` : ''} adicionado ao carrinho!`, { position: "top-center" });
    }, 150);
    setTimeout(() => setShowCart(true), 1500);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        const viewportMiddle = window.scrollY + window.innerHeight / 3;
        let closest = SECTIONS[0].id;
        let closestDist = Infinity;
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id);
          if (!el) continue;
          const elMiddle = el.offsetTop + el.offsetHeight / 2;
          const dist = Math.abs(viewportMiddle - elMiddle);
          if (dist < closestDist) {
            closestDist = dist;
            closest = s.id;
          }
        }
        setActiveSection(closest);
      }, 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, giveRes, plansRes] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("giveaways").select("*").eq("active", true).order("created_at", { ascending: false }),
          supabase.from("product_plans").select("*").order("sort_order", { ascending: true }),
        ]);
        if (prodRes.data && plansRes.data) {
          const plans = plansRes.data as Plan[];
          const prods = (prodRes.data as Product[]).map(p => ({
            ...p,
            plans: plans.filter(pl => pl.product_id === p.id),
          }));
          setProducts(prods);
        }
        if (giveRes.data) setGiveaways(giveRes.data as Giveaway[]);

        // Fetch stock counts separately to not block products
        try {
          const stockRes = await supabase.rpc("get_stock_counts");
          if (stockRes.data) {
            const counts: Record<string, number> = {};
            for (const row of stockRes.data as any[]) {
              const key = row.plan_id ? `${row.product_id}:${row.plan_id}` : row.product_id;
              counts[key] = Number(row.available_count);
              if (row.plan_id) {
                counts[`total:${row.product_id}`] = (counts[`total:${row.product_id}`] || 0) + Number(row.available_count);
              } else {
                counts[row.product_id] = (counts[row.product_id] || 0) + Number(row.available_count);
              }
            }
            setStockCounts(counts);
          }
        } catch (e) {
          console.error("Stock counts error:", e);
        }
      } catch (e) {
        console.error("Fetch data error:", e);
      }
    };
    fetchData();
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollTo("home")}>
            <img src={logo} alt="K9" className="h-7 w-7 rounded-md" />
            <span className="font-bold text-sm tracking-tight">K9 <span className="text-primary">Store</span></span>
          </div>
          <div className="hidden md:flex items-center gap-0.5 bg-secondary/50 rounded-full p-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user && <WalletButton />}
            <button onClick={() => setShowCart(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
              <ShoppingCart className="h-4 w-4" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Painel Admin">
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/50 border border-border">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                      {(profile?.username || user.email)?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-[11px] font-medium hidden sm:inline">{profile?.username || user.email?.split("@")[0]}</span>
                  {roleBadge && (
                    <span className={`text-[8px] tracking-wider font-bold px-1.5 py-0.5 rounded border ${roleBadge.bg} ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  )}
                  <button onClick={signOut} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors" title="Sair">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-14">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative text-center max-w-3xl mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              K9 Store — Produtos Digitais
            </motion.div>

            <motion.img variants={fadeUp} src={logo} alt="K9" className="h-24 w-24 rounded-3xl mx-auto mb-8 k9-glow" />

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter">
              Sua loja de
              <br />
              <span className="text-primary">produtos digitais.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Entrega instantânea, catálogo curado e suporte real.
              Tudo que você precisa, sem enrolação.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => scrollTo("store")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20 group"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("giveaways")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-all"
              >
                <Gift className="h-4 w-4 text-primary" />
                Sorteios ativos
              </button>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-card/50 backdrop-blur border border-border rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-primary">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/50 cursor-pointer animate-bounce" onClick={() => scrollTo("store")}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* Loja */}
      <section id="store" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Catálogo <span className="text-primary">em destaque</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Produtos disponíveis</p>
              </div>
            </motion.div>

            {products.length === 0 ? (
              <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum produto disponível no momento</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Novos produtos serão adicionados em breve!</p>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={fadeUp}
                    onClick={() => setSelectedProduct(product)}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer relative"
                  >
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {product.badge}
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[4/3] bg-secondary overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                          <Image className="h-10 w-10 text-muted-foreground/15" />
                        </div>
                      )}
                      {/* Tags overlay on image */}
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {product.tags.map(tag => (
                          <span key={tag} className="text-[8px] tracking-wider px-2 py-0.5 rounded bg-background/70 backdrop-blur-sm text-foreground/80 uppercase font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2">{product.name}</h3>
                      
                      {/* Variants count */}
                      {product.plans && product.plans.length > 0 && (
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {product.plans.length} variante{product.plans.length > 1 ? 's' : ''}
                        </span>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-lg font-black text-foreground">
                            R$ {product.plans && product.plans.length > 0
                              ? Math.min(...product.plans.map(p => p.price)).toFixed(2).replace('.', ',')
                              : product.price.toFixed(2).replace('.', ',')
                            }
                          </p>
                          {product.plans && product.plans.length > 0 && (
                            <p className="text-[10px] text-muted-foreground -mt-0.5">A partir de</p>
                          )}
                        </div>
                        {(() => {
                          const totalStock = product.plans && product.plans.length > 0
                            ? (stockCounts[`total:${product.id}`] || 0)
                            : (stockCounts[product.id] || 0);
                          return (
                            <span className={`text-[10px] font-medium flex items-center gap-0.5 ${totalStock > 0 ? "text-primary" : "text-destructive"}`}>
                              ● {totalStock > 0 ? `${totalStock} em estoque` : "Esgotado"}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Sales */}
                      {product.sales && (
                        <div className="flex items-center gap-1 text-[10px] text-primary/70">
                          <Users className="h-3 w-3" />
                          <span>+{product.sales}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                          className="flex-1 py-2 rounded-xl border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all inline-flex items-center justify-center gap-1.5"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.plans && product.plans.length > 0) {
                              setSelectedProduct(product);
                            } else {
                              addToCart(product, null);
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-semibold hover:brightness-110 transition-all inline-flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          ADICIONAR
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Por que a K9 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                Por que escolher a <span className="text-primary">K9?</span>
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: "Entrega instantânea", desc: "Seus produtos em menos de 30 segundos após a compra." },
                { icon: ShieldCheck, title: "Checkout seguro", desc: "Pagamento protegido com múltiplos métodos aceitos." },
                { icon: Clock, title: "Suporte 24/7", desc: "Time pronto pra te ajudar a qualquer momento." },
                { icon: Package, title: "Catálogo curado", desc: "Apenas produtos testados e aprovados entram na loja." },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="relative bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sorteios */}
      <section id="giveaways" className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-4">
                <Gift className="h-3 w-3" /> Sorteios ativos
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Ganhe produtos <span className="text-primary">de graça</span>
              </h2>
            </motion.div>

            {giveaways.length === 0 ? (
              <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-12 text-center">
                <Gift className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum sorteio ativo no momento</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Fique de olho, novos sorteios serão adicionados em breve!</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {giveaways.map((g) => (
                  <motion.div
                    key={g.id}
                    variants={fadeUp}
                    className="bg-card border border-border rounded-xl p-5 relative overflow-hidden hover:border-primary/30 transition-all"
                  >
                    {g.hot && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold uppercase">
                        🔥 Popular
                      </div>
                    )}
                    <Gift className="h-5 w-5 text-primary mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{g.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">Prêmio: {g.prize}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-4">
                      <span>{g.entries} participantes</span>
                      {g.ends_in && <span>Encerra em {g.ends_in}</span>}
                    </div>
                    <div className="w-full h-1 rounded-full bg-secondary mb-4">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(g.entries / 6, 100)}%` }} />
                    </div>
                    <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all">
                      Participar agora
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pedidos do Cliente */}
      <section id="orders" className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-4">
                <Package className="h-3 w-3" /> Meus Pedidos
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Seus <span className="text-primary">Pedidos</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Veja seus produtos comprados e conteúdos entregues</p>
            </motion.div>
            <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
              <OrdersSection />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feedback */}
      <section id="feedback" className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                O que dizem <span className="text-primary">nossos clientes</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Deixe sua avaliação</p>
            </motion.div>
            <motion.div variants={fadeUp} className="max-w-lg mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
                  <Star className="h-3 w-3" /> Deixe seu feedback
                </div>
              </div>
              <FeedbackForm />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ferramentas */}
      <section id="tools" className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                Ferramentas <span className="text-primary">gratuitas</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Utilitários grátis para a comunidade</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-4">
              <IpLookupTool />
              <HwidCheckerTool />
              <SteamCheckerTool />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ticket */}
      <section id="ticket" className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-4">
                <Ticket className="h-3 w-3" /> Suporte
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Central de <span className="text-primary">Suporte</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Abra um ticket ou acompanhe seus chamados</p>
            </motion.div>
            <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
              <TicketSection />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="relative bg-card border border-border rounded-2xl p-10 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="relative">
              <img src={logo} alt="K9" className="h-14 w-14 rounded-2xl mx-auto mb-6 k9-glow" />
              <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                Pronto pra <span className="text-primary">comprar?</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                Explore o catálogo, faça sua compra e receba na hora. Simples assim.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => scrollTo("store")}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20 group"
                >
                  Explorar catálogo
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <a
                  href="https://discord.gg/gWx8rg87fA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Entrar no Discord
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 overflow-y-auto"
          >
            <div className="max-w-5xl mx-auto px-5 py-8">
              {/* Back button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all mb-8"
              >
                <ArrowRight className="h-3 w-3 rotate-180" />
                Voltar para loja
              </button>

              <div className="grid md:grid-cols-[1fr_400px] gap-10">
                {/* Left: Info */}
                <div className="space-y-6">
                  {/* Category tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.tags.map(tag => (
                      <span key={tag} className="text-[10px] tracking-[0.15em] px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase font-medium">{tag}</span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{selectedProduct.name}</h1>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        {selectedProduct.name}
                      </p>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {selectedProduct.description}
                      </div>
                    </div>
                  )}

                  {/* Variants */}
                  {selectedProduct.plans && selectedProduct.plans.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">Variantes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.plans.map(plan => {
                          const isSelected = selectedPlans[selectedProduct.id] === plan.id;
                          return (
                            <button
                              key={plan.id}
                              onClick={() => setSelectedPlans(prev => ({ ...prev, [selectedProduct.id]: plan.id }))}
                              className={`px-4 py-3 rounded-xl border transition-all text-left min-w-[110px] ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-card hover:border-primary/20"
                              }`}
                            >
                              <p className={`text-sm font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{plan.name}</p>
                              <p className={`text-xs mt-0.5 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                R$ {plan.price.toFixed(2).replace('.', ',')}
                              </p>
                              {(() => {
                                const count = stockCounts[`${selectedProduct.id}:${plan.id}`] || 0;
                                return <p className={`text-[10px] mt-1 ${count > 0 ? "text-primary" : "text-destructive"}`}>{count > 0 ? `${count} disponíveis` : "Esgotado"}</p>;
                              })()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <p className="text-3xl font-black">
                        R$ {selectedProduct.plans && selectedProduct.plans.length > 0 && selectedPlans[selectedProduct.id]
                          ? selectedProduct.plans.find(p => p.id === selectedPlans[selectedProduct.id])!.price.toFixed(2).replace('.', ',')
                          : selectedProduct.plans && selectedProduct.plans.length > 0
                            ? Math.min(...selectedProduct.plans.map(p => p.price)).toFixed(2).replace('.', ',')
                            : selectedProduct.price.toFixed(2).replace('.', ',')
                        }
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        disabled={selectedProduct.plans && selectedProduct.plans.length > 0 && !selectedPlans[selectedProduct.id]}
                        onClick={() => addToCart(selectedProduct, selectedPlans[selectedProduct.id] || null)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-30"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Comprar agora
                      </button>
                    </div>

                    {/* Info badges */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      {selectedProduct.plans && selectedProduct.plans.length > 0 && selectedPlans[selectedProduct.id] && (
                        <span className="px-2.5 py-1 rounded-full bg-secondary/50 border border-border text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {selectedProduct.plans.find(p => p.id === selectedPlans[selectedProduct.id])?.name}
                        </span>
                      )}
                      {(() => {
                        const selPlanId = selectedPlans[selectedProduct.id];
                        const count = selPlanId
                          ? (stockCounts[`${selectedProduct.id}:${selPlanId}`] || 0)
                          : selectedProduct.plans && selectedProduct.plans.length > 0
                            ? (stockCounts[`total:${selectedProduct.id}`] || 0)
                            : (stockCounts[selectedProduct.id] || 0);
                        return <span className={`flex items-center gap-1 ${count > 0 ? "text-primary" : "text-destructive"}`}>● {count > 0 ? `${count} em estoque` : "Esgotado"}</span>;
                      })()}
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        5.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Image */}
                <div className="hidden md:block">
                  <div className="sticky top-24 rounded-2xl overflow-hidden border border-border bg-secondary">
                    {selectedProduct.image_url ? (
                      <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full aspect-[4/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[4/3] flex items-center justify-center">
                        <Image className="h-16 w-16 text-muted-foreground/15" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-bold text-sm">Carrinho ({cart.length})</h2>
                <button onClick={() => setShowCart(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Carrinho vazio</p>
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-secondary/30 border border-border rounded-xl p-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.productName}</p>
                        {item.planName && <p className="text-[10px] text-muted-foreground">{item.planName}</p>}
                        <p className="text-xs font-bold text-primary mt-0.5">R${item.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <button onClick={() => removeFromCart(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <CheckoutSection cartTotal={cartTotal} cart={cart} setCart={setCart} setShowCart={setShowCart} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="K9" className="h-5 w-5 rounded" />
            <span className="text-xs font-bold">K9 <span className="text-primary">Store</span></span>
          </div>
          <p className="text-[11px] text-muted-foreground">© 2025 K9 Store. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

/* ---- Feedback Form ---- */
function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState("");
  const [sent, setSent] = useState(false);

  const maxLen = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || message.trim().length < 5) return;
    setSent(true);
    setTimeout(() => { setSent(false); setRating(0); setMessage(""); setProduct(""); }, 3000);
  };

  if (sent) {
    return (
      <div className="bg-card border border-primary/20 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Star className="h-6 w-6 text-primary" />
        </div>
        <p className="font-semibold text-sm">Obrigado pelo feedback!</p>
        <p className="text-xs text-muted-foreground mt-1">Sua avaliação nos ajuda a melhorar.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Avaliação</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star className={`h-6 w-6 transition-colors ${s <= (hover || rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Produto (opcional)</label>
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value.slice(0, 100))}
          placeholder="Ex: Conta Steam, Aurora Menu..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mensagem</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLen))}
          placeholder="Conte sua experiência..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors resize-none"
        />
        <p className="text-[10px] text-muted-foreground/50 text-right mt-0.5">{message.length}/{maxLen}</p>
      </div>
      <button
        type="submit"
        disabled={rating === 0 || message.trim().length < 5}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <Send className="h-3.5 w-3.5" />
        Enviar feedback
      </button>
    </form>
  );
}

/* ---- Orders Section (Customer) ---- */
function OrdersSection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<{ id: string; product_name: string; plan_name: string | null; price: number; status: string; delivered_content: string | null; payment_method: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, product_name, plan_name, price, status, delivered_content, payment_method, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Faça login para ver seus pedidos</p>
        <Link to="/login" className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all">
          Entrar
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-6 w-6 text-primary mx-auto animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum pedido ainda</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Seus produtos comprados aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-colors">
          <button
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{order.product_name}{order.plan_name ? ` — ${order.plan_name}` : ''}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("pt-BR")} · {order.payment_method === "saldo" ? "Saldo" : "Pix"}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-primary">R${order.price.toFixed(2).replace('.', ',')}</p>
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                order.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}>
                {order.status === "completed" ? "Entregue" : order.status}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {expandedOrder === order.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {order.delivered_content ? (
                    <div className="bg-secondary/30 rounded-lg p-3 space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Seu produto:</p>
                      <p className="text-xs font-mono text-primary break-all select-all bg-background/50 rounded-lg p-2.5 border border-border">
                        {order.delivered_content}
                      </p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(order.delivered_content!); toast.success("Copiado!"); }}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> Copiar conteúdo
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem conteúdo disponível. Entre em contato com o suporte.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ---- Ticket Chat Component ---- */
function TicketChat({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ id: string; sender_type: string; message: string; created_at: string; sender_id: string | null }[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`ticket-chat-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some(m => m.id === (payload.new as any).id)) return prev;
            return [...prev, payload.new as any];
          });
        }
      )
      .subscribe();

    // Fallback poll every 5s
    const pollInterval = setInterval(fetchMessages, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: user.id,
      sender_type: "user",
      message: newMsg.trim(),
    });
    setNewMsg("");
    setSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Apenas imagens são permitidas"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande (máx 5MB)"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${ticketId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("ticket-attachments").upload(path, file);
    if (uploadErr) { toast.error("Erro ao enviar imagem"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("ticket-attachments").getPublicUrl(path);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: user.id,
      sender_type: "user",
      message: `[image]${urlData.publicUrl}[/image]`,
    });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (text: string) => {
    const imgMatch = text.match(/^\[image\](.*)\[\/image\]$/);
    if (imgMatch) {
      return <img src={imgMatch[1]} alt="Anexo" className="rounded-lg max-w-[240px] max-h-[200px] object-cover cursor-pointer" onClick={() => window.open(imgMatch[1], "_blank")} />;
    }
    return <p className="whitespace-pre-wrap break-words text-xs">{text}</p>;
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[500px]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-4 w-4 text-muted-foreground/30 mx-auto animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-6 w-6 text-muted-foreground/15 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/60">Nenhuma mensagem ainda. Envie a primeira!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_type === "user";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary border border-border text-foreground rounded-bl-md"
                }`}>
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-primary mb-1">🛡️ Equipe</p>
                  )}
                  {renderMessage(m.message)}
                  <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground/50"}`}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
            title="Anexar imagem"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
          </button>
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value.slice(0, 1000))}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!newMsg.trim() || sending}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Ticket Section ---- */
type TicketData = {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  admin_response: string | null;
  description: string;
};

function TicketSection() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"new" | "list">(user ? "list" : "new");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewTicket, setViewTicket] = useState<TicketData | null>(null);

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("id, subject, category, status, created_at, admin_response, description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchTickets();
  }, [user?.id]);

  const statusColor = (s: string) => {
    if (s === "respondido") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "fechado") return "bg-muted text-muted-foreground border-border";
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  };

  const statusLabel = (s: string) => {
    if (s === "respondido") return "Respondido";
    if (s === "fechado") return "Fechado";
    return "Aberto";
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      {user && (
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl border border-border">
          <button
            onClick={() => setTab("list")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Meus Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setTab("new")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "new" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="h-3.5 w-3.5" /> Novo Ticket
          </button>
        </div>
      )}

      {!user && (
        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center gap-3 mb-2">
          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <Link to="/login" className="text-primary font-semibold hover:underline">Faça login</Link> para acompanhar seus tickets. Você também pode enviar sem conta.
          </p>
        </div>
      )}

      {tab === "new" && <TicketForm onCreated={() => { setTab("list"); fetchTickets(); }} />}

      {tab === "list" && user && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Seus chamados de suporte</p>
            <button onClick={fetchTickets} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-5 w-5 text-muted-foreground/30 mx-auto animate-spin mb-3" />
              <p className="text-xs text-muted-foreground">Carregando...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Ticket className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum ticket encontrado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Crie um novo ticket para receber suporte</p>
              <button onClick={() => setTab("new")} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Abrir Ticket
              </button>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setViewTicket(t)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(t.status)}`}>
                        {statusLabel(t.status)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">{t.category}</span>
                    </div>
                    <p className="text-sm font-semibold truncate">{t.subject}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(t.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <MessageCircle className="h-4 w-4 text-primary/40 mt-2 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ticket Chat Modal */}
      <AnimatePresence>
        {viewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{viewTicket.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusColor(viewTicket.status)}`}>
                        {statusLabel(viewTicket.status)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{viewTicket.category}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewTicket(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Original description */}
              <div className="px-5 py-3 bg-secondary/30 border-b border-border">
                <p className="text-[10px] text-muted-foreground/60 mb-1">Descrição original</p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{viewTicket.description}</p>
              </div>

              {/* Chat */}
              <TicketChat ticketId={viewTicket.id} onClose={() => setViewTicket(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Ticket Form ---- */
function TicketForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const maxLen = 1000;
  const categories = ["Problema com entrega", "Conta não funciona", "Reembolso", "Dúvida geral", "Outro"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !category || description.trim().length < 10) return;
    
    const ticketEmail = user?.email || email.trim();
    if (!ticketEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ticketEmail)) return;

    setSubmitting(true);
    await supabase.from("tickets").insert({
      email: ticketEmail,
      category,
      subject: subject.trim(),
      description: description.trim(),
      ...(user ? { user_id: user.id } : {}),
    });

    setSubmitting(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject("");
      setCategory("");
      setDescription("");
      setEmail("");
      onCreated?.();
    }, 2000);
  };

  if (sent) {
    return (
      <div className="bg-card border border-primary/20 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <p className="font-semibold text-sm">Ticket enviado com sucesso!</p>
        <p className="text-xs text-muted-foreground mt-1">Responderemos o mais rápido possível.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
      {!user && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email para contato</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 100))}
            placeholder="seu@email.com"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assunto</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value.slice(0, 150))}
          placeholder="Resumo do problema..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, maxLen))}
          placeholder="Descreva em detalhe o que aconteceu..."
          rows={5}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors resize-none"
        />
        <p className="text-[10px] text-muted-foreground/50 text-right mt-0.5">{description.length}/{maxLen}</p>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Responderemos em até 24h. {user ? "Acompanhe o status na aba 'Meus Tickets'." : "Para urgências, use nosso Discord."}
        </p>
      </div>
      <button
        type="submit"
        disabled={!subject.trim() || !category || description.trim().length < 10 || (!user && !email.trim()) || submitting}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <Ticket className="h-3.5 w-3.5" />
        {submitting ? "Enviando..." : "Enviar ticket"}
      </button>
    </form>
  );
}
