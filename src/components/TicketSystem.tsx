import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, Ticket, AlertCircle, X, Plus, Image, RefreshCw,
  Loader2, CheckCircle, Clock, CircleDot, Search, Filter, ChevronRight,
  Headphones, Shield, Zap, FileText, ArrowLeft, Paperclip, Hash
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type TicketData = {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  admin_response: string | null;
  description: string;
};

const CATEGORIES = [
  { value: "Problema com entrega", icon: FileText, color: "text-orange-400" },
  { value: "Conta não funciona", icon: Shield, color: "text-red-400" },
  { value: "Reembolso", icon: Zap, color: "text-yellow-400" },
  { value: "Dúvida geral", icon: Headphones, color: "text-blue-400" },
  { value: "Outro", icon: CircleDot, color: "text-purple-400" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; bg: string; text: string; border: string; dot: string }> = {
  aberto: { label: "Aberto", icon: Clock, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  respondido: { label: "Respondido", icon: CheckCircle, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  fechado: { label: "Fechado", icon: X, bg: "bg-muted", text: "text-muted-foreground", border: "border-border", dot: "bg-muted-foreground" },
};

/* ═══════════════════════════════════════════ */
/*               TICKET SYSTEM                */
/* ═══════════════════════════════════════════ */
export default function TicketSystem() {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "new" | "chat">("list");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const openTicket = (t: TicketData) => {
    setActiveTicket(t);
    setView("chat");
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = !searchQuery || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.slice(0, 8).includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "aberto").length,
    answered: tickets.filter(t => t.status === "respondido").length,
    closed: tickets.filter(t => t.status === "fechado").length,
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <GuestTicketForm />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "chat" && activeTicket ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TicketChatView
              ticket={activeTicket}
              onBack={() => { setView("list"); setActiveTicket(null); fetchTickets(); }}
            />
          </motion.div>
        ) : view === "new" ? (
          <motion.div
            key="new"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <button onClick={() => setView("list")} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos tickets
              </button>
            </div>
            <TicketForm onCreated={() => { setView("list"); fetchTickets(); }} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total", value: stats.total, color: "text-foreground", bg: "bg-secondary/60" },
                { label: "Abertos", value: stats.open, color: "text-amber-400", bg: "bg-amber-500/5" },
                { label: "Respondidos", value: stats.answered, color: "text-emerald-400", bg: "bg-emerald-500/5" },
                { label: "Fechados", value: stats.closed, color: "text-muted-foreground", bg: "bg-muted/30" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} border border-border rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por assunto ou ID..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex bg-secondary/60 border border-border rounded-xl p-1 gap-0.5">
                  {["all", "aberto", "respondido", "fechado"].map(s => {
                    const isActive = statusFilter === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s === "all" ? "Todos" : STATUS_CONFIG[s]?.label || s}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setView("new")}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" /> Novo
                </button>
              </div>
            </div>

            {/* Ticket List */}
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-6 w-6 text-primary/40 mx-auto animate-spin mb-3" />
                <p className="text-xs text-muted-foreground">Carregando tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-7 w-7 text-primary/30" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {tickets.length === 0 ? "Nenhum ticket ainda" : "Nenhum resultado"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
                  {tickets.length === 0
                    ? "Crie seu primeiro ticket e nossa equipe responderá rapidamente."
                    : "Tente alterar os filtros ou buscar outro termo."}
                </p>
                {tickets.length === 0 && (
                  <button
                    onClick={() => setView("new")}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Abrir Primeiro Ticket
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTickets.map((t, i) => {
                  const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.aberto;
                  const catInfo = CATEGORIES.find(c => c.value === t.category);
                  const CatIcon = catInfo?.icon || CircleDot;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => openTicket(t)}
                      className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Status dot */}
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0 ${t.status === "aberto" ? "animate-pulse" : ""}`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {t.subject}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Hash className="h-2.5 w-2.5" />
                              {t.id.slice(0, 8)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CatIcon className={`h-2.5 w-2.5 ${catInfo?.color || ""}`} />
                              {t.category}
                            </span>
                            <span>
                              {new Date(t.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} flex-shrink-0`}>
                          {cfg.label}
                        </span>

                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*            TICKET CHAT VIEW                */
/* ═══════════════════════════════════════════ */
function TicketChatView({ ticket, onBack }: { ticket: TicketData; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ id: string; sender_type: string; message: string; created_at: string; sender_id: string | null }[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.aberto;

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`ticket-chat-${ticket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticket.id}` }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === (payload.new as any).id)) return prev;
          return [...prev, payload.new as any];
        });
      })
      .subscribe();
    const poll = setInterval(fetchMessages, 5000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [ticket.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
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
    const path = `${user.id}/${ticket.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("ticket-attachments").upload(path, file);
    if (uploadErr) { toast.error("Erro ao enviar imagem"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("ticket-attachments").getPublicUrl(path);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_type: "user",
      message: `[image]${urlData.publicUrl}[/image]`,
    });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const renderMessage = (text: string) => {
    const imgMatch = text.match(/^\[image\](.*)\[\/image\]$/);
    if (imgMatch) {
      return <img src={imgMatch[1]} alt="Anexo" className="rounded-xl max-w-[280px] max-h-[220px] object-cover cursor-pointer hover:brightness-110 transition-all" onClick={() => window.open(imgMatch[1], "_blank")} />;
    }
    return <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">{text}</p>;
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: typeof messages }[] = [];
  messages.forEach(m => {
    const date = new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(m);
    } else {
      groupedMessages.push({ date, msgs: [m] });
    }
  });

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col" style={{ height: "70vh", maxHeight: "700px" }}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold truncate">{ticket.subject}</p>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Hash className="h-2.5 w-2.5" />{ticket.id.slice(0, 8)}</span>
              <span>{ticket.category}</span>
              <span>{new Date(ticket.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Original description */}
      <div className="px-5 py-3 bg-primary/5 border-b border-border">
        <div className="flex items-start gap-2">
          <FileText className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-primary mb-0.5">Descrição do ticket</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{ticket.description}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 text-primary/40 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-muted-foreground/20" />
            </div>
            <p className="text-xs text-muted-foreground/60">Nenhuma mensagem ainda.</p>
            <p className="text-[10px] text-muted-foreground/40 mt-1">Envie uma mensagem para iniciar a conversa.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groupedMessages.map((group, gi) => (
              <React.Fragment key={gi}>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground/50 font-medium">{group.date}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {group.msgs.map((m, mi) => {
                  const isMe = m.sender_type === "user";
                  const showAvatar = mi === 0 || group.msgs[mi - 1]?.sender_type !== m.sender_type;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} ${showAvatar ? "mt-3" : "mt-0.5"}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : ""}`}>
                        {showAvatar && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                            isMe ? "bg-primary/20 text-primary" : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {isMe ? "EU" : "🛡️"}
                          </div>
                        )}
                        {!showAvatar && <div className="w-7 flex-shrink-0" />}
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary border border-border text-foreground rounded-bl-md"
                        }`}>
                          {!isMe && showAvatar && (
                            <p className="text-[10px] font-bold text-emerald-400 mb-1">Equipe K9</p>
                          )}
                          {renderMessage(m.message)}
                          <p className={`text-[9px] mt-1.5 ${isMe ? "text-primary-foreground/50" : "text-muted-foreground/40"}`}>
                            {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      {ticket.status !== "fechado" ? (
        <div className="border-t border-border p-4 bg-secondary/20">
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-40"
              title="Anexar imagem"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </button>
            <div className="flex-1 relative">
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value.slice(0, 1000))}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Escreva sua mensagem..."
                rows={1}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors resize-none pr-12"
              />
              <span className="absolute right-3 bottom-2 text-[9px] text-muted-foreground/30">{newMsg.length}/1000</span>
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim() || sending}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border p-4 bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">Este ticket foi encerrado.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*              TICKET FORM                   */
/* ═══════════════════════════════════════════ */
function TicketForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maxLen = 1000;

  const handleSubmit = async () => {
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
      setSubject(""); setCategory(""); setDescription(""); setEmail("");
      onCreated?.();
    }, 2500);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-primary/20 rounded-2xl p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle className="h-8 w-8 text-primary" />
        </motion.div>
        <p className="text-lg font-bold">Ticket Criado!</p>
        <p className="text-sm text-muted-foreground mt-2">Nossa equipe responderá o mais rápido possível.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Progress */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
              }`}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? "bg-primary" : "bg-border"}`} />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {step === 1 && "Selecione a categoria do seu problema"}
          {step === 2 && "Descreva o que aconteceu"}
          {step === 3 && "Revise e envie seu ticket"}
        </p>
      </div>

      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Category */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-3">
              {!user && (
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Email para contato</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value.slice(0, 100))}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              )}
              <label className="text-xs font-semibold text-foreground mb-2 block">Categoria</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map(c => {
                  const Icon = c.icon;
                  const isSelected = category === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border bg-secondary/30 hover:border-primary/20 hover:bg-secondary/60"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : c.color}`} />
                      <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{c.value}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!category || (!user && !email.trim())}
                className="w-full mt-3 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 pt-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Assunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value.slice(0, 150))}
                  placeholder="Resumo breve do problema..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Descrição detalhada</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, maxLen))}
                  placeholder="Explique em detalhe o que aconteceu, quando e quais passos já tentou..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground/40">Mínimo 10 caracteres</p>
                  <p className="text-[10px] text-muted-foreground/40">{description.length}/{maxLen}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!subject.trim() || description.trim().length < 10}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                >
                  Revisar <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 pt-3">
              <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Resumo do Ticket</p>
                  <button onClick={() => setStep(1)} className="text-[10px] text-primary hover:underline">Editar</button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 pt-0.5">Categoria</span>
                    <span className="text-xs font-semibold">{category}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 pt-0.5">Assunto</span>
                    <span className="text-xs font-semibold">{subject}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 pt-0.5">Descrição</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Nosso tempo médio de resposta é de até 24h. Acompanhe o status do ticket na aba "Meus Tickets".
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ticket className="h-3.5 w-3.5" />}
                  {submitting ? "Enviando..." : "Enviar Ticket"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Guest form for non-logged users */
function GuestTicketForm() {
  return (
    <div className="space-y-4">
      <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <Link to="/login" className="text-primary font-semibold hover:underline">Faça login</Link> para acompanhar seus tickets em tempo real. Você também pode enviar sem conta.
        </p>
      </div>
      <TicketForm />
    </div>
  );
}
