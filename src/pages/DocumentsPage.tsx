import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, MessageSquare, Trash2, Loader2, Send,
  X, Bot, Sparkles, ChevronRight, File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Document {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  summary: string;
  createdAt: string;
}

interface ChatMessage { role: "user" | "assistant"; content: string; }

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderMsg(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-purple-300 mt-2">{line.slice(3)}</h3>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} className="flex gap-1.5 ml-1"><span className="text-purple-400">•</span><span>{line.slice(2)}</span></div>;
    if (line === "") return <div key={i} className="h-1" />;
    return <span key={i}>{line}<br /></span>;
  });
}

function ChatPanel({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.post<{ reply: string }>("/ai/document-chat", {
        documentId: doc._id,
        question: text,
        history: messages.slice(-6),
      });
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages((p) => [...p, { role: "assistant", content: "Sorry, something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ y: 40 }} animate={{ y: 0 }} className="w-full md:max-w-2xl h-[85vh] md:h-[75vh] flex flex-col rounded-t-3xl md:rounded-2xl border border-purple-500/30 overflow-hidden" style={{ background: "linear-gradient(to bottom, #06091a, #0a0e23)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0 bg-purple-900/20">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-purple-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{doc.originalName}</p>
            <p className="text-gray-500 text-xs">Chat with this document</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1"><X size={18} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Bot size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Chat with your document</p>
                <p className="text-gray-500 text-sm mt-1 max-w-[280px]">Ask anything about "{doc.originalName}". STARVIS will answer based on the content.</p>
              </div>
              {doc.summary && (
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-3 text-left max-w-sm">
                  <p className="text-[11px] text-purple-400 font-semibold mb-1 flex items-center gap-1"><Sparkles size={10} />AI Summary</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{doc.summary}</p>
                </div>
              )}
              {["Summarize this document", "What are the key points?", "Explain the main concepts"].map((q) => (
                <button key={q} onClick={() => send(q)} className="text-sm text-purple-400 hover:text-purple-300 border border-purple-500/20 rounded-xl px-4 py-2 transition-colors">{q}</button>
              ))}
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-purple-600 text-white rounded-tr-sm" : "text-gray-200 border border-white/10 rounded-tl-sm"}`} style={m.role === "assistant" ? { background: "rgba(255,255,255,0.07)" } : {}}>
                    {m.role === "assistant" ? renderMsg(m.content) : m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/10 flex gap-1" style={{ background: "rgba(255,255,255,0.07)" }}>
                    {[0, 1, 2].map((i) => <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }} />)}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="px-3 py-3 border-t border-white/10 flex-shrink-0 bg-black/20">
          <div className="flex gap-2">
            <Input placeholder="Ask about this document..." value={input} onChange={(e) => setInput(e.target.value)} className="bg-white/5 border-purple-400/30 text-white placeholder:text-gray-600 rounded-xl" />
            <Button type="submit" size="sm" disabled={!input.trim() || loading} className="bg-purple-600 hover:bg-purple-700 w-10 h-10 p-0 flex-shrink-0 rounded-xl">
              <Send size={14} />
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [chatDoc, setChatDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const data = await api.get<Document[]>("/documents");
      setDocs(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchDocs(); }, [user]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("starvis_jwt_token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const doc = await res.json() as Document;
      setDocs((p) => [doc, ...p]);
      if (doc._id) {
        api.post<{ summary: string }>("/ai/document-summary", { documentId: doc._id })
          .then(({ summary }) => {
            setDocs((p) => p.map((item) => item._id === doc._id ? { ...item, summary } : item));
          })
          .catch((err) => {
            console.error("Document summary failed:", err);
          });
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await api.delete(`/documents/${id}`);
    setDocs((p) => p.filter((d) => d._id !== id));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <File size={18} className="text-white" />
            </div>
            Document Chat
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload PDFs and chat with them using AI</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2">
          {uploading ? <><Loader2 size={15} className="animate-spin" />Uploading...</> : <><Upload size={15} />Upload PDF</>}
        </Button>
        <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={onFileChange} className="hidden" />
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleUpload(file); }}
        className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-8 text-center cursor-pointer transition-all group"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          {uploading ? <Loader2 size={22} className="animate-spin text-purple-400" /> : <Upload size={22} className="text-purple-400" />}
        </div>
        <p className="text-white font-medium text-sm">{uploading ? "Processing your document..." : "Drop a PDF or TXT file here"}</p>
        <p className="text-gray-600 text-xs mt-1">Max 10MB · AI will parse and summarize it automatically</p>
      </motion.div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-blue-400" /></div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <FileText size={40} className="text-gray-700" />
          <p className="text-gray-500 text-sm">No documents uploaded yet</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {docs.map((doc) => (
              <motion.div key={doc._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="group rounded-2xl border border-blue-500/20 bg-black/20 backdrop-blur-sm p-4 hover:border-blue-400/40 hover:bg-white/5 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.originalName}</p>
                    <p className="text-gray-500 text-xs">{doc.fileType.toUpperCase()} · {formatSize(doc.fileSize)}</p>
                  </div>
                  <button onClick={() => handleDelete(doc._id)} className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 p-1 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
                {doc.summary && <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{doc.summary}</p>}
                <Button size="sm" onClick={() => setChatDoc(doc)} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 gap-2">
                  <MessageSquare size={13} />Chat with this PDF
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Chat modal */}
      <AnimatePresence>{chatDoc && <ChatPanel doc={chatDoc} onClose={() => setChatDoc(null)} />}</AnimatePresence>
    </div>
  );
}
