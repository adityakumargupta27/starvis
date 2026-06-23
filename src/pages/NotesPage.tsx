import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Trash2, Sparkles, Search, Tag, BookOpen,
  ChevronRight, X, Loader2, Copy, Check, ArrowLeft, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  _id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  isAIGenerated: boolean;
  createdAt: string;
}

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "History", "English", "Economics", "Other"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function NoteCard({ note, onSelect, onDelete }: { note: Note; onSelect: () => void; onDelete: () => void }) {
  const preview = note.content.replace(/[#*`_]/g, "").slice(0, 120);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative cursor-pointer rounded-2xl border border-purple-500/20 bg-black/20 backdrop-blur-sm p-4 hover:border-purple-400/40 hover:bg-white/5 transition-all duration-200"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isAIGenerated && (
            <Sparkles size={12} className="text-purple-400 flex-shrink-0" />
          )}
          <h3 className="font-semibold text-white text-sm truncate">{note.title}</h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all p-1 rounded"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{preview || "Empty note"}</p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.subject && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300">
              {note.subject}
            </span>
          )}
          {note.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
              #{t}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-gray-600">{formatDate(note.createdAt)}</span>
      </div>
    </motion.div>
  );
}

function NoteViewer({ note, onEdit, onClose }: { note: Note; onEdit: () => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyContent = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Very simple markdown renderer for display
  const renderContent = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-purple-300 mt-4 mb-1">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} className="flex gap-2 ml-2"><span className="text-purple-400 mt-1">•</span><span className="text-gray-300 text-sm">{line.slice(2)}</span></div>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-white text-sm">{line.slice(2, -2)}</p>;
      if (line === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
    });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-purple-500/30 overflow-hidden" style={{ background: "linear-gradient(to bottom, #07091a, #0d1026)" }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 flex-shrink-0">
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={18} /></button>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold truncate">{note.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {note.isAIGenerated && <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/30 text-[10px] py-0">✦ AI Generated</Badge>}
              {note.subject && <span className="text-xs text-gray-500">{note.subject}</span>}
              <span className="text-xs text-gray-600">{formatDate(note.createdAt)}</span>
            </div>
          </div>
          <button onClick={copyContent} className="text-gray-500 hover:text-white transition-colors p-2">{copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}</button>
          <button onClick={onEdit} className="text-gray-500 hover:text-purple-400 transition-colors p-2"><Pencil size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-1">{renderContent(note.content)}</div>
      </motion.div>
    </motion.div>
  );
}

interface GenerateFormProps { onGenerate: (title: string, topic: string, subject: string) => void; onClose: () => void; loading: boolean; }
function GenerateForm({ onGenerate, onClose, loading }: GenerateFormProps) {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md rounded-2xl border border-purple-500/30 p-6 space-y-4" style={{ background: "linear-gradient(to bottom, #07091a, #0d1026)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center"><Sparkles size={16} className="text-purple-300" /></div>
            <h3 className="text-white font-bold">AI Notes Generator</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-gray-500 text-sm">Enter a topic and STARVIS will generate comprehensive study notes instantly.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Note Title</label>
            <Input placeholder="e.g. Thermodynamics — Laws & Applications" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-purple-400/30 text-white placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Topic / Prompt</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Explain the laws of thermodynamics with examples and real-world applications" rows={3} className="w-full bg-white/5 border border-purple-400/30 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-400/60 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subject (optional)</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/5 border border-purple-400/30 rounded-xl px-3 py-2 text-sm text-gray-300 outline-none focus:border-purple-400/60">
              <option value="">Select subject...</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <Button
          disabled={!topic.trim() || loading}
          onClick={() => onGenerate(title || topic.slice(0, 50), topic, subject)}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold h-11"
        >
          {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Generating...</> : <><Sparkles size={16} className="mr-2" />Generate Notes</>}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const fetchNotes = async () => {
    try {
      const data = await api.get<Note[]>("/notes");
      setNotes(data);
    } catch {
      // fallback silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchNotes(); }, [user]);

  const handleGenerate = async (title: string, topic: string, subject: string) => {
    setGenerating(true);
    try {
      const { notes: content } = await api.post<{ notes: string }>("/ai/notes", { topic });
      const saved = await api.post<Note>("/notes", { title, content, subject, isAIGenerated: true });
      setNotes((prev) => [saved, ...prev]);
      setShowGenerate(false);
      setSelected(saved);
    } catch (err: any) {
      alert(err.message || "Failed to generate notes");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    const updated = await api.put<Note>(`/notes/${selected._id}`, { title: editTitle, content: editContent });
    setNotes((prev) => prev.map((n) => n._id === updated._id ? updated : n));
    setSelected(updated);
    setEditing(false);
  };

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (!q || n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q)) &&
      (!filterSubject || n.subject === filterSubject);
  });

  const aiCount = notes.filter((n) => n.isAIGenerated).length;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            AI Notes
          </h1>
          <p className="text-gray-500 text-sm mt-1">{notes.length} notes · {aiCount} AI generated</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowGenerate(true)} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white gap-2">
            <Sparkles size={15} />AI Generate
          </Button>
          <Button variant="outline" className="border-purple-400/30 text-gray-300 hover:text-white gap-2" onClick={async () => {
            const title = prompt("Note title:");
            if (!title) return;
            const note = await api.post<Note>("/notes", { title, content: "", isAIGenerated: false });
            setNotes((p) => [note, ...p]);
            setSelected(note);
            setEditing(true);
            setEditTitle(note.title);
            setEditContent(note.content);
          }}>
            <Plus size={15} />New Note
          </Button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Notes", value: notes.length, color: "text-purple-400" },
          { label: "AI Generated", value: aiCount, color: "text-violet-400" },
          { label: "Subjects", value: [...new Set(notes.map((n) => n.subject).filter(Boolean))].length, color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white/5 border-purple-400/20 text-white placeholder:text-gray-600" />
        </div>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-white/5 border border-purple-400/20 rounded-xl px-3 py-2 text-sm text-gray-400 outline-none">
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-purple-400" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <FileText size={28} className="text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold">No notes yet</p>
            <p className="text-gray-500 text-sm mt-1">Generate AI notes or create one manually</p>
          </div>
          <Button onClick={() => setShowGenerate(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
            <Sparkles size={14} />Generate your first note
          </Button>
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((note) => (
              <NoteCard key={note._id} note={note} onSelect={() => { setSelected(note); setEditing(false); }} onDelete={() => handleDelete(note._id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showGenerate && <GenerateForm onGenerate={handleGenerate} onClose={() => setShowGenerate(false)} loading={generating} />}
        {selected && !editing && (
          <NoteViewer note={selected} onClose={() => setSelected(null)} onEdit={() => { setEditTitle(selected.title); setEditContent(selected.content); setEditing(true); }} />
        )}
        {selected && editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-purple-500/30 overflow-hidden" style={{ background: "linear-gradient(to bottom, #07091a, #0d1026)" }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 flex-shrink-0">
                <Pencil size={16} className="text-purple-400" />
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 bg-white/5 border-purple-400/20 text-white font-semibold h-8 text-sm" />
                <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white p-1"><X size={18} /></button>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-transparent text-gray-300 text-sm leading-relaxed p-5 outline-none resize-none font-mono"
                placeholder="Start writing... (Markdown supported)"
              />
              <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10 flex-shrink-0">
                <Button variant="ghost" onClick={() => setEditing(false)} className="text-gray-400">Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700 gap-2"><Check size={14} />Save Note</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
