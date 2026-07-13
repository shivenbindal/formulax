import { useState } from 'react'
import { motion } from 'framer-motion'
import { findFormula } from '../../services/groq'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function FormulaFinderPage() {
  const { user, dark } = useDashboard()
  const [question, setQuestion] = useState('')
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reported, setReported] = useState({})

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
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await findFormula(question, imageBase64)
      setResult(res)
      if (user) {
        await addDoc(collection(db, 'histories'), {
          userId: user.uid,
          userName: user.displayName,
          userEmail: user.email,
          question: question || '[Image question]',
          imageUsed: !!imageBase64,
          result: res,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleReport = async (formula) => {
    if (!user) return
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userEmail: user.email,
        question: question || '[Image question]',
        formula,
        timestamp: new Date().toISOString(),
      })
      setReported(prev => ({ ...prev, [formula.name]: true }))
    } catch (err) { console.error(err) }
  }

  const b = dark ? 'bg-neutral-900 border-white/10 text-white' : 'bg-white border-black/8 text-black'
  const inputC = dark ? 'border-white/15 bg-neutral-900 text-white focus:border-white/30' : 'border-black/10 bg-white text-black focus:border-black/30'
  const btnC = dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'

  return (
    <div className="p-8 max-w-2xl">
      <h2 className={`text-2xl font-black mb-2 ${dark ? 'text-white' : 'text-black'}`}>Formula Finder</h2>
      <p className="text-neutral-500 text-sm mb-8">Paste your question or upload an image — we'll tell you exactly which formula to use.</p>

      <div className="mb-4">
        <label className={`block w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dark ? 'border-white/15 hover:border-white/30' : 'border-black/10 hover:border-black/30'}`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {image ? <img src={image} className="max-h-48 mx-auto rounded-xl object-contain" /> : (
            <div><p className="text-2xl mb-2">📷</p><p className="text-sm text-neutral-500">Click to upload question image</p><p className="text-xs text-neutral-400 mt-1">PNG, JPG supported</p></div>
          )}
        </label>
        {image && <button onClick={() => { setImage(null); setImageBase64(null) }} className="text-xs text-neutral-400 hover:text-black mt-2 transition-colors">Remove image</button>}
      </div>

      <textarea value={question} onChange={e => setQuestion(e.target.value)}
        className={`w-full border rounded-2xl p-5 text-sm placeholder-neutral-400 resize-none focus:outline-none ${inputC}`}
        rows={4} placeholder="Or type your question here e.g. A ball is thrown upward with velocity 20 m/s, find maximum height..." />

      <button onClick={handleFind} disabled={loading || (!question.trim() && !imageBase64)}
        className={`mt-4 px-6 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${btnC}`}>
        {loading ? <><div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-black' : 'border-white'}`} />Finding formula...</> : 'Find Formula →'}
      </button>
      <p className="text-xs text-neutral-400 mt-3">✦ Free feature — no limits</p>

      {error && <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5"><p className="text-sm text-red-600">{error}</p></div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-4">Formula(s) to use</p>
          <div className="space-y-3 mb-4">
            {result.formulas?.map((f, i) => (
              <div key={i} className={`border rounded-2xl p-5 ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/8'}`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>{f.name}</p>
                  <code className={`text-sm border px-3 py-1 rounded-lg font-mono whitespace-nowrap ${dark ? 'bg-neutral-800 border-white/10 text-white' : 'bg-neutral-50 border-black/6 text-black'}`}>{f.formula}</code>
                </div>
                <p className="text-xs text-neutral-500 mb-3">{f.why}</p>
                <button
                  onClick={() => handleReport(f)}
                  disabled={reported[f.name]}
                  className={`text-xs transition-colors ${reported[f.name] ? 'text-green-500 cursor-default' : 'text-neutral-300 hover:text-red-400'}`}>
                  {reported[f.name] ? '✓ Reported' : '⚑ Report wrong formula'}
                </button>
              </div>
            ))}
          </div>
          {result.hint && (
            <div className={`border rounded-2xl p-5 ${dark ? 'bg-neutral-900 border-white/10' : 'bg-neutral-50 border-black/6'}`}>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-2">Approach Hint</p>
              <p className="text-sm text-neutral-600">{result.hint}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
