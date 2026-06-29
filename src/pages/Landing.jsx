import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

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

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-['Inter']">

      {/* NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-black/8 rounded-full px-8 py-3 flex items-center gap-10 shadow-sm whitespace-nowrap">
        <span className="text-base font-semibold tracking-tight text-black">Formula X</span>
        <div className="flex items-center gap-8 text-sm text-neutral-500">
          <a href="#subjects" className="hover:text-black transition-colors">Subjects</a>
          <a href="#finder" className="hover:text-black transition-colors">Formula Finder</a>
          <a href="#how" className="hover:text-black transition-colors">How it works</a>
        </div>
        <button onClick={() => navigate('/login')} className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-neutral-800 transition-colors">
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <section className="min-h-screen relative flex flex-col items-center justify-center text-center px-6 pt-32 overflow-hidden">

        {/* FLOATING FORMULAS */}
        {floatingFormulas.map((f, i) => (
          <motion.div
            key={i}
            className={`absolute font-mono font-bold text-black/6 select-none pointer-events-none ${f.size}`}
            style={{ left: f.x, top: f.y }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
          >
            {f.text}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10"
        >
          

          <h1 className="text-6xl md:text-8xl font-black text-black leading-none tracking-tighter mb-6">
            Every formula.<br />
            <span className="text-neutral-300">One place.</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Formula sheets for Class 9–12, NEET and JEE — filtered by subject and chapter.
            Plus a free tool that tells you which formula solves your question.
          </p>
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-105">
              Explore Formula Sheets →
            </button>
            <button onClick={() => navigate('/login')} className="border border-black/15 text-black px-8 py-4 rounded-full text-sm font-medium hover:border-black/40 transition-all">
              Try Formula Finder
            </button>
          </div>
        </motion.div>

        {/* FLOATING TAGS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-wrap gap-3 justify-center mt-16 relative z-10"
        >
          {['Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET', 'JEE', 'CBSE Boards'].map(tag => (
            <span key={tag} className="bg-white border border-black/10 text-neutral-600 text-xs px-4 py-2 rounded-full shadow-sm">
              {tag}
            </span>
          ))}
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section className="py-12 px-6 border-y border-black/6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '6', label: 'Classes covered' },
            { number: '4', label: 'Subjects' },
            { number: '80+', label: 'Chapters' },
            { number: '100%', label: 'Free to start' },
          ].map(({ number, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-black mb-1">{number}</p>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

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
            <motion.div
              key={subject}
              whileHover={{ y: -4 }}
              onClick={() => navigate('/login')}
              className={`${color} border rounded-2xl p-6 cursor-pointer transition-all`}
            >
              <p className="text-2xl mb-3">{emoji}</p>
              <p className="text-lg font-bold text-black mb-2">{subject}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FORMULA FINDER */}
      <section id="finder" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-black rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="inline-block bg-white/10 text-white text-xs px-3 py-1 rounded-full mb-4">Free for everyone</span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4">
                Stuck on a question?<br />We won't solve it for you.
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                Upload your question image or paste the text — Formula X identifies exactly which formula applies. No full solution. You learn, not copy.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Text questions
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Image upload
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Instant result
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-black px-8 py-4 rounded-full text-sm font-medium hover:bg-neutral-100 transition-all whitespace-nowrap hover:scale-105 shrink-0"
            >
              Try Formula Finder →
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-neutral-50">
        <p className="text-center text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">The process</p>
        <h2 className="text-4xl md:text-5xl font-black text-center tracking-tighter mb-16 text-black">
          Three steps.<br />Zero confusion.
        </h2>
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
          <motion.div
            key={i}
            className={`absolute font-mono font-bold text-black/4 select-none pointer-events-none ${f.size}`}
            style={{ left: f.x, top: f.y }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
          >
            {f.text}
          </motion.div>
        ))}
        <div className="relative z-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-6">
            Ready to study<br />smarter?
          </h2>
          <p className="text-neutral-500 mb-10 max-w-md mx-auto">Join students who never waste time hunting for formulas again.</p>
          <button onClick={() => navigate('/login')} className="bg-black text-white px-10 py-5 rounded-full text-base font-medium hover:bg-neutral-800 transition-all hover:scale-105">
            Start for free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/8 py-8 px-6 flex items-center justify-between text-sm text-neutral-400">
        <span className="font-semibold text-black">Formula X</span>
        <div className="flex gap-6 text-xs">
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>
        <span className="text-xs">© 2025 Formula X</span>
      </footer>

    </div>
  )
}