import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Activity as ActivityIcon, History, Flag, Upload as UploadIcon,
  FileText, ChevronDown, ChevronUp, Search, Trash2, ExternalLink,
  Loader2, CheckCircle2, Shield,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { syllabus } from '../../data/syllabus'

const ADMIN_EMAIL = 'shivenbindal@gmail.com'
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const TABS = [
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'activity', label: 'Activity', Icon: ActivityIcon },
  { id: 'histories', label: 'History', Icon: History },
  { id: 'reports', label: 'Reports', Icon: Flag },
  { id: 'upload', label: 'Upload', Icon: UploadIcon },
  { id: 'sheets', label: 'Sheets', Icon: FileText },
]

export default function AdminPage() {
  const { user, dark, text, surface } = useDashboard()
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
    if (user?.email !== ADMIN_EMAIL) { navigate('/dashboard/explorer', { replace: true }); return }
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

  // Theming helpers
  const card = `${dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/8'} border rounded-3xl`
  const cardHover = `${dark ? 'hover:bg-white/10' : 'hover:bg-black/[0.02]'} transition-colors`
  const muted = dark ? 'text-neutral-400' : 'text-neutral-500'
  const mutedFaint = dark ? 'text-neutral-500' : 'text-neutral-400'
  const divider = dark ? 'border-white/6' : 'border-black/6'
  const pill = (active) => `flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
    active
      ? dark ? 'bg-white text-black' : 'bg-black text-white'
      : dark ? 'text-neutral-400 hover:bg-white/10' : 'text-neutral-600 hover:bg-black/[0.04]'
  }`

  return (
    <div className="p-5 md:p-8">

      {/* Floating pill tab cluster */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={pill(activeTab === id)}>
            <Icon size={14} strokeWidth={2.25} />
            {label}
            {id === 'reports' && reports.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{reports.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={24} className={dark ? 'text-neutral-500' : 'text-neutral-400'} />
          </motion.div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* USERS */}
            {activeTab === 'users' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Users', value: users.length },
                    { label: 'NEET Prep', value: users.filter(u => u.exam === 'NEET').length },
                    { label: 'JEE Prep', value: users.filter(u => u.exam?.includes('JEE')).length },
                    { label: 'Class 12', value: users.filter(u => u.class === 'Class 12').length },
                  ].map(({ label, value }) => (
                    <div key={label} className={`${card} p-6`}>
                      <p className={`text-3xl font-black mb-1 ${text}`}>{value}</p>
                      <p className={`text-[11px] uppercase tracking-widest ${mutedFaint}`}>{label}</p>
                    </div>
                  ))}
                </div>
                <div className={`${card} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${divider}`}>
                          {['User', 'Email', 'Class', 'Exam', 'Joined'].map(h => (
                            <th key={h} className={`text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-widest ${mutedFaint}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={u.id} className={`border-b ${divider} ${cardHover} ${i === users.length - 1 ? 'border-0' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={u.photo} className="w-8 h-8 rounded-full" onError={e => e.target.style.display = 'none'} />
                                <span className={`text-sm font-medium ${text}`}>{u.name}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 text-sm ${muted}`}>{u.email}</td>
                            <td className="px-6 py-4"><span className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-white/10 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>{u.class || '—'}</span></td>
                            <td className="px-6 py-4"><span className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>{u.exam || '—'}</span></td>
                            <td className={`px-6 py-4 text-xs ${mutedFaint}`}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {users.length === 0 && <div className={`text-center py-16 text-sm ${mutedFaint}`}>No users yet.</div>}
                </div>
              </div>
            )}

            {/* ACTIVITY */}
            {activeTab === 'activity' && (
              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${divider}`}>
                        {['User', 'Email', 'Action', 'Time'].map(h => (
                          <th key={h} className={`text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-widest ${mutedFaint}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activity.slice(0, 50).map((a, i) => (
                        <tr key={a.id} className={`border-b ${divider} ${cardHover} ${i === Math.min(activity.length, 50) - 1 ? 'border-0' : ''}`}>
                          <td className={`px-6 py-4 text-sm font-medium ${text}`}>{a.userName}</td>
                          <td className={`px-6 py-4 text-sm ${muted}`}>{a.userEmail}</td>
                          <td className="px-6 py-4"><span className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-700'}`}>{a.action}</span></td>
                          <td className={`px-6 py-4 text-xs ${mutedFaint}`}>{a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {activity.length === 0 && <div className={`text-center py-16 text-sm ${mutedFaint}`}>No activity logged yet.</div>}
              </div>
            )}

            {/* HISTORIES */}
            {activeTab === 'histories' && (
              <div>
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full mb-6 max-w-md ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                  <Search size={14} className={mutedFaint} />
                  <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Search by user, email or question..."
                    className={`bg-transparent border-0 outline-none text-[13px] w-full placeholder-neutral-400 ${text}`} />
                </div>
                <div className="space-y-3">
                  {filteredHistories.slice(0, 50).map(h => (
                    <div key={h.id} className={`${card} p-5 cursor-pointer ${cardHover}`} onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${text}`}>{h.userName}</span>
                            <span className={`text-xs ${mutedFaint}`}>{h.userEmail}</span>
                          </div>
                          <p className={`text-sm truncate ${muted}`}>{h.question}</p>
                          <p className={`text-xs mt-1 ${mutedFaint}`}>{h.imageUsed ? '📷 Image · ' : ''}{h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                        </div>
                        {expandedHistory === h.id ? <ChevronUp size={14} className={mutedFaint} /> : <ChevronDown size={14} className={mutedFaint} />}
                      </div>
                      {expandedHistory === h.id && h.result && (
                        <div className="mt-4 space-y-2">
                          {h.result.formulas?.map((f, i) => (
                            <div key={i} className={`rounded-xl p-4 ${dark ? 'bg-black/20' : 'bg-neutral-50'}`}>
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <p className={`text-xs font-semibold ${text}`}>{f.name}</p>
                                <code className={`text-xs font-mono px-2 py-0.5 rounded border ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/8'}`}>{f.formula}</code>
                              </div>
                              <p className={`text-xs ${mutedFaint}`}>{f.why}</p>
                            </div>
                          ))}
                          {h.result.approach && (
                            <ol className={`text-xs space-y-1 list-decimal pl-4 ${muted}`}>
                              {h.result.approach.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                          )}
                          {h.result.hint && <p className={`text-xs italic mt-2 ${mutedFaint}`}>{h.result.hint}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredHistories.length === 0 && <div className={`text-center py-16 text-sm ${mutedFaint}`}>No results found.</div>}
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0
                  ? <div className={`text-center py-20 text-sm ${mutedFaint}`}>No reports yet.</div>
                  : reports.map(r => (
                    <div key={r.id} className={`${card} p-6`}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className={`text-xs mb-1 ${mutedFaint}`}>{r.userEmail} · {r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                          <p className={`text-sm font-medium ${text}`}>Q: {r.question}</p>
                        </div>
                        <button onClick={() => handleDeleteReport(r.id)} className="text-xs text-red-400 hover:text-red-500 whitespace-nowrap flex items-center gap-1">
                          <Trash2 size={12} /> Dismiss
                        </button>
                      </div>
                      <div className={`rounded-xl p-4 border ${dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                        <p className="text-xs font-semibold text-red-500 mb-1">Reported formula: {r.formula?.name}</p>
                        <code className="text-xs font-mono text-red-500">{r.formula?.formula}</code>
                        <p className="text-xs text-red-400 mt-1">{r.formula?.why}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* UPLOAD */}
            {activeTab === 'upload' && (
              <div className={`${card} p-6 md:p-8 max-w-xl`}>
                <div className="mb-6">
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${mutedFaint}`}>Class</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(syllabus).map(c => (
                      <button key={c} onClick={() => { setSelClass(c); setSelSubject(Object.keys(syllabus[c])[0]); setSelChapter('') }}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                          selClass === c
                            ? dark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                            : dark ? 'border-white/10 text-neutral-400 hover:border-white/30' : 'border-black/10 text-neutral-600 hover:border-black/30'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${mutedFaint}`}>Subject</p>
                  <div className="flex flex-wrap gap-2">
                    {currentSubjects.map(s => (
                      <button key={s} onClick={() => { setSelSubject(s); setSelChapter('') }}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                          selSubject === s
                            ? dark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                            : dark ? 'border-white/10 text-neutral-400 hover:border-white/30' : 'border-black/10 text-neutral-600 hover:border-black/30'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${mutedFaint}`}>Chapter</p>
                  <select value={selChapter} onChange={e => setSelChapter(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${
                      dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-black focus:border-black/30'
                    }`}>
                    <option value="">Select chapter...</option>
                    {currentChapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mb-6">
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${mutedFaint}`}>File</p>
                  <label className={`block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dark ? 'border-white/15 hover:border-white/30' : 'border-black/10 hover:border-black/30'
                  }`}>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
                    {file ? (
                      <div>
                        <FileText size={22} className={`mx-auto mb-2 ${muted}`} />
                        <p className={`text-sm font-medium ${text}`}>{file.name}</p>
                        <p className={`text-xs mt-1 ${mutedFaint}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <UploadIcon size={22} className={`mx-auto mb-2 ${mutedFaint}`} />
                        <p className={`text-sm ${muted}`}>Click to upload PDF or image</p>
                        <p className={`text-xs mt-1 ${mutedFaint}`}>PDF, PNG, JPG supported</p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mb-4 rounded-xl p-4 text-sm flex items-center gap-2 ${
                    dark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
                  }`}>
                    <CheckCircle2 size={14} /> Sheet uploaded successfully!
                  </motion.div>
                )}
                <button onClick={handleUpload} disabled={!file || !selChapter || uploading}
                  className={`w-full py-3.5 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                  }`}>
                  {uploading ? <><Loader2 size={14} className="animate-spin" />Uploading...</> : 'Upload Sheet →'}
                </button>
              </div>
            )}

            {/* SHEETS */}
            {activeTab === 'sheets' && (
              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${divider}`}>
                        {['Chapter', 'Class', 'Subject', 'Uploaded', 'Actions'].map(h => (
                          <th key={h} className={`text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-widest ${mutedFaint}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheets.map((s, i) => (
                        <tr key={s.id} className={`border-b ${divider} ${cardHover} ${i === sheets.length - 1 ? 'border-0' : ''}`}>
                          <td className={`px-6 py-4 text-sm font-medium ${text}`}>{s.chapter}</td>
                          <td className="px-6 py-4"><span className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-white/10 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>{s.class}</span></td>
                          <td className={`px-6 py-4 text-sm ${muted}`}>{s.subject}</td>
                          <td className={`px-6 py-4 text-xs ${mutedFaint}`}>{s.uploadedAt ? new Date(s.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <a href={s.fileUrl} target="_blank" rel="noreferrer" className={`text-xs flex items-center gap-1 ${text} underline`}>
                                <ExternalLink size={11} /> View
                              </a>
                              <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1">
                                <Trash2 size={11} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sheets.length === 0 && <div className={`text-center py-16 text-sm ${mutedFaint}`}>No sheets uploaded yet.</div>}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
