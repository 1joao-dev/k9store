import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, Zap, Gamepad2, Users, TrendingUp, Award, ShoppingCart, Globe, Gift, Wrench } from "lucide-react";
// K9 branding logo
import logo from "@/assets/k9-logo.png";

const SECTIONS = [
  { id: "home", label: "Início" },
  { id: "store", label: "Loja" },
  { id: "giveaways", label: "Sorteios" },
  { id: "tools", label: "Ferramentas" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Checkout protegido", desc: "Um fluxo seguro de compra e entrega construído para consistência, do pagamento ao inventário privado." },
  { icon: Zap, title: "Entrega automatizada", desc: "Pedidos são processados por um fluxo rápido e estruturado que reduz a fricção após a compra." },
  { icon: Gamepad2, title: "Catálogo multi-jogos", desc: "Produtos digitais, ferramentas e itens de acesso selecionados pela demanda nos principais ecossistemas de jogos." },
  { icon: Users, title: "Comunidade ativa", desc: "Atualizações, suporte e feedback real que continuam melhorando a experiência do cliente." },
  { icon: TrendingUp, title: "Atualizações de mercado", desc: "Disponibilidade, preços e composição do catálogo evoluem continuamente com o movimento real do mercado." },
  { icon: Award, title: "Curadoria de qualidade", desc: "Listagens e parceiros são revisados com um padrão rigoroso antes de entrar na vitrine." },
];

const REVIEWS = [
  { product: "Avaliação da loja", date: "02/21", text: "Essa loja é boa pra caralho", user: "deuszeus" },
  { product: "Steam Para Fivem", date: "03/01", text: "VEIO COM RED DEAD 2, MUITO OBRIGADOOOOO", user: "GuaxinimLoco" },
  { product: "Steam Para Fivem", date: "02/21", text: "Legalzin a steam", user: "deuszeus" },
  { product: "RedEngine Spoofer Semanal", date: "02/21", text: "zzzz", user: "deuszeus" },
  { product: "RedEngine Spoofer Lifetime", date: "02/21", text: "Mt bom esse spoofer", user: "deuszeus" },
];

const COUNTRIES = [
  "Brasil", "Portugal", "EUA", "Alemanha", "Rússia", "Chile", "Peru", "Irlanda",
  "Singapura", "Argentina", "Colômbia", "Venezuela", "Turquia", "Hungria", "Irã",
  "Espanha", "Rep. Dominicana", "México"
];

const GIVEAWAYS = [
  { title: "Sorteio de Conta Steam", entries: 342, endsIn: "2 dias", prize: "Steam Full Access" },
  { title: "RedEngine Lifetime", entries: 128, endsIn: "5 dias", prize: "Spoofer Lifetime Key" },
  { title: "Hytale Cursebreaker", entries: 567, endsIn: "1 dia", prize: "Conta Hytale Cursebreaker" },
];

const TOOLS_LIST = [
  { name: "HWID Checker", desc: "Verifique seu hardware ID rapidamente para saber se está banido.", icon: Wrench },
  { name: "Steam Account Checker", desc: "Valide informações e jogos de contas Steam em segundos.", icon: ShieldCheck },
  { name: "IP Lookup", desc: "Consulte informações geográficas e ISP de qualquer endereço IP.", icon: Globe },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));
      const scrollY = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].el;
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <img src={logo} alt="K9" className="h-8 w-8 rounded-lg cursor-pointer" onClick={() => scrollTo("home")} />
          <div className="hidden md:flex items-center gap-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              BRL
            </div>
            <button className="px-5 py-2 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* Início / Hero */}
      <section id="home" className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <img src={logo} alt="K9" className="h-20 w-20 rounded-2xl mb-8 k9-glow" />
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              K9 Store{" "}
              <br />
              <span className="text-primary">feita pra quem leva a sério.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              <span className="text-primary font-medium">Uma operação premium escalada para um público global</span>{" "}
              com produtos digitais curados, entrega automatizada e evolução constante do catálogo baseada em demanda real.
            </p>
            <button
              onClick={() => scrollTo("store")}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-all group"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-md aspect-video rounded-2xl bg-card border border-border overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Prévia do vídeo</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Aurora Menu 2.0</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground cursor-pointer" onClick={() => scrollTo("store")}>
          <span className="text-xs tracking-[0.3em] uppercase">Role para ver mais</span>
          <div className="w-px h-8 bg-border" />
        </div>
      </section>

      {/* Loja */}
      <section id="store" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Projetado para<br />
            <span className="text-primary">inventário digital de alta demanda</span>.
          </h2>
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { name: "Conta Hytale", price: "R$25,00", tags: ["HYTALE", "HYPIXEL", "SANDBOX"], badge: "3 variantes" },
              { name: "Conta Steam", price: "R$15,00", tags: ["STEAM", "FIVEM", "JOGOS"], badge: "5+ jogos" },
              { name: "RedEngine Spoofer", price: "R$45,00", tags: ["FIVEM", "SPOOFER", "TOOL"], badge: "Semanal/Vitalício" },
            ].map((product) => (
              <div key={product.name} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all hover:k9-glow">
                <div className="aspect-square rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">
                      {tag}
                    </span>
                  ))}
                  <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                    {product.badge}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{product.price}</p>
                    <p className="text-xs text-muted-foreground">A partir de</p>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confiança / Avatares */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Confiança de<br />
            <span className="text-primary">clientes em escala.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Mais de 50.000 clientes já usaram a K9 Store. Essa confiança é construída com entrega confiável, operações disciplinadas e um catálogo que acompanha a demanda real do mercado.
          </p>
          <div className="mt-12 overflow-hidden">
            <div className="flex animate-scroll-left" style={{ width: "200%" }}>
              {[...Array(60)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-border mx-1.5"
                  style={{ opacity: 0.4 + Math.random() * 0.6 }}
                />
              ))}
              {[...Array(60)].map((_, i) => (
                <div
                  key={`dup-${i}`}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-border mx-1.5"
                  style={{ opacity: 0.4 + Math.random() * 0.6 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sorteios */}
      <section id="giveaways" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Sorteios<br />
            <span className="text-primary">Ativos</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Participe dos sorteios ativos e ganhe produtos digitais premium gratuitamente.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {GIVEAWAYS.map((giveaway, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">Sorteio</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{giveaway.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">Prêmio: {giveaway.prize}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{giveaway.entries} participantes</span>
                  <span>Encerra em {giveaway.endsIn}</span>
                </div>
                <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  Participar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avaliações */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Precisa de mais certeza?<br />
            <span className="text-primary">Veja o que os clientes dizem.</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Feedback de clientes reais que compram na K9 Store e voltam pela confiabilidade, velocidade e execução.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-primary font-medium">{review.product}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-foreground mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {review.user[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user}</p>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ferramentas */}
      <section id="tools" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Ferramentas<br />
            <span className="text-primary">Gratuitas</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Ferramentas gratuitas para ajudar no seu dia a dia.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {TOOLS_LIST.map((tool, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-colors">
                <tool.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-base font-semibold mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                <button className="mt-4 px-4 py-2 rounded-full border border-border text-xs font-medium hover:bg-secondary transition-colors">
                  Usar ferramenta
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presença Global */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Posicionada para o<br />
            <span className="text-primary">mercado global.</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A K9 Store atende clientes em diversas regiões com suporte multilíngue, entrega automatizada e um catálogo projetado para a demanda real.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {COUNTRIES.map(c => (
              <span key={c} className="px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button
              onClick={() => scrollTo("store")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity group"
            >
              Ver todos os produtos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="K9" className="h-6 w-6 rounded-md" />
            <span className="text-sm font-semibold">K9 Store</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 K9 Store. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
