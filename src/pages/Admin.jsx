import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ADMIN_EMAIL = 'shivenbindal@gmail.com'
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const syllabus = {
  'Class 9': { Physics: ['Motion', 'Laws of Motion', 'Gravitation', 'Work & Energy', 'Sound'], Chemistry: ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms & Molecules', 'Structure of Atom'], Mathematics: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations', 'Triangles', 'Circles', 'Surface Areas & Volumes', 'Statistics'], Biology: ['Cell — Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Why Do We Fall Ill'] },
  'Class 10': { Physics: ['Light — Reflection & Refraction', 'Human Eye & Colourful World', 'Electricity', 'Magnetic Effects of Current'], Chemistry: ['Chemical Reactions & Equations', 'Acids Bases & Salts', 'Metals & Non-Metals', 'Carbon & Its Compounds', 'Periodic Classification'], Mathematics: ['Real Numbers', 'Polynomials', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Circles', 'Surface Areas & Volumes', 'Statistics', 'Probability'], Biology: ['Life Processes', 'Control & Coordination', 'Reproduction', 'Heredity & Evolution'] },
  'Class 11': { Physics: ['Units & Measurement', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work Energy & Power', 'Gravitation', 'Mechanical Properties of Solids', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'], Chemistry: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Organic Chemistry Basics', 'Hydrocarbons'], Mathematics: ['Sets', 'Relations & Functions', 'Trigonometry', 'Complex Numbers', 'Linear Inequalities', 'Permutations & Combinations', 'Binomial Theorem', 'Sequences & Series', 'Straight Lines', 'Conic Sections', 'Limits & Derivatives', 'Statistics', 'Probability'], Biology: ['Cell Biology', 'Biomolecules', 'Cell Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis', 'Respiration in Plants', 'Plant Growth', 'Digestion & Absorption', 'Breathing & Exchange of Gases', 'Body Fluids & Circulation', 'Excretory Products', 'Locomotion & Movement', 'Neural Control', 'Chemical Coordination'] },
  'Class 12': { Physics: ['Electric Charges & Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges & Magnetism', 'Magnetism & Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Atoms', 'Nuclei', 'Semiconductor Electronics'], Chemistry: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Coordination Compounds', 'Haloalkanes & Haloarenes', 'Alcohols Phenols & Ethers', 'Aldehydes Ketones & Acids', 'Amines', 'Biomolecules', 'Polymers'], Mathematics: ['Relations & Functions', 'Inverse Trigonometry', 'Matrices', 'Determinants', 'Continuity & Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'], Biology: ['Reproduction in Organisms', 'Sexual Reproduction in Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health & Disease', 'Microbes in Human Welfare', 'Biotechnology Principles', 'Biotechnology Applications', 'Organisms & Populations', 'Ecosystem', 'Biodiversity', 'Environmental Issues'] },
  'NEET': { Physics: ['Units & Measurement', 'Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects', 'EMI & AC', 'Optics', 'Modern Physics', 'Semiconductors'], Chemistry: ['Basic Concepts', 'Atomic Structure', 'Chemical Bonding', 'Equilibrium', 'Thermodynamics', 'Electrochemistry', 'Chemical Kinetics', 'Solutions', 'Surface Chemistry', 'Coordination Compounds', 'Organic Chemistry', 'Biomolecules', 'Polymers'], Biology: ['Cell Biology', 'Genetics & Evolution', 'Human Physiology', 'Plant Physiology', 'Reproduction', 'Ecology', 'Biotechnology'] },
  'JEE': { Physics: ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'SHM', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetism', 'EMI', 'Optics', 'Modern Physics', 'Thermodynamics'], Chemistry: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Electrochemistry', 'Kinetics', 'Coordination Compounds', 'Organic Chemistry', 'Hydrocarbons', 'GOC'], Mathematics: ['Algebra', 'Trigonometry', 'Coordinate Geometry', 'Calculus', 'Vectors & 3D', 'Probability', 'Matrices & Determinants', 'Complex Numbers'] },
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [sheets, setSheets] = useState([])
  const [activity, setActivity] = useState([])
  const [histories, setHistories] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [historySearch, setHistorySearch] = useState('')
  const [expandedHistory, setExpandedHistory] = useState(null)
  const [selClass, setSelClass] = useState('Class 11')
  const [selSubject, setSelSubject] = useState('Physics')
  const [selChapter, setSelChapter] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) { navigate('/dashboard'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersSnap, sheetsSnap, activitySnap, historiesSnap, reportsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'sheets')),
        getDocs(collection(db, 'activity')),
        getDocs(collection(db, 'histories')),
        getDocs(collection(db, 'reports')),
      ])
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setSheets(sheetsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      const acts = activitySnap.docs.map(d => ({ id: d.id, ...d.data() }))
      acts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setActivity(acts)
      const hist = historiesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      hist.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setHistories(hist)
      const reps = reportsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      reps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setReports(reps)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleUpload = async () => {
    if (!file || !selChapter) return
    setUploading(true); setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', `formulax/${selClass}/${selSubject}`)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      await addDoc(collection(db, 'sheets'), {
        class: selClass, subject: selSubject, chapter: selChapter,
        fileUrl: data.secure_url, fileType: data.format === 'pdf' ? 'pdf' : 'image',
        uploadedAt: new Date().toISOString(),
      })
      setUploadSuccess(true); setFile(null); fetchData()
    } catch (err) { console.error(err); alert('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this sheet?')) return
    await deleteDoc(doc(db, 'sheets', id)); fetchData()
  }

  const handleDeleteReport = async (id) => {
    await deleteDoc(doc(db, 'reports', id))
    setReports(prev => prev.filter(r => r.id !== id))
  }

  if (user?.email !== ADMIN_EMAIL) return null

  const currentSubjects = Object.keys(syllabus[selClass] || {})
  const currentChapters = syllabus[selClass]?.[selSubject] || []
  const filteredHistories = histories.filter(h =>
    !historySearch || h.userEmail?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.userName?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.question?.toLowerCase().includes(historySearch.toLowerCase())
  )

  const tabs = ['users', 'activity', 'histories', 'reports', 'upload', 'sheets']

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-['Inter']">

      {/* HEADER */}
      <div className="border-b border-black/6 bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <span className="font-black text-black tracking-tight">Formula Labs — Admin</span>
        <div className="flex items-center gap-5 flex-wrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm capitalize transition-colors ${activeTab === tab ? 'text-black font-semibold' : 'text-neutral-400 hover:text-black'}`}>
              {tab}
              {tab === 'reports' && reports.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{reports.length}</span>}
            </button>
          ))}
          <span className="text-xs text-neutral-400">{user?.email}</span>
          <button onClick={() => { logout(); navigate('/') }} className="text-sm text-neutral-400 hover:text-black transition-colors">Sign out</button>
        </div>
      </div>

      <div className="p-8">

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-black text-black">Users</h1>
              <p className="text-sm text-neutral-400">{users.length} total users</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: users.length },
                { label: 'NEET Prep', value: users.filter(u => u.exam === 'NEET').length },
                { label: 'JEE Prep', value: users.filter(u => u.exam?.includes('JEE')).length },
                { label: 'Class 12', value: users.filter(u => u.class === 'Class 12').length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-black/8 rounded-2xl p-6">
                  <p className="text-3xl font-black text-black mb-1">{value}</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/6">
                    {['User', 'Email', 'Class', 'Exam', 'Joined'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-black/4 hover:bg-neutral-50 transition-colors ${i === users.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photo} className="w-8 h-8 rounded-full" onError={e => e.target.style.display = 'none'} />
                          <span className="text-sm font-medium text-black">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{u.email}</td>
                      <td className="px-6 py-4"><span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">{u.class || '—'}</span></td>
                      <td className="px-6 py-4"><span className="text-xs bg-black text-white px-3 py-1 rounded-full">{u.exam || '—'}</span></td>
                      <td className="px-6 py-4 text-xs text-neutral-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="text-center py-16 text-neutral-400 text-sm">No users yet.</div>}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div>
            <h1 className="text-2xl font-black text-black mb-2">Activity</h1>
            <p className="text-sm text-neutral-400 mb-8">{activity.length} sessions logged</p>
            <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/6">
                    {['User', 'Email', 'Action', 'Time'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activity.slice(0, 50).map((a, i) => (
                    <tr key={a.id} className={`border-b border-black/4 hover:bg-neutral-50 ${i === Math.min(activity.length, 50) - 1 ? 'border-0' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-black">{a.userName}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{a.userEmail}</td>
                      <td className="px-6 py-4"><span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">{a.action}</span></td>
                      <td className="px-6 py-4 text-xs text-neutral-400">{a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activity.length === 0 && <div className="text-center py-16 text-neutral-400 text-sm">No activity logged yet.</div>}
            </div>
          </div>
        )}

        {/* HISTORIES TAB */}
        {activeTab === 'histories' && (
          <div>
            <h1 className="text-2xl font-black text-black mb-2">Formula Finder History</h1>
            <p className="text-sm text-neutral-400 mb-6">{histories.length} total queries</p>
            <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)}
              placeholder="Search by user, email or question..."
              className="w-full max-w-md border border-black/10 rounded-xl px-4 py-3 text-sm text-black bg-white focus:outline-none focus:border-black/30 mb-6" />
            <div className="space-y-3 max-w-3xl">
              {filteredHistories.slice(0, 50).map(h => (
                <div key={h.id} className="bg-white border border-black/8 rounded-2xl p-5 cursor-pointer" onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-black">{h.userName}</span>
                        <span className="text-xs text-neutral-400">{h.userEmail}</span>
                      </div>
                      <p className="text-sm text-neutral-600 truncate">{h.question}</p>
                      <p className="text-xs text-neutral-400 mt-1">{h.imageUsed ? '📷 Image · ' : ''}{h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                    </div>
                    <span className="text-neutral-400 text-xs">{expandedHistory === h.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedHistory === h.id && h.result && (
                    <div className="mt-4 space-y-2">
                      {h.result.formulas?.map((f, i) => (
                        <div key={i} className="bg-neutral-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-xs font-semibold text-black">{f.name}</p>
                            <code className="text-xs font-mono px-2 py-0.5 rounded bg-white border border-black/8">{f.formula}</code>
                          </div>
                          <p className="text-xs text-neutral-500">{f.why}</p>
                        </div>
                      ))}
                      {h.result.hint && <p className="text-xs text-neutral-400 italic mt-2">{h.result.hint}</p>}
                    </div>
                  )}
                </div>
              ))}
              {filteredHistories.length === 0 && <div className="text-center py-16 text-neutral-400 text-sm">No results found.</div>}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <h1 className="text-2xl font-black text-black mb-2">Wrong Formula Reports</h1>
            <p className="text-sm text-neutral-400 mb-8">{reports.length} open reports</p>
            {reports.length === 0
              ? <div className="text-center py-20 text-neutral-400 text-sm">No reports yet.</div>
              : (
                <div className="space-y-4 max-w-3xl">
                  {reports.map(r => (
                    <div key={r.id} className="bg-white border border-black/8 rounded-2xl p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">{r.userEmail} · {r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                          <p className="text-sm font-medium text-black">Q: {r.question}</p>
                        </div>
                        <button onClick={() => handleDeleteReport(r.id)} className="text-xs text-red-400 hover:text-red-600 whitespace-nowrap">Dismiss</button>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-red-700 mb-1">Reported formula: {r.formula?.name}</p>
                        <code className="text-xs font-mono text-red-600">{r.formula?.formula}</code>
                        <p className="text-xs text-red-500 mt-1">{r.formula?.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-black text-black mb-2">Upload Formula Sheet</h1>
            <p className="text-sm text-neutral-400 mb-8">Upload a PDF or image for any chapter.</p>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Class</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(syllabus).map(c => (
                  <button key={c} onClick={() => { setSelClass(c); setSelSubject(Object.keys(syllabus[c])[0]); setSelChapter('') }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selClass === c ? 'bg-black text-white border-black' : 'border-black/10 text-neutral-600 hover:border-black/30'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Subject</p>
              <div className="flex flex-wrap gap-2">
                {currentSubjects.map(s => (
                  <button key={s} onClick={() => { setSelSubject(s); setSelChapter('') }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selSubject === s ? 'bg-black text-white border-black' : 'border-black/10 text-neutral-600 hover:border-black/30'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Chapter</p>
              <select value={selChapter} onChange={e => setSelChapter(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-black bg-white focus:outline-none focus:border-black/30">
                <option value="">Select chapter...</option>
                {currentChapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">File</p>
              <label className="block w-full border-2 border-dashed border-black/10 rounded-2xl p-8 text-center cursor-pointer hover:border-black/30 transition-all">
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div><p className="text-2xl mb-2">📄</p><p className="text-sm font-medium text-black">{file.name}</p><p className="text-xs text-neutral-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                ) : (
                  <div><p className="text-2xl mb-2">⬆️</p><p className="text-sm text-neutral-500">Click to upload PDF or image</p><p className="text-xs text-neutral-400 mt-1">PDF, PNG, JPG supported</p></div>
                )}
              </label>
            </div>
            {uploadSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
                ✓ Sheet uploaded successfully!
              </motion.div>
            )}
            <button onClick={handleUpload} disabled={!file || !selChapter || uploading}
              className="w-full bg-black text-white py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</> : 'Upload Sheet →'}
            </button>
          </div>
        )}

        {/* SHEETS TAB */}
        {activeTab === 'sheets' && (
          <div>
            <h1 className="text-2xl font-black text-black mb-8">Uploaded Sheets ({sheets.length})</h1>
            {sheets.length === 0
              ? <div className="text-center py-20 text-neutral-400 text-sm">No sheets uploaded yet.</div>
              : (
                <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/6">
                        {['Chapter', 'Class', 'Subject', 'Uploaded', 'Actions'].map(h => (
                          <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheets.map((s, i) => (
                        <tr key={s.id} className={`border-b border-black/4 hover:bg-neutral-50 ${i === sheets.length - 1 ? 'border-0' : ''}`}>
                          <td className="px-6 py-4 text-sm font-medium text-black">{s.chapter}</td>
                          <td className="px-6 py-4"><span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">{s.class}</span></td>
                          <td className="px-6 py-4 text-sm text-neutral-500">{s.subject}</td>
                          <td className="px-6 py-4 text-xs text-neutral-400">{s.uploadedAt ? new Date(s.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-black underline">View</a>
                            <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

      </div>
    </div>
  )
}
