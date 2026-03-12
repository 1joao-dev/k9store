import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Gamepad2, Users, ShoppingCart, Globe, Gift, Wrench, ChevronDown, Star, Clock, Package, MessageCircle, Send, Ticket, AlertCircle, LogOut, Settings, X, Plus, Minus, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/k9-logo.png";

const SECTIONS = [
  { id: "home", label: "Início" },
  { id: "store", label: "Loja" },
  { id: "giveaways", label: "Sorteios" },
  { id: "tools", label: "Ferramentas" },
  { id: "feedback", label: "Feedback" },
  { id: "ticket", label: "Ticket" },
];

const STATS = [
  { value: "0", label: "Clientes atendidos" },
  { value: "99.2%", label: "Taxa de entrega" },
  { value: "<30s", label: "Tempo médio" },
  { value: "5★", label: "Avaliação média" },
];

const TOOLS_LIST = [
  { name: "HWID Checker", desc: "Verifique se seu hardware ID está banido.", icon: Wrench },
  { name: "Steam Checker", desc: "Valide informações de contas Steam.", icon: ShieldCheck },
  { name: "IP Lookup", desc: "Consulte dados geográficos de qualquer IP.", icon: Globe },
];

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

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { user, isAdmin, signOut, profile } = useAuth();

  const addToCart = (product: Product, planId: string | null) => {
    const plan = planId ? product.plans?.find(p => p.id === planId) : null;
    const price = plan ? plan.price : product.price;
    setCart(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      planId,
      planName: plan?.name || null,
      price,
      image_url: product.image_url,
    }]);
    setSelectedProduct(null);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, []);

  const scrollTo = (id: string) => {
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
                    <div className="relative w-full h-48 bg-secondary overflow-hidden">
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
                        <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">● Disponíveis</span>
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
              {TOOLS_LIST.map((tool, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors group">
                  <tool.icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="text-sm font-semibold mb-1">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{tool.desc}</p>
                  <button className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium hover:bg-secondary transition-colors">
                    Usar agora
                  </button>
                </motion.div>
              ))}
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
                Abrir um <span className="text-primary">Ticket</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Precisa de ajuda? Envie seu problema</p>
            </motion.div>
            <motion.div variants={fadeUp} className="max-w-lg mx-auto">
              <TicketForm />
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Image */}
              {selectedProduct.image_url ? (
                <div className="w-full h-56 bg-secondary overflow-hidden">
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-56 bg-secondary/50 flex items-center justify-center">
                  <Image className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedProduct.tags.map(tag => (
                        <span key={tag} className="text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">{tag}</span>
                      ))}
                      {selectedProduct.badge && (
                        <span className="text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{selectedProduct.badge}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedProduct.sales && (
                  <p className="text-xs text-muted-foreground">{selectedProduct.sales}</p>
                )}

                {/* Plans selection */}
                {selectedProduct.plans && selectedProduct.plans.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">Selecione um plano:</p>
                    <div className="grid gap-2">
                      {selectedProduct.plans.map(plan => {
                        const isSelected = selectedPlans[selectedProduct.id] === plan.id;
                        return (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlans(prev => ({ ...prev, [selectedProduct.id]: plan.id }))}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                                : "border-border bg-secondary/30 hover:border-primary/20"
                            }`}
                          >
                            <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{plan.name}</span>
                            <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                              R${plan.price.toFixed(2).replace('.', ',')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      disabled={!selectedPlans[selectedProduct.id]}
                      onClick={() => addToCart(selectedProduct, selectedPlans[selectedProduct.id])}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-30 inline-flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar ao carrinho
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-2xl font-bold text-primary">R${selectedProduct.price.toFixed(2).replace('.', ',')}</p>
                    <button
                      onClick={() => addToCart(selectedProduct, null)}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all inline-flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar ao carrinho
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
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
                <div className="p-5 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">R${cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
                    Finalizar compra
                  </button>
                </div>
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

/* ---- Ticket Form ---- */
function TicketForm() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const maxLen = 1000;
  const categories = ["Problema com entrega", "Conta não funciona", "Reembolso", "Dúvida geral", "Outro"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !category || description.trim().length < 10 || !email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    
    await supabase.from("tickets").insert({
      email: email.trim(),
      category,
      subject: subject.trim(),
      description: description.trim(),
    });
    
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(""); setCategory(""); setDescription(""); setEmail(""); }, 4000);
  };

  if (sent) {
    return (
      <div className="bg-card border border-primary/20 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <p className="font-semibold text-sm">Ticket enviado com sucesso!</p>
        <p className="text-xs text-muted-foreground mt-1">Responderemos o mais rápido possível pelo email informado.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
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
          Responderemos em até 24h pelo email informado. Para urgências, use nosso Discord.
        </p>
      </div>
      <button
        type="submit"
        disabled={!subject.trim() || !category || description.trim().length < 10 || !email.trim()}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <Ticket className="h-3.5 w-3.5" />
        Enviar ticket
      </button>
    </form>
  );
}
