import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, Package, Gift, ArrowLeft, Save, X, LogOut, ShieldCheck, Ticket, MessageCircle, Clock, CheckCircle2, List, Upload, Image } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/k9-logo.png";

type Product = {
  id: string;
  name: string;
  price: number;
  tags: string[];
  badge: string | null;
  sales: string | null;
  image_url: string | null;
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

type TicketItem = {
  id: string;
  email: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_response: string | null;
  created_at: string;
};

export default function Admin() {
  const { user, isLoading: authLoading, isAdmin, isRoleLoading, signOut } = useAuth();
  const [tab, setTab] = useState<"products" | "giveaways" | "tickets">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pTags, setPTags] = useState("");
  const [pBadge, setPBadge] = useState("");
  const [pSales, setPSales] = useState("");
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  const [pImagePreview, setPImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Plans management
  const [managingPlansFor, setManagingPlansFor] = useState<Product | null>(null);
  const [plans, setPlans] = useState<{ id: string; name: string; price: number; sort_order: number }[]>([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");

  // Giveaway form
  const [showGiveawayForm, setShowGiveawayForm] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [gTitle, setGTitle] = useState("");
  const [gPrize, setGPrize] = useState("");
  const [gEntries, setGEntries] = useState("");
  const [gEndsIn, setGEndsIn] = useState("");
  const [gHot, setGHot] = useState(false);

  // Ticket response
  const [respondingTicket, setRespondingTicket] = useState<TicketItem | null>(null);
  const [ticketResponse, setTicketResponse] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [p, g, t] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("giveaways").select("*").order("created_at", { ascending: false }),
      supabase.from("tickets").select("*").order("created_at", { ascending: false }),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (g.data) setGiveaways(g.data as Giveaway[]);
    if (t.data) setTickets(t.data as TicketItem[]);
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
      setPImagePreview(product.image_url || null);
    } else {
      setEditingProduct(null);
      setPName(""); setPPrice(""); setPTags(""); setPBadge(""); setPSales("");
      setPImagePreview(null);
    }
    setPImageFile(null);
    setShowProductForm(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPImageFile(file);
    setPImagePreview(URL.createObjectURL(file));
  };

  const saveProduct = async () => {
    if (!pName.trim() || !pPrice.trim()) return;
    setUploading(true);

    let image_url: string | null = editingProduct?.image_url || null;

    // Upload image if new file selected
    if (pImageFile) {
      const ext = pImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, pImageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    const data = {
      name: pName.trim(),
      price: parseFloat(pPrice),
      tags: pTags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
      badge: pBadge.trim() || null,
      sales: pSales.trim() || null,
      image_url,
    };
    if (editingProduct) {
      await supabase.from("products").update(data).eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert(data);
    }
    setUploading(false);
    setShowProductForm(false);
    fetchAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Deletar este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchAll();
  };

  // Plans CRUD
  const openPlansManager = async (product: Product) => {
    setManagingPlansFor(product);
    const { data } = await supabase.from("product_plans").select("*").eq("product_id", product.id).order("sort_order");
    setPlans((data || []) as { id: string; name: string; price: number; sort_order: number }[]);
    setNewPlanName("");
    setNewPlanPrice("");
  };

  const addPlan = async () => {
    if (!managingPlansFor || !newPlanName.trim() || !newPlanPrice.trim()) return;
    await supabase.from("product_plans").insert({
      product_id: managingPlansFor.id,
      name: newPlanName.trim(),
      price: parseFloat(newPlanPrice),
      sort_order: plans.length,
    });
    openPlansManager(managingPlansFor);
  };

  const deletePlan = async (planId: string) => {
    if (!managingPlansFor) return;
    await supabase.from("product_plans").delete().eq("id", planId);
    openPlansManager(managingPlansFor);
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

  // Ticket actions
  const updateTicketStatus = async (id: string, status: string) => {
    await supabase.from("tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchAll();
  };

  const respondToTicket = async () => {
    if (!respondingTicket || !ticketResponse.trim()) return;
    await supabase.from("tickets").update({
      admin_response: ticketResponse.trim(),
      status: "respondido",
      updated_at: new Date().toISOString(),
    }).eq("id", respondingTicket.id);
    setRespondingTicket(null);
    setTicketResponse("");
    fetchAll();
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Deletar este ticket?")) return;
    await supabase.from("tickets").delete().eq("id", id);
    fetchAll();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground caret-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors [color-scheme:dark]";

  // Auth guards
  if (authLoading || isRoleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShieldCheck className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h1 className="text-lg font-bold mb-1">Acesso negado</h1>
          <p className="text-xs text-muted-foreground mb-4">Sua conta não tem permissão de administrador.</p>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => setTab("tickets")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                tab === "tickets" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ticket className="h-3 w-3" /> Tickets
              {tickets.filter(t => t.status === "aberto").length > 0 && (
                <span className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {tickets.filter(t => t.status === "aberto").length}
                </span>
              )}
            </button>
          </div>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
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
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Thumbnail</label>
                    {pImagePreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-secondary mb-2">
                        <img src={pImagePreview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setPImageFile(null); setPImagePreview(null); }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors bg-secondary/30">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Clique para enviar imagem</span>
                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </label>
                    )}
                  </div>
                  <button
                    onClick={saveProduct}
                    disabled={!pName.trim() || !pPrice.trim() || uploading}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {uploading ? "Enviando..." : editingProduct ? "Salvar alterações" : "Adicionar produto"}
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
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Image className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="min-w-0">
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
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openPlansManager(p)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Gerenciar planos">
                        <List className="h-3.5 w-3.5" />
                      </button>
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

            {/* Plans Manager Modal */}
            {managingPlansFor && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold">Planos — {managingPlansFor.name}</h2>
                      <p className="text-[10px] text-muted-foreground">Ex: Diário, Semanal, Mensal, Lifetime</p>
                    </div>
                    <button onClick={() => setManagingPlansFor(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Existing plans */}
                  {plans.length > 0 ? (
                    <div className="space-y-1.5">
                      {plans.map(plan => (
                        <div key={plan.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-xs font-medium">{plan.name}</span>
                            <span className="text-xs text-primary ml-2 font-bold">R${plan.price.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <button onClick={() => deletePlan(plan.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 text-center py-3">Nenhum plano — será usado o preço padrão do produto</p>
                  )}

                  {/* Add new plan */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-[11px] font-medium text-muted-foreground">Adicionar plano</p>
                    <div className="grid grid-cols-[1fr_100px] gap-2">
                      <input
                        value={newPlanName}
                        onChange={e => setNewPlanName(e.target.value)}
                        placeholder="Nome (ex: Mensal)"
                        className={inputClass}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newPlanPrice}
                        onChange={e => setNewPlanPrice(e.target.value)}
                        placeholder="Preço"
                        className={inputClass}
                      />
                    </div>
                    <button
                      onClick={addPlan}
                      disabled={!newPlanName.trim() || !newPlanPrice.trim()}
                      className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3 w-3" /> Adicionar plano
                    </button>
                  </div>
                </div>
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

        {/* Tickets Tab */}
        {tab === "tickets" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold">Tickets</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tickets.filter(t => t.status === "aberto").length} aberto(s) · {tickets.length} total
                </p>
              </div>
            </div>

            {/* Respond Modal */}
            {respondingTicket && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold">Responder Ticket</h2>
                    <button onClick={() => setRespondingTicket(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <p className="text-[10px] text-muted-foreground">{respondingTicket.email} · {respondingTicket.category}</p>
                    <p className="text-xs font-semibold">{respondingTicket.subject}</p>
                    <p className="text-xs text-muted-foreground">{respondingTicket.description}</p>
                  </div>
                  {respondingTicket.admin_response && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                      <p className="text-[10px] text-primary font-medium mb-1">Resposta anterior:</p>
                      <p className="text-xs text-muted-foreground">{respondingTicket.admin_response}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Sua resposta</label>
                    <textarea
                      value={ticketResponse}
                      onChange={e => setTicketResponse(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <button
                    onClick={respondToTicket}
                    disabled={!ticketResponse.trim()}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Enviar resposta
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-12">Carregando...</div>
            ) : tickets.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Ticket className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhum ticket recebido</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map(t => {
                  const statusColors: Record<string, string> = {
                    aberto: "bg-destructive/10 text-destructive",
                    respondido: "bg-primary/10 text-primary",
                    fechado: "bg-secondary text-muted-foreground",
                  };
                  return (
                    <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold truncate">{t.subject}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[t.status] || statusColors.aberto}`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-1">
                            {t.email} · {t.category} · {new Date(t.created_at).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs text-muted-foreground/80 line-clamp-2">{t.description}</p>
                          {t.admin_response && (
                            <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                              <p className="text-[10px] text-primary font-medium">Resposta:</p>
                              <p className="text-xs text-muted-foreground">{t.admin_response}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => { setRespondingTicket(t); setTicketResponse(t.admin_response || ""); }}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title="Responder"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          {t.status === "aberto" && (
                            <button
                              onClick={() => updateTicketStatus(t.id, "fechado")}
                              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                              title="Fechar ticket"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {t.status === "fechado" && (
                            <button
                              onClick={() => updateTicketStatus(t.id, "aberto")}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                              title="Reabrir ticket"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTicket(t.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            title="Deletar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
