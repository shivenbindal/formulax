import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { Heart, FileText, Download, ChevronRight, Sparkles, BookOpen, Grid3X3, List } from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'
import { syllabus } from '../../data/syllabus'
import { getInlineUrl, savedDocId } from '../../utils/dashboardHelpers'

export default function ExplorerPage() {
  const {
    user, dark, selectedClass, setSelectedClass, selectedSubject, setSelectedSubject,
    classChangeVersion, surface, text,
  } = useDashboard()
  const location = useLocation()
  const navigate = useNavigate()

  const [selectedChapter, setSelectedChapter] = useState(null)
  const [formulaSheet, setFormulaSheet] = useState(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [expandedCategory, setExpandedCategory] = useState(null)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (location.state?.openSheet) {
      const s = location.state.openSheet
      setSelectedClass(s.class)
      setSelectedSubject(s.subject)
      setSelectedChapter(s.chapter)
      setFormulaSheet({ fileUrl: s.fileUrl, fileType: s.fileType })
      setIsSaved(true)
      navigate('.', { replace: true, state: {} })
    }
  }, [])

  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    setSelectedChapter(null)
    setFormulaSheet(null)
  }, [classChangeVersion])

  const handleSubjectClick = (sub) => {
    setSelectedSubject(sub)
    setSelectedChapter(null)
    setFormulaSheet(null)
    setExpandedCategory(null)
  }

  const handleChapterClick = async (chapter) => {
    setSelectedChapter(chapter)
    setFormulaSheet(null)
    setIsSaved(false)
    setSheetLoading(true)
    setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    try {
      const q = query(
        collection(db, 'sheets'),
        where('class', '==', selectedClass),
        where('subject', '==', selectedSubject),
        where('chapter', '==', chapter)
      )
      const snap = await getDocs(q)
      if (!snap.empty) setFormulaSheet(snap.docs[0].data())
      if (user) {
        const savedSnap = await getDoc(
          doc(db, 'users', user.uid, 'saved', savedDocId(selectedClass, selectedSubject, chapter))
        )
        setIsSaved(savedSnap.exists())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSheetLoading(false)
    }
  }

  const handleToggleSave = async () => {
    if (!user || !selectedChapter || !formulaSheet) return
    const savedRef = doc(
      db,
      'users',
      user.uid,
      'saved',
      savedDocId(selectedClass, selectedSubject, selectedChapter)
    )
    try {
      if (isSaved) {
        await deleteDoc(savedRef)
        setIsSaved(false)
      } else {
        await setDoc(savedRef, {
          class: selectedClass,
          subject: selectedSubject,
          chapter: selectedChapter,
          fileUrl: formulaSheet.fileUrl,
          fileType: formulaSheet.fileType,
          savedAt: new Date().toISOString(),
        })
        setIsSaved(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const currentSubjects = Object.keys(syllabus[selectedClass] || {})
  const currentChapters = syllabus[selectedClass]?.[selectedSubject] || []

  const bgGradient = dark
    ? 'from-neutral-950 via-neutral-900 to-neutral-950'
    : 'from-blue-50 via-white to-purple-50'
  const cardBg = dark ? 'bg-neutral-900/50 backdrop-blur-sm border-white/10' : 'bg-white/80 backdrop-blur-sm border-white/40'
  const hoverEffect = dark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-50'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header Section */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <div className={`backdrop-blur-xl ${dark ? 'bg-neutral-950/80' : 'bg-white/80'}`}>
          <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={20} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Formula Explorer
                    </span>
                  </div>
                  <h1 className={`text-2xl md:text-3xl font-bold tracking-[-0.5px] ${text}`}>
                    {selectedClass} • {selectedSubject}
                  </h1>
                </div>
                <div className="flex items-center gap-2 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all ${
                      viewMode === 'grid'
                        ? dark
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                        : dark
                          ? 'text-neutral-400 hover:text-white'
                          : 'text-neutral-500 hover:text-black'
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-all ${
                      viewMode === 'list'
                        ? dark
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                        : dark
                          ? 'text-neutral-400 hover:text-white'
                          : 'text-neutral-500 hover:text-black'
                    }`}
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              {/* Subject Tabs */}
              <motion.div
                className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentSubjects.map((sub) => (
                  <motion.button
                    key={sub}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubjectClick(sub)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      selectedSubject === sub
                        ? dark
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                        : dark
                          ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {sub}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Chapters Grid/List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}
          >
            {currentChapters.map((chapter, index) => (
              <motion.button
                key={chapter}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChapterClick(chapter)}
                className={`relative group text-left overflow-hidden rounded-2xl border transition-all duration-300 ${
                  selectedChapter === chapter
                    ? dark
                      ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-400'
                    : `${cardBg} ${hoverEffect} border-transparent hover:border-current`
                } ${viewMode === 'list' ? 'p-4' : 'p-6'}`}
              >
                {/* Background glow effect */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    dark ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50'
                  }`}
                />

                <div className={`relative ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-blue-400/80' : 'text-blue-600/80'} mb-2`}>
                      Chapter {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className={`text-lg md:text-xl font-bold leading-snug ${text} group-hover:translate-x-1 transition-transform`}>
                      {chapter}
                    </h3>
                  </div>
                  {viewMode === 'list' && (
                    <ChevronRight
                      size={20}
                      className={`${
                        selectedChapter === chapter
                          ? dark
                            ? 'text-blue-400'
                            : 'text-blue-600'
                          : dark
                            ? 'text-neutral-400 group-hover:text-neutral-200'
                            : 'text-neutral-400 group-hover:text-neutral-600'
                      } group-hover:translate-x-1 transition-all`}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Sheet Viewer */}
          <AnimatePresence>
            {selectedChapter && (
              <motion.div
                ref={sheetRef}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                transition={{ duration: 0.4 }}
                className={`mt-12 rounded-3xl border overflow-hidden shadow-2xl ${cardBg}`}
              >
                {/* Header */}
                <div className={`border-b ${dark ? 'border-white/10' : 'border-black/10'}`}>
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                          {selectedClass} → {selectedSubject}
                        </p>
                        <h2 className={`text-2xl md:text-3xl font-bold tracking-[-0.5px] ${text}`}>
                          {selectedChapter}
                        </h2>
                      </div>
                      {formulaSheet && (
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggleSave}
                            className={`p-3 rounded-full transition-all ${
                              isSaved
                                ? dark
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                                : dark
                                  ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                            title={isSaved ? 'Remove from My Sheets' : 'Save to My Sheets'}
                          >
                            <Heart
                              size={20}
                              strokeWidth={2}
                              fill={isSaved ? 'currentColor' : 'none'}
                            />
                          </motion.button>
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={formulaSheet.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
                              dark
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-600/30'
                            }`}
                          >
                            <Download size={16} strokeWidth={2} />
                            Download
                          </motion.a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  {sheetLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center py-16"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`w-8 h-8 border-3 rounded-full animate-spin ${
                            dark ? 'border-blue-400 border-t-transparent' : 'border-blue-600 border-t-transparent'
                          }`}
                        />
                        <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          Loading formula sheet...
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {!sheetLoading && formulaSheet && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`rounded-2xl overflow-hidden ${dark ? 'bg-neutral-950' : 'bg-neutral-50'}`}
                      style={{ height: '600px' }}
                    >
                      {formulaSheet.fileType === 'image' ? (
                        <img
                          src={formulaSheet.fileUrl}
                          className="w-full h-full object-contain"
                          alt={selectedChapter}
                        />
                      ) : (
                        <iframe
                          src={getInlineUrl(formulaSheet.fileUrl)}
                          className="w-full h-full border-0"
                          title={selectedChapter}
                        />
                      )}
                    </motion.div>
                  )}

                  {!sheetLoading && !formulaSheet && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-2xl p-12 text-center ${dark ? 'bg-neutral-950/50' : 'bg-neutral-50/50'}`}
                    >
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="mb-4"
                      >
                        <BookOpen
                          size={32}
                          strokeWidth={1.5}
                          className={`mx-auto ${dark ? 'text-blue-400/50' : 'text-blue-600/50'}`}
                        />
                      </motion.div>
                      <h3 className={`text-lg font-bold mb-2 ${text}`}>Coming Soon</h3>
                      <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        We're preparing the formula sheet for {selectedChapter}. Check back soon!
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!selectedChapter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 text-center py-16"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Sparkles size={48} className={`mx-auto mb-4 ${dark ? 'text-blue-400/30' : 'text-blue-600/30'}`} />
              </motion.div>
              <p className={`text-lg font-semibold mb-2 ${text}`}>Select a chapter to get started</p>
              <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Choose from the list above to view formulas and concepts
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
