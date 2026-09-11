import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import {
  ClipboardList, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight,
  Sparkles, ListChecks, PenLine,
} from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'
import { generateQuizQuestions } from '../../services/groq'
import { syllabus } from '../../data/syllabus'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const COUNTS = [5, 10]

export default function QuizPage() {
  const { user, selectedClass, dark, bg, surface, text } = useDashboard()
  const [stage, setStage] = useState('setup') // setup | loading | quiz | results
  const [mode, setMode] = useState('chapter') // chapter | custom
  const [classLevel, setClassLevel] = useState(selectedClass)
  const subjects = useMemo(() => Object.keys(syllabus[classLevel] || {}), [classLevel])
  const [subject, setSubject] = useState(subjects[0] || 'Physics')
  const chapters = useMemo(() => syllabus[classLevel]?.[subject] || [], [classLevel, subject])
  const [chapter, setChapter] = useState(chapters[0] || '')
  const [customTopic, setCustomTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState(5)
  const [error, setError] = useState(null)

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)

  const handleClassChange = (c) => {
    setClassLevel(c)
    const firstSubject = Object.keys(syllabus[c] || {})[0] || ''
    setSubject(firstSubject)
    setChapter((syllabus[c]?.[firstSubject] || [])[0] || '')
  }

  const handleSubjectChange = (s) => {
    setSubject(s)
    setChapter((syllabus[classLevel]?.[s] || [])[0] || '')
  }

  const topic = mode === 'chapter' ? chapter : customTopic.trim()

  const handleStart = async () => {
    if (!topic) return
    setStage('loading')
    setError(null)
    try {
      const res = await generateQuizQuestions({ classLevel, subject, topic, difficulty, count })
      const qs = res?.questions || []
      if (!qs.length) throw new Error('No questions came back. Try a different topic.')
      setQuestions(qs)
      setAnswers(new Array(qs.length).fill(null))
      setCurrentIndex(0)
      setSelected(null)
      setRevealed(false)
      setScore(0)
      setStage('quiz')
    } catch (err) {
      setError(err.message)
      setStage('setup')
    }
  }

  const handleSelect = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const updated = [...answers]
    updated[currentIndex] = idx
    setAnswers(updated)
    if (idx === questions[currentIndex].correct) setScore((s) => s + 1)
  }

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
      setRevealed(false)
      return
    }
    setStage('results')
    if (user) {
      try {
        await addDoc(collection(db, 'quizzes'), {
          userId: user.uid,
          userName: user.displayName,
          userEmail: user.email,
          classLevel, subject, topic, difficulty, mode,
          questions, answers,
          score, total: questions.length,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleRetake = () => {
    setAnswers(new Array(questions.length).fill(null))
    setCurrentIndex(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setStage('quiz')
  }

  const handleNewQuiz = () => {
    setQuestions([])
    setAnswers([])
    setStage('setup')
  }

  const bgGradient = dark ? 'from-neutral-950 via-neutral-900 to-neutral-950' : 'from-teal-50 via-white to-cyan-50'
  const cardBase = dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
  const muted = dark ? 'text-neutral-400' : 'text-neutral-600'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <div className={`backdrop-blur-xl ${dark ? 'bg-neutral-950/80' : 'bg-white/80'}`}>
          <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList size={24} className={dark ? 'text-teal-400' : 'text-teal-600'} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Quizzes</span>
              </div>
              <h1 className={`text-3xl font-bold tracking-[-0.5px] ${text}`}>Test yourself</h1>
              <p className={`text-sm mt-2 ${muted}`}>Pick a chapter or a custom topic — get an instant MCQ set.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* SETUP */}
          {stage === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-6 md:p-8 backdrop-blur-sm ${cardBase}`}
            >
              {/* Mode toggle */}
              <div className={`inline-flex p-1 rounded-full mb-8 ${dark ? 'bg-neutral-950' : 'bg-neutral-100'}`}>
                {[
                  { id: 'chapter', label: 'By chapter', Icon: ListChecks },
                  { id: 'custom', label: 'Custom topic', Icon: PenLine },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                      mode === id
                        ? dark ? 'bg-white text-black' : 'bg-black text-white'
                        : `${muted} hover:${text}`
                    }`}
                  >
                    <Icon size={14} strokeWidth={2.5} />
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'chapter' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Class</label>
                    <select
                      value={classLevel}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border ${
                        dark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-black'
                      }`}
                    >
                      {Object.keys(syllabus).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border ${
                        dark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-black'
                      }`}
                    >
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Chapter</label>
                    <select
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border ${
                        dark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-black'
                      }`}
                    >
                      {chapters.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Class</label>
                    <select
                      value={classLevel}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border ${
                        dark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-black'
                      }`}
                    >
                      {Object.keys(syllabus).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border ${
                        dark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-black'
                      }`}
                    >
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Topic</label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. rotational inertia, coordination compounds..."
                      className={`w-full rounded-xl px-4 py-3 text-sm outline-none border ${
                        dark ? 'bg-neutral-950 border-white/10 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 text-black placeholder-neutral-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 mt-6 mb-8">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Difficulty</p>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-medium capitalize transition-colors ${
                          difficulty === d
                            ? dark ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-teal-100 text-teal-700 border border-teal-300'
                            : `border ${dark ? 'border-white/10 text-neutral-400' : 'border-neutral-200 text-neutral-600'}`
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Questions</p>
                  <div className="flex gap-2">
                    {COUNTS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        className={`w-10 h-9 rounded-full text-[13px] font-semibold transition-colors ${
                          count === n
                            ? dark ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-teal-100 text-teal-700 border border-teal-300'
                            : `border ${dark ? 'border-white/10 text-neutral-400' : 'border-neutral-200 text-neutral-600'}`
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className={`mb-6 rounded-2xl p-4 text-sm ${dark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'}`}>
                  {error}
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={!topic}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-900'
                }`}
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Generate quiz
              </button>
            </motion.div>
          )}

          {/* LOADING */}
          {stage === 'loading' && (
            <div className="flex flex-col items-center justify-center py-24">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={28} className={dark ? 'text-teal-400' : 'text-teal-600'} />
              </motion.div>
              <p className={`text-sm mt-4 ${muted}`}>Building your quiz on "{topic}"...</p>
            </div>
          )}

          {/* QUIZ */}
          {stage === 'quiz' && questions[currentIndex] && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-3xl border p-6 md:p-8 backdrop-blur-sm ${cardBase}`}
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <div className={`h-1.5 w-32 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-neutral-200'}`}>
                  <motion.div
                    className="h-full bg-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <p className={`text-lg font-semibold mb-6 ${text}`}>{questions[currentIndex].text}</p>

              <div className="space-y-3 mb-6">
                {questions[currentIndex].options.map((opt, i) => {
                  const isCorrect = i === questions[currentIndex].correct
                  const isSelected = i === selected
                  let stateClasses = dark ? 'border-white/10 hover:border-teal-400/40' : 'border-neutral-200 hover:border-teal-300'
                  if (revealed && isCorrect) {
                    stateClasses = dark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50'
                  } else if (revealed && isSelected && !isCorrect) {
                    stateClasses = dark ? 'border-red-500/50 bg-red-500/10' : 'border-red-400 bg-red-50'
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={revealed}
                      className={`w-full flex items-center justify-between gap-3 text-left px-5 py-3.5 rounded-2xl border transition-all ${stateClasses} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`text-sm ${text}`}>{opt}</span>
                      {revealed && isCorrect && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                      {revealed && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {revealed && questions[currentIndex].explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mb-6 rounded-2xl p-4 text-sm ${dark ? 'bg-neutral-950 text-neutral-300 border border-white/10' : 'bg-neutral-50 text-neutral-700 border border-neutral-200'}`}
                >
                  {questions[currentIndex].explanation}
                </motion.div>
              )}

              {revealed && (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                    dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-900'
                  }`}
                >
                  {currentIndex + 1 < questions.length ? 'Next question' : 'See results'}
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              )}
            </motion.div>
          )}

          {/* RESULTS */}
          {stage === 'results' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className={`rounded-3xl border p-8 text-center backdrop-blur-sm ${cardBase}`}>
                <Trophy size={40} className={`mx-auto mb-4 ${dark ? 'text-teal-400' : 'text-teal-600'}`} />
                <p className={`text-3xl font-bold tracking-[-0.5px] ${text}`}>{score} / {questions.length}</p>
                <p className={`text-sm mt-2 ${muted}`}>{topic} · {difficulty} · {classLevel}</p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={handleRetake}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border ${
                      dark ? 'border-white/10 text-white hover:bg-white/5' : 'border-neutral-200 text-black hover:bg-neutral-50'
                    }`}
                  >
                    <RotateCcw size={14} />
                    Retake
                  </button>
                  <button
                    onClick={handleNewQuiz}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold ${
                      dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-900'
                    }`}
                  >
                    New quiz
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {questions.map((q, i) => {
                  const userAnswer = answers[i]
                  const correct = userAnswer === q.correct
                  return (
                    <div key={i} className={`rounded-2xl border p-5 ${cardBase}`}>
                      <div className="flex items-start gap-3 mb-3">
                        {correct ? (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm font-semibold ${text}`}>{q.text}</p>
                      </div>
                      <p className={`text-xs ml-7 ${muted}`}>
                        Your answer: <span className={correct ? 'text-emerald-500' : 'text-red-500'}>{q.options[userAnswer] ?? 'Skipped'}</span>
                        {!correct && <> · Correct: <span className="text-emerald-500">{q.options[q.correct]}</span></>}
                      </p>
                      {q.explanation && <p className={`text-xs ml-7 mt-2 ${muted}`}>{q.explanation}</p>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
