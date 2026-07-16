import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { findFormula } from '../services/groq'

const FREE_USES_KEY = 'fx_free_uses'
const MAX_FREE_USES = 3

function getFreeUses() { return parseInt(localStorage.getItem(FREE_USES_KEY) || '0') }
function incrementFreeUses() { localStorage.setItem(FREE_USES_KEY, getFreeUses() + 1) }

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const HERO_IMAGE_URL = 'https://res.cloudinary.com/dgkaho4y8/image/upload/YOUR_HERO_IMAGE.jpg'
const MISSION_IMAGE_URL = 'https://res.cloudinary.com/dgkaho4y8/image/upload/YOUR_DESK_IMAGE.jpg'

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
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[13px] text-[#86868B] tracking-[0.3px] mb-4">Free — no login needed</p>
        <h2 className="text-[36px] md:text-[44px] leading-[1.1] font-semibold tracking-[-1px] text-[#1D1D1F] mb-4">
          Type a topic. Get every formula.
        </h2>
        <p className="text-[15px] text-[#86868B] mb-10">
          Try "magnetic force" or "thermodynamics" — get all relevant formulas for your class, instantly.
        </p>

        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {classes.map(c => (
            <button
              key={c}
              onClick={() => setCls(c)}
              className={`px-4 py-1.5 rounded-full text-[13px] transition-colors ${
                cls === c
                  ? 'bg-[#1D1D1F] text-white'
                  : 'text-[#1D1D1F] border border-[#D2D2D7] hover:border-[#86868B]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. magnetic force, refraction, ideal gas..."
            className="flex-1 border border-[#D2D2D7] rounded-full px-6 py-3.5 text-[14px] text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#1D1D1F] bg-white"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !topic.trim()}
            className="bg-[#1D1D1F] text-white px-6 py-3.5 rounded-full text-[14px] hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search'}
          </button>
        </div>

        {error && (
          <div className="border border-[#D2D2D7] rounded-2xl p-5 text-[14px] text-[#1D1D1F] text-center mb-6">
            {error}
          </div>
        )}

        {results && results.length === 0 && (
          <div className="text-center py-10 text-[#86868B] text-[14px]">No formulas found. Try a different topic.</div>
        )}

        {results && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-left">
            <p className="text-[13px] text-[#86868B] mb-4 text-center">
              {results.length} formula{results.length > 1 ? 's' : ''} · "{topic}" · {cls}
            </p>
            <div className="space-y-3">
              {results.map((f, i) => (
                <div key={i} className="border border-[#D2D2D7] rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1D1D1F]">{f.name}</p>
                      {f.unit && <p className="text-[12px] text-[#86868B] mt-0.5">Unit: {f.unit}</p>}
                    </div>
                    <code className="text-[13px] bg-[#F5F5F7] px-3 py-1.5 rounded-xl font-mono text-[#1D1D1F] whitespace-normal break-words sm:whitespace-nowrap sm:shrink-0 max-w-full overflow-x-auto block">
                      {f.formula}
                    </code>
                  </div>
                  <p className="text-[13px] text-[#86868B]">{f.description}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[13px] text-[#86868B] mt-6">
              Sign in for chapter formula sheets, Formula Finder, and more.
            </p>
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
    <section id="finder-free" className="py-24 px-6 bg-[#FAFAFA]">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[13px] text-[#86868B] tracking-[0.3px] mb-4">Try it free — no login</p>
        <h2 className="text-[36px] md:text-[44px] leading-[1.1] font-semibold tracking-[-1px] text-[#1D1D1F] mb-4">
          Stuck on a question? We'll find the formula.
        </h2>
        <p className="text-[15px] text-[#86868B] mb-2">
          Paste your question or upload an image — get the exact formula to use. No solution given.
        </p>
        <p className="text-[13px] text-[#86868B] mb-10">
          {usesLeft > 0 ? `${usesLeft} free use${usesLeft > 1 ? 's' : ''} remaining` : 'Sign in to continue for free'}
        </p>

        <div className="relative text-left">
          <div className={showWall ? 'pointer-events-none' : ''}>
            <div className="mb-4">
              <label className="block w-full border border-dashed border-[#D2D2D7] rounded-2xl p-6 text-center cursor-pointer hover:border-[#86868B] transition-colors bg-white">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {image ? (
                  <img src={image} className="max-h-40 mx-auto rounded-xl object-contain" />
                ) : (
                  <div>
                    <p className="text-[14px] text-[#86868B]">Click to upload question image</p>
                    <p className="text-[12px] text-[#86868B] mt-1">PNG, JPG supported</p>
                  </div>
                )}
              </label>
              {image && (
                <button
                  onClick={() => { setImage(null); setImageBase64(null) }}
                  className="text-[12px] text-[#86868B] hover:text-[#1D1D1F] mt-2 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>

            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full border border-[#D2D2D7] rounded-2xl p-5 text-[14px] text-[#1D1D1F] placeholder-[#86868B] resize-none focus:outline-none focus:border-[#1D1D1F] bg-white"
              rows={4}
              placeholder="e.g. A ball is thrown upward with velocity 20 m/s, find maximum height..."
            />

            <button
              onClick={handleFind}
              disabled={loading || (!question.trim() && !imageBase64)}
              className="mt-4 bg-[#1D1D1F] text-white px-6 py-3 rounded-full text-[14px] hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Finding formula...</>
              ) : 'Find formula'}
            </button>

            {error && (
              <div className="mt-6 border border-[#D2D2D7] rounded-2xl p-5">
                <p className="text-[14px] text-[#1D1D1F]">{error}</p>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <p className="text-[13px] text-[#86868B] mb-4">Formula(s) to use</p>
                <div className="space-y-3 mb-4">
                  {result.formulas?.map((f, i) => (
                    <div key={i} className="border border-[#D2D2D7] rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                        <p className="text-[14px] font-semibold text-[#1D1D1F]">{f.name}</p>
                        <code className="text-[13px] bg-[#F5F5F7] px-3 py-1 rounded-lg font-mono text-[#1D1D1F] whitespace-nowrap">
                          {f.formula}
                        </code>
                      </div>
                      <p className="text-[13px] text-[#86868B]">{f.why}</p>
                    </div>
                  ))}
                </div>
                {result.approach && (
                  <div className="border border-[#D2D2D7] rounded-2xl p-5">
                    <p className="text-[12px] text-[#86868B] mb-3">Approach</p>
                    <div className="space-y-2">
                      {result.approach.map((step, i) => (
                        <div key={i} className="flex gap-3 text-[13px] text-[#1D1D1F]">
                          <span className="text-[#86868B]">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {showWall && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            >
              <h3 className="text-[20px] font-semibold text-[#1D1D1F] mb-2">You've used your 3 free searches</h3>
              <p className="text-[14px] text-[#86868B] mb-6 max-w-xs">
                Sign in for unlimited Formula Finder, chapter sheets, study streak, and more — all free.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full text-[14px] hover:bg-black transition-colors"
              >
                Sign in with Google — it's free
              </button>
              <p className="text-[12px] text-[#86868B] mt-4">No credit card. No spam. Just formulas.</p>
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
    <div className="min-h-screen bg-white font-['Inter']">

      {/* NAV — overlaid on hero image */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 max-w-[1100px] mx-auto">
        <span className="text-[15px] font-semibold text-white">FormulaLabs</span>
        <div className="hidden md:flex gap-8 text-[13px] text-white/80">
          <a href="/explorer" className="hover:text-white transition-colors">Explorer</a>
          <a href="/finder" className="hover:text-white transition-colors">Finder</a>
          <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        
          <a href="/login"
          className="text-[13px] text-[#1D1D1F] bg-white px-[18px] py-2 rounded-full hover:bg-white/90 transition-colors"
        >
          Get started
        </a>
      </nav>

      {/* HERO — full-bleed photo */}
      <section className="relative h-[640px] flex items-end">
        <img
          src="https://res.cloudinary.com/dgkaho4y8/image/upload/v1784199745/iewek-gnos-hhUx08PuYpc-unsplash_qiie5a.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="relative z-[1] px-10 md:px-16 pb-20 max-w-[640px]">
          <p className="text-[13px] text-white/70 tracking-[0.3px] mb-5">Class 9–12 · NEET · JEE</p>
          <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-semibold tracking-[-1.5px] text-white mb-6">
            Sharpen your approach until it's instinct.
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/80 max-w-[440px] mb-8 leading-relaxed">
            Paste any question. See the exact approach and the formula behind it. You still do the solving.
          </p>
          <div className="flex gap-4 items-center">
            
           <a   href="/login"
              className="text-[15px] text-[#1D1D1F] bg-white px-[26px] py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Get started
            </a>
            <a href="#how" className="text-[15px] text-white hover:underline">
              See how it works ›
            </a>
          </div>
        </div>
      </section>

      {/* MISSION — dark editorial section, like the template's "Fueling Minds" block */}
      <section className="bg-[#EDEDED] py-20 px-10 md:px-16">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <h2 className="text-[36px] md:text-[48px] leading-[1.05] font-semibold tracking-[-1.5px] text-[#1D1D1F]">
            Build the instinct.
            <br />
            Become the topper.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-[15px] text-[#3A3A3C] leading-relaxed">
                FormulaLabs doesn't solve the question for you. It shows you the exact approach and formula,
                so every question you practice sharpens the instinct you'll need on exam day.
              </p>
            </div>
            <div>
              <p className="text-[15px] text-[#3A3A3C] leading-relaxed">
                Free chapter formula sheets across Class 9-12, NEET, and JEE, plus Formula Finder for the
                questions that stump you. Built by a student, for students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND IMAGE MOMENT — desk/study photo, editorial full-width */}
      <section className="relative h-[360px]">
        <img
          src="https://res.cloudinary.com/dgkaho4y8/image/upload/v1784199746/thought-catalog-505eectW54k-unsplash_umo8up.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      {/* STATS */}
      <section className="py-14 px-6 border-t border-[#D2D2D7]">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '6', label: 'Classes covered' },
            { number: '4', label: 'Subjects' },
            { number: '80+', label: 'Chapters' },
            { number: '100%', label: 'Free to start' },
          ].map(({ number, label }) => (
            <div key={label}>
              <p className="text-[28px] font-semibold text-[#1D1D1F] mb-1">{number}</p>
              <p className="text-[12px] text-[#86868B] tracking-[0.3px]">{label}</p>
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
        <div className="text-center mb-14">
          <p className="text-[13px] text-[#86868B] tracking-[0.3px] mb-4">What we cover</p>
          <h2 className="text-[36px] md:text-[44px] font-semibold tracking-[-1px] text-[#1D1D1F]">
            Built for every subject.
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { subject: 'Physics', desc: 'Mechanics, optics, electricity, modern physics and more' },
            { subject: 'Chemistry', desc: 'Organic, inorganic, physical chemistry by chapter' },
            { subject: 'Mathematics', desc: 'Calculus, algebra, trigonometry, coordinate geometry' },
            { subject: 'Biology', desc: 'Physiology, genetics, ecology — NEET focused' },
          ].map(({ subject, desc }) => (
            <div
              key={subject}
              onClick={() => navigate('/login')}
              className="border border-[#D2D2D7] rounded-2xl p-6 cursor-pointer hover:border-[#1D1D1F] transition-colors"
            >
              <p className="text-[16px] font-semibold text-[#1D1D1F] mb-2">{subject}</p>
              <p className="text-[13px] text-[#86868B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-[#FAFAFA]">
        <div className="text-center mb-16">
          <p className="text-[13px] text-[#86868B] tracking-[0.3px] mb-4">The process</p>
          <h2 className="text-[36px] md:text-[44px] font-semibold tracking-[-1px] text-[#1D1D1F]">
            Three steps. Zero confusion.
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Pick your class', desc: 'Class 9 to 12, NEET or JEE. Syllabus auto-updates to match.' },
            { step: '02', title: 'Choose subject and chapter', desc: 'Full NCERT syllabus. Drill into exactly the chapter you need.' },
            { step: '03', title: 'Get your formula sheet', desc: 'Clean, exam-ready sheet. Or use Formula Finder to identify which formula solves your question.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white border border-[#D2D2D7] rounded-2xl p-8">
              <p className="text-[13px] text-[#86868B] mb-4">{step}</p>
              <p className="text-[16px] font-semibold text-[#1D1D1F] mb-3">{title}</p>
              <p className="text-[13px] text-[#86868B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 text-center">
        <h2 className="text-[40px] md:text-[52px] leading-[1.1] font-semibold tracking-[-1.5px] text-[#1D1D1F] mb-6">
          Start building the habit
          <br />
          that makes toppers.
        </h2>
        
          href="/login"
          className="inline-block bg-[#1D1D1F] text-white px-10 py-4 rounded-full text-[15px] hover:bg-black transition-colors"
        >
          Get started
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D2D2D7] py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#86868B] text-center">
        <span className="font-semibold text-[#1D1D1F]">FormulaLabs</span>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:text-[#1D1D1F] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#1D1D1F] transition-colors">Terms</a>
          <a href="mailto:shivenbindal@gmail.com" className="hover:text-[#1D1D1F] transition-colors">Contact</a>
          <a href="https://instagram.com/nev.sturn" target="_blank" rel="noreferrer" className="hover:text-[#1D1D1F] transition-colors">
            Instagram
          </a>
        </div>
        <span>© 2026 FormulaLabs</span>
      </footer>

    </div>
  )
}
