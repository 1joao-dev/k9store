import { ArrowRight, ShieldCheck, Zap, Gamepad2, Users, TrendingUp, Award, ShoppingCart, Globe } from "lucide-react";
// K9 branding logo
import logo from "@/assets/k9-logo.png";

const NAV_ITEMS = ["Home", "Store", "Giveaways", "Tools"];

const FEATURES = [
  { icon: ShieldCheck, title: "Protected checkout", desc: "A secure purchase and delivery flow built for consistency from payment to private inventory." },
  { icon: Zap, title: "Automated fulfillment", desc: "Orders are processed through a fast, structured flow that reduces friction after checkout." },
  { icon: Gamepad2, title: "Curated multi-game catalog", desc: "Digital products, tools and access items selected around demand across major gaming ecosystems." },
  { icon: Users, title: "Active community channels", desc: "Updates, support and real feedback continue to improve the customer experience after launch." },
  { icon: TrendingUp, title: "Market-aligned updates", desc: "Availability, pricing and catalog composition evolve continuously with real market movement." },
  { icon: Award, title: "Quality-first curation", desc: "Listings and partners are reviewed with a serious standard before entering the storefront." },
];

const REVIEWS = [
  { product: "Store review", date: "02/21", text: "Essa loja é boa pra caralho", user: "deuszeus" },
  { product: "Steam Para Fivem", date: "03/01", text: "VEIO COM RED DEAD 2, MUITO OBRIGADOOOOO", user: "GuaxinimLoco" },
  { product: "Steam Para Fivem", date: "02/21", text: "Legalzin a steam", user: "deuszeus" },
  { product: "RedEngine Spoofer Semanal", date: "02/21", text: "zzzz", user: "deuszeus" },
  { product: "RedEngine Spoofer Lifetime", date: "02/21", text: "Mt bom esse spoofer", user: "deuszeus" },
];

const COUNTRIES = [
  "Brasil", "Portugal", "EUA", "Alemanha", "Rusia", "Chile", "Peru", "Irlanda",
  "Singapur", "Argentina", "Colombia", "Venezuela", "Turquia", "Hungria", "Iran",
  "Espanha", "DOM", "Mexico"
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <img src={logo} alt="K9" className="h-8 w-8 rounded-lg" />
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              USD
            </div>
            <button className="px-5 py-2 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <img src={logo} alt="K9" className="h-20 w-20 rounded-2xl mb-8 zeus-glow" />
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              K9 Store{" "}
              <br />
              <span className="text-primary">built for serious buyers.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              <span className="text-primary font-medium">A premium operation scaled for a global audience</span>{" "}
              with curated digital products, automated delivery and constant catalog evolution driven by real demand.
            </p>
            <button className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-all group">
              Browse catalog
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-md aspect-video rounded-2xl bg-card border border-border overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Video preview</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Aurora Menu 2.0</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs tracking-[0.3em] uppercase">Scroll to see more</span>
          <div className="w-px h-8 bg-border" />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Engineered for<br />
            <span className="text-primary">high-demand digital inventory</span>.
          </h2>
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { name: "Hytale Account", price: "$4.54", tags: ["HYTALE", "HYPIXEL", "SANDBOX"], badge: "3 variants" },
              { name: "Steam Account", price: "$2.99", tags: ["STEAM", "FIVEM", "GAMES"], badge: "5+ games" },
              { name: "RedEngine Spoofer", price: "$8.00", tags: ["FIVEM", "SPOOFER", "TOOL"], badge: "Weekly/Lifetime" },
            ].map((product) => (
              <div key={product.name} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all hover:zeus-glow">
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
                    <p className="text-xs text-muted-foreground">Starting at</p>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Avatars Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Trusted by<br />
            <span className="text-primary">customers at scale.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            More than 50,000 customers have used K9 Store. That trust is built on reliable delivery, disciplined operations and a catalog that moves with real market demand.
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

      {/* Features */}
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

      {/* Reviews */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Need more certainty?<br />
            <span className="text-primary">See what customers say.</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Feedback from real customers who buy through K9 Store and return for reliability, speed and execution.
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
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Positioned for the<br />
            <span className="text-primary">global market.</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            K9 Store serves customers across regions with multilingual support, automated delivery and a catalog designed around live demand.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {COUNTRIES.map(c => (
              <span key={c} className="px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity group">
              Browse all products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="K9" className="h-6 w-6 rounded-md" />
            <span className="text-sm font-semibold">K9 Store</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 K9 Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
