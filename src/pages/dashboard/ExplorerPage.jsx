import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { Heart, FileText, Download } from 'lucide-react'
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
  const sheetRef = useRef(null)

  useEffect(() => {
    if (location.state?.openSheet) {
      const s = location.state.openSheet
      setSelectedClass(s.class); setSelectedSubject(s.subject)
      setSelectedChapter(s.chapter)
      setFormulaSheet({ fileUrl: s.fileUrl, fileType: s.fileType })
      setIsSaved(true)
      navigate('.', { replace: true, state: {} })
    }
  }, [])

  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return }
    setSelectedChapter(null); setFormulaSheet(null)
  }, [classChangeVersion])

  const handleSubjectClick = (sub) => {
    setSelectedSubject(sub); setSelectedChapter(null); setFormulaSheet(null)
  }

  const handleChapterClick = async (chapter) => {
    setSelectedChapter(chapter); setFormulaSheet(null); setIsSaved(false); setSheetLoading(true)
    setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    try {
      const q = query(collection(db, 'sheets'), where('class', '==', selectedClass), where('subject', '==', selectedSubject), where('chapter', '==', chapter))
      const snap = await getDocs(q)
      if (!snap.empty) setFormulaSheet(snap.docs[0].data())
      if (user) {
        const savedSnap = await getDoc(doc(db, 'users', user.uid, 'saved', savedDocId(selectedClass, selectedSubject, chapter)))
        setIsSaved(savedSnap.exists())
      }
    } catch (err) { console.error(err) }
    finally { setSheetLoading(false) }
  }

  const handleToggleSave = async () => {
    if (!user || !selectedChapter || !formulaSheet) return
    const savedRef = doc(db, 'users', user.uid, 'saved', savedDocId(selectedClass, selectedSubject, selectedChapter))
    try {
      if (isSaved) { await deleteDoc(savedRef); setIsSaved(false) }
      else {
        await setDoc(savedRef, { class: selectedClass, subject: selectedSubject, chapter: selectedChapter, fileUrl: formulaSheet.fileUrl, fileType: formulaSheet.fileType, savedAt: new Date().toISOString() })
        setIsSaved(true)
      }
    } catch (err) { console.error(err) }
  }

  const currentSubjects = Object.keys(syllabus[selectedClass] || {})
  const currentChapters = syllabus[selectedClass]?.[selectedSubject] || []
  const cardBase = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'

  return (
    <div className="p-6 md:p-8">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Select subject</p>
      <div className="flex gap-2 mb-8 flex-wrap">
        {currentSubjects.map(sub => (
          <button key={sub} onClick={() => handleSubjectClick(sub)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
              selectedSubject === sub
                ? dark ? 'bg-white text-black' : 'bg-black text-white'
                : dark ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-500 hover:bg-black/[0.03]'
            }`}>
            {sub}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-3">Chapters</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {currentChapters.map((chapter, i) => (
          <motion.button key={chapter} whileHover={{ y: -2 }} onClick={() => handleChapterClick(chapter)}
            className={`text-left p-5 rounded-2xl border shadow-sm transition-all ${
              selectedChapter === chapter
                ? dark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                : `${cardBase} hover:shadow-md ${text}`
            }`}>
            <p className={`text-[11px] mb-1 ${selectedChapter === chapter ? (dark ? 'text-black/40' : 'text-white/40') : 'text-neutral-400'}`}>{String(i + 1).padStart(2, '0')}</p>
            <p className="text-[13px] font-semibold leading-snug">{chapter}</p>
          </motion.button>
        ))}
      </div>

      {selectedChapter && (
        <motion.div ref={sheetRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`mt-8 border shadow-sm rounded-3xl p-6 md:p-8 ${cardBase}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-neutral-400 mb-1">{selectedClass} · {selectedSubject}</p>
              <h2 className={`text-xl md:text-2xl font-semibold tracking-[-0.3px] ${text}`}>{selectedChapter}</h2>
            </div>
            {formulaSheet && (
              <div className="flex items-center gap-2">
                <button onClick={handleToggleSave}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'text-red-500' : 'text-neutral-300 hover:text-neutral-400'}`}
                  title={isSaved ? 'Remove from My Sheets' : 'Save to My Sheets'}>
                  <Heart size={17} strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <a href={formulaSheet.fileUrl} target="_blank" rel="noreferrer"
                  className={`text-[12px] font-medium px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>
                  <Download size={13} strokeWidth={2} /> Download
                </a>
              </div>
            )}
          </div>
          {sheetLoading && (
            <div className="text-center py-12"><div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`} /></div>
          )}
          {!sheetLoading && formulaSheet && (
            <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-neutral-950' : 'bg-neutral-50'}`} style={{ height: '600px' }}>
              {formulaSheet.fileType === 'image'
                ? <img src={formulaSheet.fileUrl} className="w-full h-full object-contain" alt={selectedChapter} />
                : <iframe src={getInlineUrl(formulaSheet.fileUrl)} className="w-full h-full border-0" title={selectedChapter} />
              }
            </div>
          )}
          {!sheetLoading && !formulaSheet && (
            <div className={`rounded-2xl p-10 text-center ${dark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
              <FileText size={22} strokeWidth={1.5} className="mx-auto mb-3 text-neutral-400" />
              <p className={`text-[13px] font-medium mb-1 ${text}`}>Formula sheet uploading soon</p>
              <p className="text-[12px] text-neutral-400">We're adding {selectedChapter} — check back shortly.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
