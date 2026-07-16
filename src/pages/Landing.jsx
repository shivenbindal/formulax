import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { findFormula } from '../services/groq'

const floatingFormulas = [
  { text: 'E = mc²', x: '8%', y: '15%', size: 'text-2xl', delay: 0 },
  { text: 'F = ma', x: '85%', y: '20%', size: 'text-xl', delay: 0.5 },
  { text: 'PV = nRT', x: '75%', y: '60%', size: 'text-lg', delay: 1 },
  { text: '∫f(x)dx', x: '5%', y: '65%', size: 'text-2xl', delay: 0.3 },
  { text: 'a² + b² = c²', x: '80%', y: '80%', size: 'text-base', delay: 0.8 },
  { text: 'λ = h/mv', x: '15%', y: '80%', size: 'text-lg', delay: 1.2 },
  { text: 'ΔG = ΔH - TΔS', x: '60%', y: '10%', size: 'text-base', delay: 0.6 },
  { text: 'v = u + at', x: '25%', y: '25%', size: 'text-sm', delay: 1.5 },
  { text: 'pH = -log[H⁺]', x: '45%', y: '85%', size: 'text-sm', delay: 0.9 },
  { text: 'sin²θ + cos²θ = 1', x: '55%', y: '40%', size: 'text-xs', delay: 1.8 },
]

const FREE_USES_KEY = 'fx_free_uses'
const MAX_FREE_USES = 3

function getFreeUses() { return parseInt(localStorage.getItem(FREE_USES_KEY) || '0') }
function incrementFreeUses() { localStorage.setItem(FREE_USES_KEY, getFreeUses() + 1) }

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

