import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'
import { Heart, BookmarkOpen, Trash2, ChevronRight } from 'lucide-react'

export default function MySheetsPage() {
  const { user, dark, text, bg } = useDashboard()
  const navigate = useNavigate()
  const [savedSheets, setSavedSheets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSavedSheets()
  }, [user])

  const fetchSavedSheets = async () => {
    if (!user) return
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'saved'))
      setSavedSheets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSaved = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved', id))
      setSavedSheets((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const openSheet = (s) => {
    navigate('/dashboard/explorer', { state: { openSheet: s } })
  }

  const bgGradient = dark ? 'from-neutral-950 via-neutral-900 to-neutral-950' : 'from-blue-50 via-white to-purple-50'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <div className={`backdrop-blur-xl ${dark ? 'bg-neutral-950/80' : 'bg-white/80'}`}>
          <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Heart size={24} className={dark ? 'text-red-400' : 'text-red-600'} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  My Sheets
                </span>
              </div>
              <h1 className={`text-3xl font-bold tracking-[-0.5px] ${text}`}>Your Saved Formulas</h1>
              <p className={`text-sm mt-2 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                All your bookmarked formula sheets in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <motion.div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {!loading && savedSheets.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border text-center py-20 ${
                dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
              } backdrop-blur-sm`}
            >
              <BookmarkOpen size={48} className={`mx-auto mb-4 ${dark ? 'text-neutral-700' : 'text-neutral-300'}`} />
              <p className={`text-lg font-semibold mb-2 ${text}`}>No saved sheets yet</p>
              <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Head to Explorer and save your first formula sheet
              </p>
            </motion.div>
          )}

          {!loading && savedSheets.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {savedSheets.map((sheet, index) => (
                <motion.div
                  key={sheet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border overflow-hidden shadow-lg group cursor-pointer transition-all ${
                    dark ? 'bg-neutral-900/50 border-white/10 hover:border-red-400/30' : 'bg-white/80 border-white/40 hover:border-red-300'
                  } backdrop-blur-sm`}
                >
                  <div className={`p-6 h-full flex flex-col ${dark ? 'bg-gradient-to-br from-red-900/10 to-pink-900/10' : 'bg-gradient-to-br from-red-50 to-pink-50'}`}>
                    <div className="flex-1">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {sheet.class} • {sheet.subject}
                      </p>
                      <h3 className={`text-xl font-bold mb-4 leading-snug ${text}`}>{sheet.chapter}</h3>
                    </div>

                    <div className="flex gap-2 pt-4 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openSheet(sheet)}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Open
                        <ChevronRight size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteSaved(sheet.id)}
                        className={`px-4 py-2.5 rounded-lg transition-all ${
                          dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
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
