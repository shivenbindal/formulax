import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Camera, Clock, Zap } from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function HistoryPage() {
  const { user, dark, text, bg } = useDashboard()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    if (!user) return
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'histories'), where('userId', '==', user.uid)))
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setHistory(items.slice(0, 50))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const bgGradient = dark ? 'from-neutral-950 via-neutral-900 to-neutral-950' : 'from-blue-50 via-white to-purple-50'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <div className={`backdrop-blur-xl ${dark ? 'bg-neutral-950/80' : 'bg-white/80'}`}>
          <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={24} className={dark ? 'text-amber-400' : 'text-amber-600'} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  History
                </span>
              </div>
              <h1 className={`text-3xl font-bold tracking-[-0.5px] ${text}`}>Your Approach History</h1>
              <p className={`text-sm mt-2 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                All your past searches and solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <motion.div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {!loading && history.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border text-center py-20 ${
                dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
              } backdrop-blur-sm`}
            >
              <Zap size={48} className={`mx-auto mb-4 ${dark ? 'text-neutral-700' : 'text-neutral-300'}`} />
              <p className={`text-lg font-semibold mb-2 ${text}`}>No history yet</p>
              <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Start solving problems with Approach Finder to see your history here
              </p>
            </motion.div>
          )}

          {!loading && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                    dark ? 'bg-neutral-900/50 border-white/10 hover:border-blue-400/30' : 'bg-white/80 border-white/40 hover:border-blue-300'
                  } backdrop-blur-sm`}
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {item.imageUsed && (
                            <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                              dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                            }`}>
                              <Camera size={12} />
                              Image
                            </div>
                          )}
                        </div>
                        <p className={`font-semibold truncate ${text}`}>{item.question}</p>
                        <p className={`text-xs mt-2 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          {new Date(item.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <motion.div animate={{ rotate: expandedId === item.id ? 180 : 0 }}>
                        {expandedId === item.id ? (
                          <ChevronUp className={dark ? 'text-neutral-400' : 'text-neutral-500'} />
                        ) : (
                          <ChevronDown className={dark ? 'text-neutral-400' : 'text-neutral-500'} />
                        )}
                      </motion.div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === item.id && item.result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-6 pt-6 border-t ${dark ? 'border-white/10' : 'border-neutral-200'} space-y-4`}
                      >
                        {/* Approach */}
                        {item.result.approach?.length > 0 && (
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                              Approach
                            </p>
                            <div className="space-y-2">
                              {item.result.approach.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                    dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {i + 1}
                                  </div>
                                  <p className={`text-sm pt-0.5 ${text}`}>{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Formulas */}
                        {item.result.formulas?.length > 0 && (
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                              Formulas
                            </p>
                            <div className="space-y-3">
                              {item.result.formulas.map((f, i) => (
                                <div key={i} className={`rounded-lg p-4 ${dark ? 'bg-neutral-950 border border-white/10' : 'bg-neutral-50 border border-neutral-200'}`}>
                                  <p className={`text-sm font-semibold mb-2 ${text}`}>{f.name}</p>
                                  <code className={`block text-xs font-mono p-2 rounded mb-2 overflow-x-auto ${
                                    dark ? 'bg-neutral-900 text-blue-300' : 'bg-white text-blue-700'
                                  }`}>
                                    {f.formula}
                                  </code>
                                  <p className={`text-xs ${dark ? 'text-neutral-500' : 'text-neutral-600'}`}>{f.why}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
