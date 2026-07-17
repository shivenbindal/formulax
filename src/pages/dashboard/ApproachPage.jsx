import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Lightbulb, Zap, Flag, Check, Sparkles, AlertCircle } from 'lucide-react'
import { findFormula } from '../../services/groq'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function ApproachPage() {
  const { user, dark, bg, surface, text } = useDashboard()
  const [question, setQuestion] = useState('')
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reported, setReported] = useState({})
  const [showCamera, setShowCamera] = useState(false)
  const cameraRef = useRef(null)
  const videoRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    processImage(file)
  }

  const processImage = (file) => {
    setImage(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => setImageBase64(reader.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (err) {
      alert('Camera not accessible')
    }
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob((blob) => {
      processImage(blob)
      setShowCamera(false)
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    })
  }

  const handleFind = async () => {
    if (!question.trim() && !imageBase64) return
    setLoading(true)
    setResult(null)
    setError(null)
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
      setReported((prev) => ({ ...prev, [formula.name]: true }))
    } catch (err) {
      console.error(err)
    }
  }

  const bgGradient = dark
    ? 'from-neutral-950 via-neutral-900 to-neutral-950'
    : 'from-blue-50 via-white to-purple-50'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <div className={`backdrop-blur-xl ${dark ? 'bg-neutral-950/80' : 'bg-white/80'}`}>
          <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb size={24} className={dark ? 'text-yellow-400' : 'text-yellow-600'} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Approach Finder
                </span>
              </div>
              <h1 className={`text-3xl font-bold tracking-[-0.5px] ${text}`}>
                Find Your Solution's Approach
              </h1>
              <p className={`text-sm mt-2 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Paste your question or upload an image — we'll show you the approach and formula behind it.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border overflow-hidden shadow-lg ${
              dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
            } backdrop-blur-sm`}
          >
            <div className="p-8">
              {/* Camera Section */}
              {showCamera ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl bg-black mb-4" />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCamera(false)
                        videoRef.current?.srcObject?.getTracks().forEach((track) => track.stop())
                      }}
                      className="flex-1 px-6 py-3 rounded-full border-2 border-neutral-300 font-semibold hover:bg-neutral-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Camera size={18} />
                      Capture
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Image Upload Area */}
                  <div className="mb-6">
                    {image ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative rounded-2xl overflow-hidden bg-black/5 mb-3"
                      >
                        <img src={image} className="max-h-64 w-full object-contain rounded-2xl" alt="Question" />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setImage(null)
                            setImageBase64(null)
                          }}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                        >
                          ✕
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            dark ? 'border-white/10 hover:border-blue-400' : 'border-blue-300 hover:border-blue-500'
                          }`}
                        >
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <Upload size={24} className={`mx-auto mb-2 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                          <p className={`text-sm font-semibold ${text}`}>Upload</p>
                          <p className="text-xs text-neutral-500 mt-1">PNG, JPG</p>
                        </motion.label>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={startCamera}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                            dark ? 'border-white/10 hover:border-purple-400' : 'border-purple-300 hover:border-purple-500'
                          }`}
                        >
                          <Camera size={24} className={`mx-auto mb-2 ${dark ? 'text-purple-400' : 'text-purple-600'}`} />
                          <p className={`text-sm font-semibold ${text}`}>Camera</p>
                          <p className="text-xs text-neutral-500 mt-1">Live capture</p>
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Text Input */}
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Or type your question here... e.g., A ball is thrown upward with velocity 20 m/s, find maximum height..."
                    className={`w-full border-2 rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none transition-all ${
                      dark
                        ? 'border-white/10 bg-neutral-900 text-white focus:border-blue-400'
                        : 'border-blue-200 bg-white text-black focus:border-blue-500'
                    }`}
                    rows={5}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFind}
                      disabled={loading || (!question.trim() && !imageBase64)}
                      className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Finding...
                        </>
                      ) : (
                        <>
                          <Zap size={16} strokeWidth={2.5} />
                          Find Approach
                        </>
                      )}
                    </motion.button>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      <Sparkles size={14} />
                      Free • Unlimited
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 rounded-2xl p-6 border-2 ${
                dark ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
              } flex items-start gap-3`}
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 space-y-6"
            >
              {/* Approach */}
              {result.approach?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-2xl border overflow-hidden shadow-lg ${
                    dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
                  } backdrop-blur-sm`}
                >
                  <div className={`p-6 border-b ${dark ? 'border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${text}`}>
                      <Lightbulb size={20} className={dark ? 'text-yellow-400' : 'text-yellow-600'} />
                      The Approach
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {result.approach.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                          {i + 1}
                        </div>
                        <p className={`text-sm font-medium pt-1 ${text}`}>{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Formulas */}
              {result.formulas?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className={`text-lg font-bold ${text}`}>Formulas Referenced</h3>
                  {result.formulas.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-2xl border overflow-hidden ${
                        dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
                      } backdrop-blur-sm`}
                    >
                      <div className="p-6">
                        <p className={`text-sm font-bold mb-3 ${text}`}>{f.name}</p>
                        <code className={`block w-full px-4 py-3 rounded-lg text-sm font-mono overflow-x-auto mb-3 ${
                          dark ? 'bg-neutral-950 text-blue-300 border border-white/10' : 'bg-neutral-50 text-blue-700 border border-blue-100'
                        }`}>
                          {f.formula}
                        </code>
                        <p className={`text-xs leading-relaxed ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          {f.why}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleReport(f)}
                          disabled={reported[f.name]}
                          className={`text-xs font-semibold mt-3 flex items-center gap-1 transition-colors ${
                            reported[f.name]
                              ? dark
                                ? 'text-green-400'
                                : 'text-green-600'
                              : dark
                                ? 'text-neutral-400 hover:text-red-400'
                                : 'text-neutral-500 hover:text-red-600'
                          }`}
                        >
                          {reported[f.name] ? (
                            <>
                              <Check size={14} /> Reported
                            </>
                          ) : (
                            <>
                              <Flag size={14} /> Report
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
