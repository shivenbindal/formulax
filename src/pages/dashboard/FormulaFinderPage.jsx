import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, Flag, Check } from 'lucide-react'
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
          userId: user.uid, userName: user.displayName, userEmail: user.email,
          question: question || '[Image question]', imageUsed: !!imageBase64,
          result: res, timestamp: new Date().toISOString(),
        })
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleReport = async (formula) => {
    if (!user) return
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid, userEmail: user.email,
        question: question || '[Image question]', formula, timestamp: new Date().toISOString(),
      })
      setReported(prev => ({ ...prev, [formula.name]: true }))
    } catch (err) { console.error(err) }
  }

  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'
  const inputC = dark ? 'border-white/[0.08] bg-neutral-900 text-white focus:border-white/20' : 'border-black/[0.06] bg-white text-black focus:border-black/20'
  const btnC = dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h2 className={`text-xl md:text-2xl font-semibold tracking-[-0.3px] mb-2 ${dark ? 'text-white' : 'text-black'}`}>Formula Finder</h2>
      <p className="text-neutral-400 text-[13px] mb-8">Paste your question or upload an image — we'll show you the approach and the formula behind it.</p>

      <div className="mb-4">
        <label className={`block w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dark ? 'border-white/[0.08] hover:border-white/20' : 'border-black/[0.06] hover:border-black/20'}`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {image ? <img src={image} className="max-h-48 mx-auto rounded-xl object-contain" /> : (
            <div>
              <Camera size={20} strokeWidth={1.5} className="mx-auto mb-2 text-neutral-400" />
              <p className="text-[13px] text-neutral-500">Click to upload question image</p>
              <p className="text-[11px] text-neutral-400 mt-1">PNG, JPG supported</p>
            </div>
          )}
        </label>
        {image && <button onClick={() => { setImage(null); setImageBase64(null) }} className="text-[11px] text-neutral-400 hover:text-black mt-2 transition-colors">Remove image</button>}
      </div>

      <textarea value={question} onChange={e => setQuestion(e.target.value)}
        className={`w-full border rounded-2xl p-5 text-[13px] placeholder-neutral-400 resize-none focus:outline-none ${inputC}`}
        rows={4} placeholder="Or type your question here e.g. A ball is thrown upward with velocity 20 m/s, find maximum height..." />

      <button onClick={handleFind} disabled={loading || (!question.trim() && !imageBase64)}
        className={`mt-4 px-6 py-3 rounded-full text-[13px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${btnC}`}>
        {loading ? <><div className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-black' : 'border-white'}`} />Finding approach...</> : 'Find approach →'}
      </button>
      <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1"><Sparkles size={11} strokeWidth={2} /> Free feature — no limits</p>

      {error && <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5"><p className="text-[13px] text-red-600">{error}</p></div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          {result.approach?.length > 0 && (
            <div className={`border shadow-sm rounded-2xl p-6 mb-4 ${cardC}`}>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">The approach</p>
              <ol className="space-y-3">
                {result.approach.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>{i + 1}</span>
                    <p className={`text-[13px] pt-0.5 ${dark ? 'text-neutral-200' : 'text-neutral-700'}`}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.formulas?.length > 0 && (
            <div className={`border shadow-sm rounded-2xl p-6 ${cardC}`}>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Formula(s) referenced</p>
              <div className="space-y-3">
                {result.formulas.map((f, i) => (
                  <div key={i} className={`border rounded-2xl p-5 ${dark ? 'bg-neutral-950 border-white/[0.06]' : 'bg-neutral-50 border-black/[0.04]'}`}>
                    <p className={`text-[13px] font-semibold mb-2 ${dark ? 'text-white' : 'text-black'}`}>{f.name}</p>
                    <code className={`block w-full text-[13px] border px-3 py-2 rounded-lg font-mono whitespace-normal break-words leading-relaxed ${dark ? 'bg-neutral-900 border-white/[0.06] text-white' : 'bg-white border-black/[0.04] text-black'}`}>{f.formula}</code>
                    <p className="text-[12px] text-neutral-500 mt-3 mb-3">{f.why}</p>
                    <button onClick={() => handleReport(f)} disabled={reported[f.name]}
                      className={`text-[11px] flex items-center gap-1 transition-colors ${reported[f.name] ? 'text-green-500 cursor-default' : 'text-neutral-300 hover:text-red-400'}`}>
                      {reported[f.name] ? <><Check size={11} /> Reported</> : <><Flag size={11} /> Report wrong formula</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
