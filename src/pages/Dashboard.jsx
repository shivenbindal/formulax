import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { findFormula } from '../services/groq'
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const syllabus = {
  'Class 9': {
    Physics: ['Motion', 'Laws of Motion', 'Gravitation', 'Work & Energy', 'Sound'],
    Chemistry: ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms & Molecules', 'Structure of Atom'],
    Mathematics: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations', 'Triangles', 'Circles', 'Surface Areas & Volumes', 'Statistics'],
    Biology: ['Cell — Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Why Do We Fall Ill'],
  },
  'Class 10': {
    Physics: ['Light — Reflection & Refraction', 'Human Eye & Colourful World', 'Electricity', 'Magnetic Effects of Current'],
    Chemistry: ['Chemical Reactions & Equations', 'Acids Bases & Salts', 'Metals & Non-Metals', 'Carbon & Its Compounds', 'Periodic Classification'],
    Mathematics: ['Real Numbers', 'Polynomials', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Circles', 'Surface Areas & Volumes', 'Statistics', 'Probability'],
    Biology: ['Life Processes', 'Control & Coordination', 'Reproduction', 'Heredity & Evolution'],
  },
  'Class 11': {
    Physics: ['Units & Measurement', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work Energy & Power', 'Gravitation', 'Mechanical Properties of Solids', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'],
    Chemistry: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Organic Chemistry Basics', 'Hydrocarbons'],
    Mathematics: ['Sets', 'Relations & Functions', 'Trigonometry', 'Complex Numbers', 'Linear Inequalities', 'Permutations & Combinations', 'Binomial Theorem', 'Sequences & Series', 'Straight Lines', 'Conic Sections', 'Limits & Derivatives', 'Statistics', 'Probability'],
    Biology: ['Cell Biology', 'Biomolecules', 'Cell Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis', 'Respiration in Plants', 'Plant Growth', 'Digestion & Absorption', 'Breathing & Exchange of Gases', 'Body Fluids & Circulation', 'Excretory Products', 'Locomotion & Movement', 'Neural Control', 'Chemical Coordination'],
  },
  'Class 12': {
    Physics: ['Electric Charges & Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges & Magnetism', 'Magnetism & Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Atoms', 'Nuclei', 'Semiconductor Electronics'],
    Chemistry: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Coordination Compounds', 'Haloalkanes & Haloarenes', 'Alcohols Phenols & Ethers', 'Aldehydes Ketones & Acids', 'Amines', 'Biomolecules', 'Polymers'],
    Mathematics: ['Relations & Functions', 'Inverse Trigonometry', 'Matrices', 'Determinants', 'Continuity & Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'],
    Biology: ['Reproduction in Organisms', 'Sexual Reproduction in Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health & Disease', 'Microbes in Human Welfare', 'Biotechnology Principles', 'Biotechnology Applications', 'Organisms & Populations', 'Ecosystem', 'Biodiversity', 'Environmental Issues'],
  },
  'NEET': {
    Physics: ['Units & Measurement', 'Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects', 'EMI & AC', 'Optics', 'Modern Physics', 'Semiconductors'],
    Chemistry: ['Basic Concepts', 'Atomic Structure', 'Chemical Bonding', 'Equilibrium', 'Thermodynamics', 'Electrochemistry', 'Chemical Kinetics', 'Solutions', 'Surface Chemistry', 'Coordination Compounds', 'Organic Chemistry', 'Biomolecules', 'Polymers'],
    Biology: ['Cell Biology', 'Genetics & Evolution', 'Human Physiology', 'Plant Physiology', 'Reproduction', 'Ecology', 'Biotechnology'],
  },
  'JEE': {
    Physics: ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'SHM', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetism', 'EMI', 'Optics', 'Modern Physics', 'Thermodynamics'],
    Chemistry: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Electrochemistry', 'Kinetics', 'Coordination Compounds', 'Organic Chemistry', 'Hydrocarbons', 'GOC'],
    Mathematics: ['Algebra', 'Trigonometry', 'Coordinate Geometry', 'Calculus', 'Vectors & 3D', 'Probability', 'Matrices & Determinants', 'Complex Numbers'],
  },
}

function getInlineUrl(url) {
  if (!url) return url
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
}

function savedDocId(cls, subject, chapter) {
  return encodeURIComponent(`${cls}|${subject}|${chapter}`)
}

function FormulaFinder({ dark }) {
  const [question, setQuestion] = useState('')
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleFind = async () => {
    if (!question.trim() && !imageBase64) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await findFormula(question, imageBase64)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h2 className={`text-2xl font-black mb-2 ${dark ? 'text-white' : 'text-black'}`}>Formula Finder</h2>
      <p className="text-neutral-500 text-sm mb-8">Paste your question or upload an image — we'll tell you exactly which formula to use.</p>

      <div className="mb-4">
        <label className={`block w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dark ? 'border-white/15 hover:border-white/30' : 'border-black/10 hover:border-black/30'}`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {image ? (
            <img src={image} className="max-h-48 mx-auto rounded-xl object-contain" />
          ) : (
            <div>
              <p className="text-2xl mb-2">📷</p>
              <p className="text-sm text-neutral-500">Click to upload question image</p>
              <p className="text-xs text-neutral-400 mt-1">PNG, JPG supported</p>
            </div>
          )}
        </label>
        {image && (
          <button onClick={() => { setImage(null); setImageBase64(null) }} className="text-xs text-neutral-400 hover:text-black mt-2 transition-colors">
            Remove image
          </button>
        )}
      </div>

      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        className={`w-full border rounded-2xl p-5 text-sm placeholder-neutral-400 resize-none focus:outline-none ${dark ? 'border-white/15 bg-neutral-900 text-white focus:border-white/30' : 'border-black/10 bg-white text-black focus:border-black/30'}`}
        rows={4}
        placeholder="Or type your question here e.g. A ball is thrown upward with velocity 20 m/s, find maximum height..."
      />

      <button
        onClick={handleFind}
        disabled={loading || (!question.trim() && !imageBase64)}
        className={`mt-4 px-6 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
      >
        {loading ? (
          <>
            <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-black' : 'border-white'}`}></div>
            Finding formula...
          </>
        ) : 'Find Formula →'}
      </button>
      <p className="text-xs text-neutral-400 mt-3">✦ Free feature — no limits</p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-4">Formula(s) to use</p>
          <div className="space-y-3 mb-4">
            {result.formulas?.map((f, i) => (
              <div key={i} className={`border rounded-2xl p-5 ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/8'}`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>{f.name}</p>
                  <code className={`text-sm border px-3 py-1 rounded-lg font-mono whitespace-nowrap ${dark ? 'bg-neutral-800 border-white/10 text-white' : 'bg-neutral-50 border-black/6 text-black'}`}>
                    {f.formula}
                  </code>
                </div>
                <p className="text-xs text-neutral-500">{f.why}</p>
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

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('explorer')
  const [selectedClass, setSelectedClass] = useState('Class 11')
  const [selectedSubject, setSelectedSubject] = useState('Physics')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [formulaSheet, setFormulaSheet] = useState(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [classPanelOpen, setClassPanelOpen] = useState(false)
  const [classLoaded, setClassLoaded] = useState(false)
  const [dark, setDark] = useState(false)
  const [streak, setStreak] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [savedSheets, setSavedSheets] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)

  // Load saved class, dark mode preference, and update streak on mount
  useEffect(() => {
    const init = async () => {
      if (!user) return
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        const data = snap.exists() ? snap.data() : {}

        if (data.class && syllabus[data.class]) {
          setSelectedClass(data.class)
          setSelectedSubject(Object.keys(syllabus[data.class])[0])
        }
        if (typeof data.darkMode === 'boolean') {
          setDark(data.darkMode)
        }

        // streak logic
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        let newStreak = data.streak || 0
        if (data.lastActive === today) {
          // already counted
        } else if (data.lastActive === yesterday) {
          newStreak = newStreak + 1
          await setDoc(userRef, { streak: newStreak, lastActive: today }, { merge: true })
        } else {
          newStreak = 1
          await setDoc(userRef, { streak: newStreak, lastActive: today }, { merge: true })
        }
        setStreak(newStreak)
      } catch (err) {
        console.error(err)
      } finally {
        setClassLoaded(true)
      }
    }
    init()
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleClassChange = async (c) => {
    setSelectedClass(c)
    setSelectedChapter(null)
    setFormulaSheet(null)
    const subjects = Object.keys(syllabus[c] || {})
    setSelectedSubject(subjects[0])
    setClassPanelOpen(false)
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { class: c }, { merge: true })
      } catch (err) {
        console.error(err)
      }
    }
  }

  const toggleDark = async () => {
    const newVal = !dark
    setDark(newVal)
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { darkMode: newVal }, { merge: true })
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleChapterClick = async (chapter) => {
    setSelectedChapter(chapter)
    setFormulaSheet(null)
    setIsSaved(false)
    setSheetLoading(true)
    try {
      const q = query(
        collection(db, 'sheets'),
        where('class', '==', selectedClass),
        where('subject', '==', selectedSubject),
        where('chapter', '==', chapter)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        setFormulaSheet(snap.docs[0].data())
      }
      if (user) {
        const savedRef = doc(db, 'users', user.uid, 'saved', savedDocId(selectedClass, selectedSubject, chapter))
        const savedSnap = await getDoc(savedRef)
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
    const savedRef = doc(db, 'users', user.uid, 'saved', savedDocId(selectedClass, selectedSubject, selectedChapter))
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

  const fetchSavedSheets = async () => {
    if (!user) return
    setSavedLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'saved'))
      setSavedSheets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setSavedLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'saved') fetchSavedSheets()
  }, [activeTab])

  const openSavedSheet = (s) => {
    setSelectedClass(s.class)
    setSelectedSubject(s.subject)
    setSelectedChapter(s.chapter)
    setFormulaSheet({ fileUrl: s.fileUrl, fileType: s.fileType })
    setIsSaved(true)
    setActiveTab('explorer')
  }

  const handleUnsaveFromList = async (s) => {
    if (!user) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved', s.id))
      setSavedSheets(prev => prev.filter(x => x.id !== s.id))
      if (selectedChapter === s.chapter && selectedClass === s.class && selectedSubject === s.subject) {
        setIsSaved(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const currentSubjects = Object.keys(syllabus[selectedClass] || {})
  const currentChapters = syllabus[selectedClass]?.[selectedSubject] || []

  const bgMain = dark ? 'bg-neutral-950' : 'bg-[#FAFAF8]'
  const bgSurface = dark ? 'bg-neutral-900' : 'bg-white'
  const borderC = dark ? 'border-white/10' : 'border-black/6'
  const borderC2 = dark ? 'border-white/10' : 'border-black/8'
  const textPrimary = dark ? 'text-white' : 'text-black'

  if (!classLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgMain}`}>
        <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-white' : 'border-black'}`}></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex font-['Inter'] ${bgMain}`}>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${bgSurface} border-r ${borderC} flex flex-col h-screen sticky top-0 relative`}>
        <div className={`p-5 border-b ${borderC} flex items-center justify-between`}>
          {sidebarOpen && <span className={`font-black tracking-tight ${textPrimary}`}>Formula X</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-neutral-400 hover:text-black transition-colors">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'explorer', label: 'Explorer', icon: '⊞' },
            { id: 'formula-finder', label: 'Formula Finder', icon: '🔍' },
            { id: 'saved', label: 'My Sheets', icon: '♡' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === id
                  ? (dark ? 'bg-white text-black' : 'bg-black text-white')
                  : (dark ? 'text-neutral-400 hover:bg-white/5 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black')
              }`}
            >
              <span>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* DARK MODE TOGGLE */}
        <div className={`p-3 border-t ${borderC}`}>
          <button
            onClick={toggleDark}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${dark ? 'text-neutral-400 hover:bg-white/5 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'}`}
          >
            <span>{dark ? '☀️' : '🌙'}</span>
            {sidebarOpen && <span className="flex-1 text-left">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* CLASS SELECTOR */}
        <div className={`p-3 border-t ${borderC}`}>
          <button
            onClick={() => setClassPanelOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${dark ? 'text-neutral-400 hover:bg-white/5 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'}`}
          >
            <span>🎓</span>
            {sidebarOpen && (
              <span className={`flex-1 text-left font-medium ${textPrimary}`}>{selectedClass}</span>
            )}
            {sidebarOpen && <span className="text-xs text-neutral-400">edit</span>}
          </button>
        </div>

        <div className={`p-4 border-t ${borderC}`}>
          <div className="flex items-center gap-3">
            <img src={user?.photoURL} className="w-8 h-8 rounded-full" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${textPrimary}`}>{user?.displayName}</p>
                <button onClick={handleLogout} className="text-xs text-neutral-400 hover:text-black transition-colors">Sign out</button>
              </div>
            )}
          </div>
        </div>

        {/* SLIDE-IN CLASS PANEL */}
        <AnimatePresence>
          {classPanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setClassPanelOpen(false)}
                className="fixed inset-0 bg-black/30 z-40"
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'tween', duration: 0.25 }}
                className={`fixed top-0 left-0 h-screen w-72 ${bgSurface} border-r ${borderC2} z-50 p-6 shadow-xl`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-sm font-black ${textPrimary}`}>Change Class</h3>
                  <button onClick={() => setClassPanelOpen(false)} className="text-neutral-400 hover:text-black text-sm">✕</button>
                </div>
                <div className="space-y-2">
                  {Object.keys(syllabus).map(c => (
                    <button
                      key={c}
                      onClick={() => handleClassChange(c)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedClass === c
                          ? (dark ? 'bg-white text-black' : 'bg-black text-white')
                          : (dark ? 'border border-white/10 text-white hover:border-white/30' : 'border border-black/10 text-black hover:border-black/30')
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-auto">

        {/* HEADER */}
        <div className={`border-b ${borderC} ${bgSurface} px-8 py-4 flex items-center justify-between sticky top-0 z-10`}>
          <div>
            <p className="text-xs text-neutral-400">Good morning,</p>
            <h1 className={`text-base font-bold ${textPrimary}`}>{user?.displayName?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${dark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <span>🔥</span>
                <span>{streak} day{streak > 1 ? 's' : ''} streak</span>
              </div>
            )}
            <span className="text-xs text-neutral-400">{selectedClass}</span>
          </div>
        </div>

        {/* EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="p-8">
            <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-6">Select Subject</p>

            <div className="flex gap-3 mb-8 flex-wrap">
              {currentSubjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubject(sub); setSelectedChapter(null); setFormulaSheet(null) }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedSubject === sub
                      ? (dark ? 'bg-white text-black' : 'bg-black text-white')
                      : (dark ? 'border border-white/10 text-neutral-300 hover:border-white/30' : 'border border-black/10 text-neutral-600 hover:border-black/30')
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-4">Chapters</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentChapters.map((chapter, i) => (
                <motion.button
                  key={chapter}
                  whileHover={{ y: -2 }}
                  onClick={() => handleChapterClick(chapter)}
                  className={`text-left p-5 rounded-2xl border transition-all ${
                    selectedChapter === chapter
                      ? (dark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                      : (dark ? `${bgSurface} border-white/10 hover:border-white/30 text-white` : 'bg-white border-black/8 hover:border-black/20 text-black')
                  }`}
                >
                  <p className={`text-xs mb-1 ${selectedChapter === chapter ? (dark ? 'text-black/50' : 'text-white/50') : 'text-neutral-400'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="text-sm font-semibold">{chapter}</p>
                </motion.button>
              ))}
            </div>

            {selectedChapter && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 ${bgSurface} border ${borderC2} rounded-2xl p-8`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">{selectedClass} · {selectedSubject}</p>
                    <h2 className={`text-2xl font-black ${textPrimary}`}>{selectedChapter}</h2>
                  </div>
                  {formulaSheet && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleToggleSave}
                        className={`text-xl transition-transform hover:scale-110 ${isSaved ? 'text-red-500' : (dark ? 'text-neutral-500' : 'text-neutral-300')}`}
                        title={isSaved ? 'Remove from My Sheets' : 'Save to My Sheets'}
                      >
                        {isSaved ? '♥' : '♡'}
                      </button>
                      <a href={formulaSheet.fileUrl} target="_blank" rel="noreferrer"
                        className={`text-xs px-4 py-2 rounded-full transition-colors ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>
                        Download →
                      </a>
                    </div>
                  )}
                </div>

                {sheetLoading && (
                  <div className="text-center py-12">
                    <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`}></div>
                  </div>
                )}

                {!sheetLoading && formulaSheet && (
                  <div className={`rounded-xl overflow-hidden ${dark ? 'bg-neutral-800' : 'bg-neutral-50'}`} style={{ height: '600px' }}>
                    {formulaSheet.fileType === 'image' ? (
                      <img src={formulaSheet.fileUrl} className="w-full h-full object-contain" alt={selectedChapter} />
                    ) : (
                      <iframe src={getInlineUrl(formulaSheet.fileUrl)} className="w-full h-full border-0" title={selectedChapter} />
                    )}
                  </div>
                )}

                {!sheetLoading && !formulaSheet && (
                  <div className={`rounded-xl p-10 text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                    <p className="text-2xl mb-3">📄</p>
                    <p className={`text-sm font-medium mb-1 ${textPrimary}`}>Formula sheet uploading soon</p>
                    <p className="text-xs text-neutral-400">We're adding {selectedChapter} — check back shortly.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* FORMULA FINDER */}
        {activeTab === 'formula-finder' && <FormulaFinder dark={dark} />}

        {/* SAVED */}
        {activeTab === 'saved' && (
          <div className="p-8">
            <h2 className={`text-2xl font-black mb-8 ${textPrimary}`}>My Sheets</h2>

            {savedLoading && (
              <div className="text-center py-12">
                <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`}></div>
              </div>
            )}

            {!savedLoading && savedSheets.length === 0 && (
              <div className="text-center py-20 text-neutral-400 text-sm">
                No saved sheets yet. Explore and save formula sheets.
              </div>
            )}

            {!savedLoading && savedSheets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedSheets.map(s => (
                  <div key={s.id} className={`${bgSurface} border ${borderC2} rounded-2xl p-5`}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs text-neutral-400">{s.class} · {s.subject}</p>
                      <button onClick={() => handleUnsaveFromList(s)} className="text-red-500 text-lg leading-none">♥</button>
                    </div>
                    <p className={`text-sm font-semibold mb-4 ${textPrimary}`}>{s.chapter}</p>
                    <button
                      onClick={() => openSavedSheet(s)}
                      className={`w-full text-xs py-2 rounded-full transition-colors ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
                    >
                      Open →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
