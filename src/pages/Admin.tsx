import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, Package, Gift, ArrowLeft, Save, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/k9-logo.png";

type Product = {
  id: string;
  name: string;
  price: number;
  tags: string[];
  badge: string | null;
  sales: string | null;
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

export default function Admin() {
  const [tab, setTab] = useState<"products" | "giveaways">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pTags, setPTags] = useState("");
  const [pBadge, setPBadge] = useState("");
  const [pSales, setPSales] = useState("");

  // Giveaway form
  const [showGiveawayForm, setShowGiveawayForm] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [gTitle, setGTitle] = useState("");
  const [gPrize, setGPrize] = useState("");
  const [gEntries, setGEntries] = useState("");
  const [gEndsIn, setGEndsIn] = useState("");
  const [gHot, setGHot] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [p, g] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("giveaways").select("*").order("created_at", { ascending: false }),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (g.data) setGiveaways(g.data as Giveaway[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Product CRUD
  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setPName(product.name);
      setPPrice(String(product.price));
      setPTags(product.tags.join(", "));
      setPBadge(product.badge || "");
      setPSales(product.sales || "");
    } else {
      setEditingProduct(null);
      setPName(""); setPPrice(""); setPTags(""); setPBadge(""); setPSales("");
    }
    setShowProductForm(true);
  };

  const saveProduct = async () => {
    if (!pName.trim() || !pPrice.trim()) return;
    const data = {
      name: pName.trim(),
      price: parseFloat(pPrice),
      tags: pTags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
      badge: pBadge.trim() || null,
      sales: pSales.trim() || null,
    };
    if (editingProduct) {
      await supabase.from("products").update(data).eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert(data);
    }
    setShowProductForm(false);
    fetchAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Deletar este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchAll();
  };

  // Giveaway CRUD
  const openGiveawayForm = (giveaway?: Giveaway) => {
    if (giveaway) {
      setEditingGiveaway(giveaway);
      setGTitle(giveaway.title);
      setGPrize(giveaway.prize);
      setGEntries(String(giveaway.entries));
      setGEndsIn(giveaway.ends_in || "");
      setGHot(giveaway.hot);
    } else {
      setEditingGiveaway(null);
      setGTitle(""); setGPrize(""); setGEntries("0"); setGEndsIn(""); setGHot(false);
    }
    setShowGiveawayForm(true);
  };

  const saveGiveaway = async () => {
    if (!gTitle.trim() || !gPrize.trim()) return;
    const data = {
      title: gTitle.trim(),
      prize: gPrize.trim(),
      entries: parseInt(gEntries) || 0,
      ends_in: gEndsIn.trim() || null,
      hot: gHot,
      active: true,
    };
    if (editingGiveaway) {
      await supabase.from("giveaways").update(data).eq("id", editingGiveaway.id);
    } else {
      await supabase.from("giveaways").insert(data);
    }
    setShowGiveawayForm(false);
    fetchAll();
  };

  const deleteGiveaway = async (id: string) => {
    if (!confirm("Deletar este sorteio?")) return;
    await supabase.from("giveaways").delete().eq("id", id);
    fetchAll();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <img src={logo} alt="K9" className="h-6 w-6 rounded" />
            <span className="font-bold text-sm">Painel <span className="text-primary">Admin</span></span>
          </div>
          <div className="flex gap-1 bg-secondary/50 rounded-full p-1">
            <button
              onClick={() => setTab("products")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                tab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-3 w-3" /> Produtos
            </button>
            <button
              onClick={() => setTab("giveaways")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                tab === "giveaways" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gift className="h-3 w-3" /> Sorteios
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold">Produtos</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{products.length} produto(s) cadastrado(s)</p>
              </div>
              <button
                onClick={() => openProductForm()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold">{editingProduct ? "Editar Produto" : "Novo Produto"}</h2>
                    <button onClick={() => setShowProductForm(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nome *</label>
                    <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Ex: Conta Steam" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Preço (R$) *</label>
                    <input type="number" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="25.00" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tags (separadas por vírgula)</label>
                    <input value={pTags} onChange={e => setPTags(e.target.value)} placeholder="STEAM, FIVEM" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Badge</label>
                    <input value={pBadge} onChange={e => setPBadge(e.target.value)} placeholder="Ex: Vitalício, Exclusivo" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Vendas</label>
                    <input value={pSales} onChange={e => setPSales(e.target.value)} placeholder="Ex: 1.2k vendas" className={inputClass} />
                  </div>
                  <button
                    onClick={saveProduct}
                    disabled={!pName.trim() || !pPrice.trim()}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {editingProduct ? "Salvar alterações" : "Adicionar produto"}
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-12">Carregando...</div>
            ) : products.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhum produto cadastrado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Adicionar" para criar o primeiro produto</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                        <span className="text-xs font-bold text-primary">R${p.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags.map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">{t}</span>
                        ))}
                        {p.badge && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{p.badge}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openProductForm(p)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Giveaways Tab */}
        {tab === "giveaways" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold">Sorteios</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{giveaways.length} sorteio(s) cadastrado(s)</p>
              </div>
              <button
                onClick={() => openGiveawayForm()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </button>
            </div>

            {/* Giveaway Form Modal */}
            {showGiveawayForm && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold">{editingGiveaway ? "Editar Sorteio" : "Novo Sorteio"}</h2>
                    <button onClick={() => setShowGiveawayForm(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Título *</label>
                    <input value={gTitle} onChange={e => setGTitle(e.target.value)} placeholder="Ex: Sorteio Conta Steam" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Prêmio *</label>
                    <input value={gPrize} onChange={e => setGPrize(e.target.value)} placeholder="Ex: Steam Full Access" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Participantes</label>
                    <input type="number" value={gEntries} onChange={e => setGEntries(e.target.value)} placeholder="0" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Encerra em</label>
                    <input value={gEndsIn} onChange={e => setGEndsIn(e.target.value)} placeholder="Ex: 2 dias" className={inputClass} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={gHot} onChange={e => setGHot(e.target.checked)} id="hot" className="accent-primary" />
                    <label htmlFor="hot" className="text-xs text-muted-foreground">🔥 Marcar como popular</label>
                  </div>
                  <button
                    onClick={saveGiveaway}
                    disabled={!gTitle.trim() || !gPrize.trim()}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {editingGiveaway ? "Salvar alterações" : "Adicionar sorteio"}
                  </button>
                </div>
              </div>
            )}

            {/* Giveaways List */}
            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-12">Carregando...</div>
            ) : giveaways.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Gift className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhum sorteio cadastrado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Adicionar" para criar o primeiro sorteio</p>
              </div>
            ) : (
              <div className="space-y-2">
                {giveaways.map(g => (
                  <div key={g.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{g.title}</h3>
                        {g.hot && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">🔥 Popular</span>}
                        {!g.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Inativo</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Prêmio: {g.prize} · {g.entries} participantes
                        {g.ends_in && ` · Encerra em ${g.ends_in}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openGiveawayForm(g)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteGiveaway(g.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