async function searchTopicFormulas(topic, cls) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a formula reference for Indian students. Given a topic, return ALL formulas from the ${cls} NCERT/CBSE/NEET/JEE syllabus as a JSON array. Each item: { name, formula (with variables defined), unit (or null), description (one line) }. Return ONLY a valid JSON array, no markdown.`
        },
        { role: 'user', content: `All formulas for topic: "${topic}" at ${cls} level.` }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    })
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '[]'
  try { return JSON.parse(text) }
  catch { const m = text.match(/\[[\s\S]*\]/); return m ? JSON.parse(m[0]) : [] }
}

function TopicSearch() {
  const [topic, setTopic] = useState('')
  const [cls, setCls] = useState('Class 12')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET', 'JEE']

  const handleSearch = async () => {
    if (!topic.trim()) return
    setLoading(true); setResults(null); setError(null)
    try { setResults(await searchTopicFormulas(topic.trim(), cls)) }
    catch { setError('Something went wrong. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <section id="search" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">Free — no login needed</p>
        <h2 className="text-4xl md:text-5xl font-black text-center tracking-tighter text-black mb-4">
          Type a topic.<br /><span className="text-neutral-300">Get every formula.</span>
        </h2>
        <p className="text-center text-sm text-neutral-500 mb-10">Type "magnetic force" or "thermodynamics" — get all relevant formulas for your class instantly.</p>

        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {classes.map(c => (
            <button key={c} onClick={() => setCls(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${cls === c ? 'bg-black text-white border-black' : 'border-black/10 text-neutral-600 hover:border-black/30'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          <input
            type="text" value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. magnetic force, refraction, ideal gas..."
            className="flex-1 border border-black/10 rounded-full px-6 py-3.5 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black/30 bg-white"
          />
          <button onClick={handleSearch} disabled={loading || !topic.trim()}
            className="bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search →'}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-600 text-center mb-6">{error}</div>}

        {results && results.length === 0 && (
          <div className="text-center py-10 text-neutral-400 text-sm">No formulas found. Try a different topic.</div>
        )}

        {results && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-4">{results.length} formula{results.length > 1 ? 's' : ''} · "{topic}" · {cls}</p>
            <div className="space-y-3">
              {results.map((f, i) => (
                <div key={i} className="bg-white border border-black/8 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-black">{f.name}</p>
                      {f.unit && <p className="text-xs text-neutral-400 mt-0.5">Unit: {f.unit}</p>}
                    </div>
                    <code className="text-sm bg-neutral-50 border border-black/6 px-3 py-1.5 rounded-xl font-mono text-black whitespace-normal break-words sm:whitespace-nowrap sm:shrink-0 max-w-full overflow-x-auto block">{f.formula}</code>
                  </div>
                  <p className="text-xs text-neutral-500">{f.description}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-neutral-400 mt-6">Sign in for chapter formula sheets, Formula Finder, and more.</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function LandingFormulaFinder({ navigate }) {
  const [question, setQuestion] = useState('')
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usesLeft, setUsesLeft] = useState(MAX_FREE_USES - getFreeUses())
  const [showWall, setShowWall] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => setImageBase64(reader.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const handleFind = async () => {
    if (!question.trim() && !imageBase64) return
    if (getFreeUses() >= MAX_FREE_USES) { setShowWall(true); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await findFormula(question, imageBase64)
      setResult(res)
      incrementFreeUses()
      setUsesLeft(MAX_FREE_USES - getFreeUses())
      if (getFreeUses() >= MAX_FREE_USES) setShowWall(true)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <section id="finder-free" className="py-24 px-6 bg-neutral-50">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">Try it free — no login</p>
        <h2 className="text-4xl font-black text-center tracking-tighter text-black mb-4">
          Stuck on a question?<br /><span className="text-neutral-300">We'll find the formula.</span>
        </h2>
        <p className="text-center text-sm text-neutral-500 mb-2">Paste your question or upload an image — get the exact formula to use. No solution given.</p>
        <p className="text-center text-xs text-neutral-400 mb-10">{usesLeft > 0 ? `${usesLeft} free use${usesLeft > 1 ? 's' : ''} remaining` : 'Sign in to continue for free'}</p>

        <div className="relative">
          <div className={showWall ? 'pointer-events-none' : ''}>
            <div className="mb-4">
              <label className="block w-full border-2 border-dashed border-black/10 rounded-2xl p-6 text-center cursor-pointer hover:border-black/30 transition-all bg-white">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {image ? <img src={image} className="max-h-40 mx-auto rounded-xl object-contain" /> : (
                  <div><p className="text-2xl mb-2">📷</p><p className="text-sm text-neutral-500">Click to upload question image</p><p className="text-xs text-neutral-400 mt-1">PNG, JPG supported</p></div>
                )}
              </label>
              {image && <button onClick={() => { setImage(null); setImageBase64(null) }} className="text-xs text-neutral-400 hover:text-black mt-2 transition-colors">Remove image</button>}
            </div>

            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              className="w-full border border-black/10 rounded-2xl p-5 text-sm text-black placeholder-neutral-400 resize-none focus:outline-none focus:border-black/30 bg-white"
              rows={4} placeholder="e.g. A ball is thrown upward with velocity 20 m/s, find maximum height..." />

            <button onClick={handleFind} disabled={loading || (!question.trim() && !imageBase64)}
              className="mt-4 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Finding formula...</> : 'Find Formula →'}
            </button>

            {error && <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5"><p className="text-sm text-red-600">{error}</p></div>}

            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-4">Formula(s) to use</p>
                <div className="space-y-3 mb-4">
                  {result.formulas?.map((f, i) => (
                    <div key={i} className="bg-white border border-black/8 rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                        <p className="text-sm font-semibold text-black">{f.name}</p>
                        <code className="text-sm bg-neutral-50 border border-black/6 px-3 py-1 rounded-lg font-mono text-black whitespace-nowrap">{f.formula}</code>
                      </div>
                      <p className="text-xs text-neutral-500">{f.why}</p>
                    </div>
                  ))}
                </div>
                {result.hint && (
                  <div className="bg-neutral-50 border border-black/6 rounded-2xl p-5">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-2">Approach Hint</p>
                    <p className="text-sm text-neutral-600">{result.hint}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* LOGIN WALL */}
          {showWall && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <p className="text-3xl mb-4">🔍</p>
              <h3 className="text-xl font-black text-black mb-2">You've used your 3 free searches</h3>
              <p className="text-sm text-neutral-500 mb-6 max-w-xs">Sign in for unlimited Formula Finder, chapter sheets, study streak, and more — all free.</p>
              <button onClick={() => navigate('/login')}
                className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-105">
                Sign in with Google — it's free →
              </button>
              <p className="text-xs text-neutral-400 mt-4">No credit card. No spam. Just formulas.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-['Inter']">

      {/* NAVBAR */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-black/8 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 flex items-center gap-4 sm:gap-10 shadow-sm w-[92%] sm:w-auto justify-between sm:justify-start">
        <span className="text-sm sm:text-base font-semibold tracking-tight text-black whitespace-nowrap">Formula Labs</span>
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-500 whitespace-nowrap">
          <a href="#search" className="hover:text-black transition-colors">Formula Search</a>
          <a href="#finder-free" className="hover:text-black transition-colors">Formula Finder</a>
          <a href="#how" className="hover:text-black transition-colors">How it works</a>
        </div>
        <button onClick={() => navigate('/login')} className="bg-black text-white text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0">
          Get Started
        </button>
      </nav>

      {/* HERO */}
<section className="bg-white">
  {/* Nav */}
  <nav className="flex items-center justify-between px-8 py-5 max-w-[1000px] mx-auto">
    <span className="text-[15px] font-semibold text-[#1D1D1F]">FormulaLabs</span>
    <div className="hidden md:flex gap-8 text-[13px] text-[#1D1D1F]">
      <a href="/explorer" className="hover:text-[#86868B] transition-colors">Explorer</a>
      <a href="/finder" className="hover:text-[#86868B] transition-colors">Finder</a>
      <a href="/pricing" className="hover:text-[#86868B] transition-colors">Pricing</a>
    </div>
    
     <a href="/login"
      className="text-[13px] text-white bg-[#1D1D1F] px-[18px] py-2 rounded-full hover:bg-black transition-colors"
    >
      Get started
    </a>
  </nav>

  {/* Hero content */}
  <div className="text-center px-10 pt-20 pb-16 md:pt-24 md:pb-20 max-w-[720px] mx-auto">
    <p className="text-[13px] text-[#86868B] tracking-[0.3px] mb-5">
      Class 9–12 · NEET · JEE
    </p>

    <h1 className="text-[40px] md:text-[56px] leading-[1.08] font-semibold tracking-[-1.5px] text-[#1D1D1F] mb-6">
      Sharpen your approach
      <br />
      until it's instinct.
    </h1>

    <p className="text-[17px] md:text-[19px] text-[#86868B] max-w-[460px] mx-auto mb-9 leading-relaxed">
      Paste any question. See the exact approach and the formula behind it.
      You still do the solving.
    </p>

    <div className="flex gap-4 justify-center items-center">
      
        href="/login"
        className="text-[15px] text-white bg-[#1D1D1F] px-[26px] py-3 rounded-full hover:bg-black transition-colors"
      >
        Get started
      </a>
      
        href="#how-it-works"
        className="text-[15px] text-[#0071E3] hover:underline"
      >
        See how it works ›
      </a>
    </div>
  </div>

  {/* Accent mark + trust line */}
  <div className="text-center px-10 pb-24">
    <div className="inline-block w-14 h-[2px] bg-[#D4FF00]" />
    <p className="text-[13px] text-[#86868B] mt-3">
      3,200+ students building the habit that makes toppers
    </p>
  </div>
</section>
      {/* STATS */}
      <section className="py-12 px-6 border-y border-black/6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ number: '6', label: 'Classes covered' }, { number: '4', label: 'Subjects' }, { number: '80+', label: 'Chapters' }, { number: '100%', label: 'Free to start' }].map(({ number, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-black mb-1">{number}</p>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TOPIC FORMULA SEARCH */}
      <TopicSearch />

      {/* FREE FORMULA FINDER */}
      <LandingFormulaFinder navigate={navigate} />

      {/* SUBJECTS */}
      <section id="subjects" className="py-24 px-6">
        <p className="text-center text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">What we cover</p>
        <h2 className="text-4xl font-black text-center tracking-tighter text-black mb-12">Built for every subject.</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { subject: 'Physics', desc: 'Mechanics, Optics, Electricity, Modern Physics and more', color: 'bg-blue-50 border-blue-100', emoji: '⚡' },
            { subject: 'Chemistry', desc: 'Organic, Inorganic, Physical Chemistry by chapter', color: 'bg-green-50 border-green-100', emoji: '🧪' },
            { subject: 'Mathematics', desc: 'Calculus, Algebra, Trigonometry, Coordinate Geometry', color: 'bg-orange-50 border-orange-100', emoji: '📐' },
            { subject: 'Biology', desc: 'Physiology, Genetics, Ecology — NEET focused', color: 'bg-pink-50 border-pink-100', emoji: '🧬' },
          ].map(({ subject, desc, color, emoji }) => (
            <motion.div key={subject} whileHover={{ y: -4 }} onClick={() => navigate('/login')} className={`${color} border rounded-2xl p-6 cursor-pointer transition-all`}>
              <p className="text-2xl mb-3">{emoji}</p>
              <p className="text-lg font-bold text-black mb-2">{subject}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-neutral-50">
        <p className="text-center text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">The process</p>
        <h2 className="text-4xl md:text-5xl font-black text-center tracking-tighter mb-16 text-black">Three steps.<br />Zero confusion.</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Pick your class', desc: 'Class 9 to 12, NEET or JEE. Syllabus auto-updates to match.' },
            { step: '02', title: 'Choose subject & chapter', desc: 'Full NCERT syllabus. Drill into exactly the chapter you need.' },
            { step: '03', title: 'Get your formula sheet', desc: 'Clean, exam-ready sheet. Or use Formula Finder to identify which formula solves your question.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white border border-black/10 rounded-2xl p-8">
              <p className="text-5xl font-black text-black/10 mb-6">{step}</p>
              <p className="text-lg font-bold text-black mb-3">{title}</p>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        {floatingFormulas.slice(0, 5).map((f, i) => (
          <motion.div key={i} className={`absolute font-mono font-bold text-black/4 select-none pointer-events-none ${f.size}`}
            style={{ left: f.x, top: f.y }} animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}>
            {f.text}
          </motion.div>
        ))}
        <div className="relative z-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-6">Ready to study<br />smarter?</h2>
          <p className="text-neutral-500 mb-10 max-w-md mx-auto">Join students who never waste time hunting for formulas again.</p>
          <button onClick={() => navigate('/login')} className="bg-black text-white px-10 py-5 rounded-full text-base font-medium hover:bg-neutral-800 transition-all hover:scale-105">
            Start for free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/8 py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400 text-center">
        <span className="font-semibold text-black">Formula Labs</span>
        <div className="flex gap-6 text-xs items-center">
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
          <a href="mailto:shivenbindal@gmail.com" className="hover:text-black transition-colors">Contact</a>
          <a href="https://instagram.com/nev.sturn" target="_blank" rel="noreferrer" className="hover:text-black transition-colors flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Instagram
          </a>
        </div>
        <span className="text-xs">© 2026 Formula Labs</span>
      </footer>

    </div>
  )
}
