import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Gamepad2, Users, ShoppingCart, Globe, Gift, Wrench, ChevronDown, Star, Clock, Package, MessageCircle } from "lucide-react";
import logo from "@/assets/k9-logo.png";

const SECTIONS = [
  { id: "home", label: "Início" },
  { id: "store", label: "Loja" },
  { id: "giveaways", label: "Sorteios" },
  { id: "tools", label: "Ferramentas" },
];

const PRODUCTS = [
  { name: "Conta Hytale", price: "R$25,00", tags: ["HYTALE", "SANDBOX"], badge: "3 variantes", sales: "1.2k vendas" },
  { name: "Conta Steam", price: "R$15,00", tags: ["STEAM", "FIVEM"], badge: "5+ jogos", sales: "3.8k vendas" },
  { name: "RedEngine Spoofer", price: "R$45,00", tags: ["FIVEM", "SPOOFER"], badge: "Vitalício", sales: "890 vendas" },
  { name: "Aurora Menu", price: "R$89,00", tags: ["FIVEM", "MOD MENU"], badge: "Exclusivo", sales: "2.1k vendas" },
  { name: "Conta Rockstar", price: "R$30,00", tags: ["GTA", "RDR2"], badge: "Full Access", sales: "1.5k vendas" },
  { name: "Discord Nitro", price: "R$19,00", tags: ["DISCORD", "BOOST"], badge: "1 mês", sales: "4.2k vendas" },
];

const STATS = [
  { value: "50k+", label: "Clientes atendidos" },
  { value: "99.2%", label: "Taxa de entrega" },
  { value: "<30s", label: "Tempo médio" },
  { value: "4.9★", label: "Avaliação média" },
];

const REVIEWS = [
  { text: "Essa loja é boa pra caralho", user: "deuszeus", product: "Avaliação geral", rating: 5 },
  { text: "VEIO COM RED DEAD 2, MUITO OBRIGADOOOOO", user: "GuaxinimLoco", product: "Steam p/ Fivem", rating: 5 },
  { text: "Legalzin a steam, entrega rápida demais", user: "deuszeus", product: "Steam p/ Fivem", rating: 5 },
  { text: "Mt bom esse spoofer, recomendo", user: "deuszeus", product: "RedEngine Spoofer", rating: 5 },
  { text: "Melhor loja que já comprei, entrega instantânea", user: "RafaGamer", product: "Conta Hytale", rating: 5 },
  { text: "Suporte top, resolveram tudo rápido", user: "PedroMods", product: "Aurora Menu", rating: 4 },
];

const GIVEAWAYS = [
  { title: "Sorteio Conta Steam", entries: 342, endsIn: "2 dias", prize: "Steam Full Access", hot: true },
  { title: "RedEngine Lifetime", entries: 128, endsIn: "5 dias", prize: "Spoofer Vitalício", hot: false },
  { title: "Hytale Cursebreaker", entries: 567, endsIn: "1 dia", prize: "Conta Cursebreaker", hot: true },
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

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

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
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all">
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-14">
        {/* Grid BG */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative text-center max-w-3xl mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Mais de 50.000 clientes atendidos
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
                <p className="text-sm text-muted-foreground mt-1">Produtos mais vendidos da semana</p>
              </div>
              <button className="hidden md:inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </button>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map((product, i) => (
                <motion.div
                  key={product.name}
                  variants={fadeUp}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{product.sales}</span>
                  </div>
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">{tag}</span>
                    ))}
                    <span className="text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{product.badge}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">{product.price}</p>
                    <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:brightness-110 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
                      Comprar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof ticker */}
      <section className="py-6 border-y border-border bg-card/30">
        <div className="overflow-hidden">
          <div className="flex animate-scroll-left whitespace-nowrap" style={{ width: "200%" }}>
            {[...Array(2)].map((_, dupi) => (
              <div key={dupi} className="flex items-center gap-8 px-4">
                {REVIEWS.map((r, i) => (
                  <div key={`${dupi}-${i}`} className="inline-flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                      {r.user[0]}
                    </div>
                    <span className="text-muted-foreground">"{r.text}"</span>
                    <span className="text-primary text-xs">— {r.user}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
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
              ].map(({ icon: Icon, title, desc }, i) => (
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
            <div className="grid md:grid-cols-3 gap-4">
              {GIVEAWAYS.map((g, i) => (
                <motion.div
                  key={i}
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
                    <span>Encerra em {g.endsIn}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1 rounded-full bg-secondary mb-4">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(g.entries / 6, 100)}%` }} />
                  </div>
                  <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all">
                    Participar agora
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Avaliações */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                O que dizem <span className="text-primary">nossos clientes</span>
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REVIEWS.map((r, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 leading-relaxed">"{r.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {r.user[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{r.user}</p>
                      <p className="text-[10px] text-muted-foreground">{r.product}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
                  href="https://discord.gg/"
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
