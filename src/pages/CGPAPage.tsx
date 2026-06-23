import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Plus, Trash2, Calculator, Target, ChevronDown,
  ChevronUp, Award, AlertCircle, ArrowRight, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

const GRADE_POINTS: Record<string, number> = {
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0,
};
const GRADES = Object.keys(GRADE_POINTS);

interface Course { name: string; credits: number; grade: string; }
interface Semester { name: string; courses: Course[]; }

const emptyCourse = (): Course => ({ name: "", credits: 3, grade: "A" });
const emptySemester = (n: number): Semester => ({ name: `Semester ${n}`, courses: [emptyCourse()] });

function cgpaColor(cgpa: number) {
  if (cgpa >= 9) return "text-emerald-400";
  if (cgpa >= 7.5) return "text-blue-400";
  if (cgpa >= 6) return "text-yellow-400";
  return "text-red-400";
}

function cgpaLabel(cgpa: number) {
  if (cgpa >= 9) return "Outstanding 🌟";
  if (cgpa >= 8) return "Excellent 🎯";
  if (cgpa >= 7) return "Good 👍";
  if (cgpa >= 6) return "Average 📚";
  return "Needs improvement 💪";
}

export default function CGPAPage() {
  const [semesters, setSemesters] = useState<Semester[]>([emptySemester(1)]);
  const [result, setResult] = useState<{ cgpa: number; totalCredits: number } | null>(null);
  const [prediction, setPrediction] = useState<{ requiredGPA: number; achievable: boolean; message: string } | null>(null);
  const [targetCGPA, setTargetCGPA] = useState("");
  const [remainingCredits, setRemainingCredits] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([0]);

  const addSemester = () => {
    setSemesters((s) => [...s, emptySemester(s.length + 1)]);
    setExpanded((e) => [...e, semesters.length]);
  };

  const removeSemester = (i: number) => setSemesters((s) => s.filter((_, idx) => idx !== i));

  const addCourse = (si: number) => setSemesters((s) => s.map((sem, i) => i === si ? { ...sem, courses: [...sem.courses, emptyCourse()] } : sem));
  const removeCourse = (si: number, ci: number) => setSemesters((s) => s.map((sem, i) => i === si ? { ...sem, courses: sem.courses.filter((_, j) => j !== ci) } : sem));
  const updateCourse = (si: number, ci: number, key: keyof Course, val: string | number) =>
    setSemesters((s) => s.map((sem, i) => i === si ? { ...sem, courses: sem.courses.map((c, j) => j === ci ? { ...c, [key]: val } : c) } : sem));

  const toggleExpanded = (i: number) => setExpanded((e) => e.includes(i) ? e.filter((x) => x !== i) : [...e, i]);

  const calculateSGPA = (sem: Semester) => {
    let pts = 0; let creds = 0;
    sem.courses.forEach((c) => { const p = GRADE_POINTS[c.grade] ?? 0; pts += p * c.credits; creds += c.credits; });
    return creds > 0 ? +(pts / creds).toFixed(2) : 0;
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const data = await api.post<{ cgpa: number; totalCredits: number }>("/cgpa/calculate", { semesters });
      setResult(data);
    } catch (err: any) { alert(err.message); }
    finally { setCalculating(false); }
  };

  const handlePredict = async () => {
    if (!result || !targetCGPA || !remainingCredits) return;
    setPredicting(true);
    try {
      const data = await api.post<{ requiredGPA: number; achievable: boolean; message: string }>("/cgpa/predict", {
        currentCGPA: result.cgpa, completedCredits: result.totalCredits,
        targetCGPA: parseFloat(targetCGPA), remainingCredits: parseFloat(remainingCredits),
      });
      setPrediction(data);
    } catch (err: any) { alert(err.message); }
    finally { setPredicting(false); }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><TrendingUp size={18} className="text-white" /></div>
            CGPA Calculator
          </h1>
          <p className="text-gray-500 text-sm mt-1">Calculate your CGPA and predict what you need to hit your target</p>
        </div>
      </motion.div>

      {/* Result card */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/30 to-purple-900/20 p-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Your Current CGPA</p>
            <div className={`text-6xl font-bold mb-2 ${cgpaColor(result.cgpa)}`}>{result.cgpa}</div>
            <p className="text-gray-400 text-sm">{cgpaLabel(result.cgpa)}</p>
            <p className="text-gray-600 text-xs mt-1">{result.totalCredits} total credits completed</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semesters */}
      <div className="space-y-3">
        {semesters.map((sem, si) => {
          const sgpa = calculateSGPA(sem);
          const isOpen = expanded.includes(si);
          return (
            <motion.div key={si} layout className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
              <button onClick={() => toggleExpanded(si)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-300 font-bold">{si + 1}</div>
                  <span className="text-white font-medium text-sm">{sem.name}</span>
                  {sgpa > 0 && <span className="text-xs text-gray-500">SGPA: <span className={cgpaColor(sgpa)}>{sgpa}</span></span>}
                </div>
                <div className="flex items-center gap-2">
                  {semesters.length > 1 && <button onClick={(e) => { e.stopPropagation(); removeSemester(si); }} className="text-red-400/60 hover:text-red-400 p-1"><Trash2 size={13} /></button>}
                  {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-2">
                      {sem.courses.map((course, ci) => (
                        <div key={ci} className="flex gap-2 items-center">
                          <Input value={course.name} onChange={(e) => updateCourse(si, ci, "name", e.target.value)} placeholder="Course name" className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-700 text-sm h-8" />
                          <Input type="number" value={course.credits} onChange={(e) => updateCourse(si, ci, "credits", parseFloat(e.target.value) || 0)} className="w-16 bg-white/5 border-white/10 text-white text-sm h-8 text-center" min={1} max={6} />
                          <select value={course.grade} onChange={(e) => updateCourse(si, ci, "grade", e.target.value)} className="bg-[#0a0e23] border border-white/10 rounded-lg px-2 h-8 text-sm text-white outline-none">
                            {GRADES.map((g) => <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
                          </select>
                          <button onClick={() => removeCourse(si, ci)} disabled={sem.courses.length === 1} className="text-red-400/60 hover:text-red-400 p-1 disabled:opacity-30"><X size={13} /></button>
                        </div>
                      ))}
                      <div className="flex items-center gap-1 text-xs text-gray-600 px-0.5 mb-1">
                        <BookOpen size={11} /><span>Credits</span><span className="ml-8">Grade</span>
                      </div>
                      <button onClick={() => addCourse(si)} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                        <Plus size={13} />Add Course
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={addSemester} className="border-white/10 text-gray-400 hover:text-white gap-2"><Plus size={14} />Add Semester</Button>
        <Button onClick={handleCalculate} disabled={calculating} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2">
          <Calculator size={15} />{calculating ? "Calculating..." : "Calculate CGPA"}
        </Button>
      </div>

      {/* Predictor */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-violet-500/20 bg-black/20 p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Target size={16} className="text-violet-400" />CGPA Predictor</h3>
          <p className="text-gray-500 text-sm">Find out what GPA you need in remaining semesters to hit your target.</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 mb-1 block">Target CGPA</label><Input type="number" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} placeholder="e.g. 8.5" min={0} max={10} step={0.1} className="bg-white/5 border-violet-400/30 text-white placeholder:text-gray-600" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Remaining Credits</label><Input type="number" value={remainingCredits} onChange={(e) => setRemainingCredits(e.target.value)} placeholder="e.g. 40" min={0} className="bg-white/5 border-violet-400/30 text-white placeholder:text-gray-600" /></div>
          </div>
          <Button onClick={handlePredict} disabled={!targetCGPA || !remainingCredits || predicting} className="w-full bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30 gap-2">
            <ArrowRight size={14} />Predict
          </Button>

          <AnimatePresence>
            {prediction && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-4 ${prediction.achievable ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                <div className="flex items-start gap-2">
                  {prediction.achievable ? <Award size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    {prediction.requiredGPA !== null && (
                      <p className={`text-2xl font-bold mb-1 ${prediction.achievable ? "text-emerald-400" : "text-red-400"}`}>{prediction.requiredGPA}/10</p>
                    )}
                    <p className={`text-sm ${prediction.achievable ? "text-emerald-300" : "text-red-300"}`}>{prediction.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
