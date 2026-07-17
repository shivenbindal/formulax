import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, collectionGroup, addDoc, query, where, getDocs, doc, getDoc, setDoc, deleteDoc,
} from 'firebase/firestore'
import {
  School, Plus, LogIn, Copy, Check, FileText, Clock, Trash2, ArrowRight,
  ChevronDown, ChevronUp, Eye, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'
import TestCreator from '../../components/TestCreator'

const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export default function TeacherPage() {
  const { user, dark, text, role } = useDashboard()
  const navigate = useNavigate()
  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'
  const inputC = dark ? 'border-white/[0.08] bg-neutral-900 text-white' : 'border-black/[0.06] bg-white text-black'
  const btnC = dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'

  const [owned, setOwned] = useState([])
  const [joined, setJoined] = useState([])
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [copied, setCopied] = useState(null)

  // Teacher — classroom management
  const [activeClassroom, setActiveClassroom] = useState(null)
  const [tests, setTests] = useState([])
  const [testsLoading, setTestsLoading] = useState(false)
  const [creatingTest, setCreatingTest] = useState(false)
  const [expandedTestId, setExpandedTestId] = useState(null)
  const [submissionsMap, setSubmissionsMap] = useState({})
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // Student — joined classroom tests
  const [expandedJoinedId, setExpandedJoinedId] = useState(null)
  const [joinedTestsMap, setJoinedTestsMap] = useState({})
  const [joinedTestsLoading, setJoinedTestsLoading] = useState(false)

  useEffect(() => { if (user) { fetchOwned(); fetchJoined() } }, [user])

  const fetchOwned = async () => {
    const snap = await getDocs(query(collection(db, 'classrooms'), where('teacherId', '==', user.uid)))
    setOwned(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  const fetchJoined = async () => {
    const snap = await getDocs(query(collectionGroup(db, 'students'), where('uid', '==', user.uid)))
    const classrooms = await Promise.all(snap.docs.map(async d => {
      const classroomId = d.ref.parent.parent.id
      const cSnap = await getDocs(query(collection(db, 'classrooms'), where('__name__', '==', classroomId)))
      return cSnap.docs[0] ? { id: cSnap.docs[0].id, ...cSnap.docs[0].data() } : null
    }))
    setJoined(classrooms.filter(Boolean))
  }

  // ---- TEACHER: tests + results ----
  const fetchTests = async (classroomId) => {
    setTestsLoading(true)
    try {
      const snap = await getDocs(collection(db, 'classrooms', classroomId, 'tests'))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setTests(items)
    } catch (err) { console.error(err) }
    finally { setTestsLoading(false) }
  }

  const openClassroom = (c) => {
    setActiveClassroom(c)
    setCreatingTest(false)
    setExpandedTestId(null)
    fetchTests(c.id)
  }

  const deleteTest = async (testId) => {
    try {
      await deleteDoc(doc(db, 'classrooms', activeClassroom.id, 'tests', testId))
      setTests(prev => prev.filter(t => t.id !== testId))
    } catch (err) { console.error(err) }
  }

  const toggleResults = async (testId) => {
    if (expandedTestId === testId) { setExpandedTestId(null); return }
    setExpandedTestId(testId)
    if (submissionsMap[testId]) return
    setSubmissionsLoading(true)
    try {
      const snap = await getDocs(collection(db, 'classrooms', activeClassroom.id, 'tests', testId, 'submissions'))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      setSubmissionsMap(prev => ({ ...prev, [testId]: items }))
    } catch (err) { console.error(err) }
    finally { setSubmissionsLoading(false) }
  }

  // ---- STUDENT: joined classroom tests ----
  const toggleJoinedClassroom = async (c) => {
    if (expandedJoinedId === c.id) { setExpandedJoinedId(null); return }
    setExpandedJoinedId(c.id)
    if (joinedTestsMap[c.id]) return
    setJoinedTestsLoading(true)
    try {
      const snap = await getDocs(collection(db, 'classrooms', c.id, 'tests'))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const withStatus = await Promise.all(items.map(async (t) => {
        const subSnap = await getDoc(doc(db, 'classrooms', c.id, 'tests', t.id, 'submissions', user.uid))
        return { ...t, submitted: subSnap.exists(), submission: subSnap.exists() ? subSnap.data() : null }
      }))
      setJoinedTestsMap(prev => ({ ...prev, [c.id]: withStatus }))
    } catch (err) { console.error(err) }
    finally { setJoinedTestsLoading(false) }
  }

  const handleCreate = async () => {
    if (!name.trim() || !password.trim()) return
    setCreating(true)
    try {
      await addDoc(collection(db, 'classrooms'), {
        name: name.trim(), password: password.trim(), code: genCode(),
        teacherId: user.uid, teacherName: user.displayName, createdAt: new Date().toISOString(),
      })
      setName(''); setPassword('')
      fetchOwned()
    } catch (err) { console.error(err) }
    finally { setCreating(false) }
  }

  const handleJoin = async () => {
    setJoinError('')
    if (!joinCode.trim() || !joinPassword.trim()) return
    setJoining(true)
    try {
      const snap = await getDocs(query(collection(db, 'classrooms'), where('code', '==', joinCode.trim().toUpperCase())))
      if (snap.empty) { setJoinError('No classroom found with that code.'); return }
      const classroom = snap.docs[0]
      if (classroom.data().password !== joinPassword.trim()) { setJoinError('Wrong password.'); return }
      await setDoc(doc(db, 'classrooms', classroom.id, 'students', user.uid), {
        uid: user.uid, name: user.displayName, photo: user.photoURL, joinedAt: new Date().toISOString(),
      })
      setJoinCode(''); setJoinPassword('')
      fetchJoined()
    } catch (err) { console.error(err) }
    finally { setJoining(false) }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  // ---- TEACHER-ONLY GATE ----
  if (role !== 'teacher') {
    return (
      <div className="p-6 md:p-8 max-w-md mx-auto text-center py-20">
        <School size={32} className="mx-auto mb-4 text-neutral-300" />
        <p className={`text-lg font-semibold mb-2 ${text}`}>Teacher access only</p>
        <p className="text-neutral-400 text-[13px] mb-8">This section is for teacher accounts. You can still join classrooms and take tests your teachers assign.</p>

        {/* Join a classroom */}
        <div className={`border shadow-sm rounded-2xl p-6 text-left ${cardC}`}>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Join a classroom</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Classroom code"
              className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none uppercase ${inputC}`} />
            <input value={joinPassword} onChange={e => setJoinPassword(e.target.value)} placeholder="Password" type="text"
              className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none ${inputC}`} />
            <button onClick={handleJoin} disabled={joining || !joinCode.trim() || !joinPassword.trim()}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 ${btnC}`}>
              <LogIn size={14} /> Join
            </button>
          </div>
          {joinError && <p className="text-[12px] text-red-500 mt-2">{joinError}</p>}

          {joined.length > 0 && (
            <div className="mt-5 space-y-2">
              {joined.map(c => (
                <div key={c.id} className={`rounded-xl ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                  <button onClick={() => toggleJoinedClassroom(c)} className="w-full flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <School size={15} strokeWidth={2} className="text-neutral-400" />
                      <div className="text-left">
                        <p className={`text-[13px] font-medium ${text}`}>{c.name}</p>
                        <p className="text-[11px] text-neutral-400">by {c.teacherName}</p>
                      </div>
                    </div>
                    {expandedJoinedId === c.id ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
                  </button>

                  {expandedJoinedId === c.id && (
                    <div className="px-4 pb-4 space-y-2">
                      {joinedTestsLoading && !joinedTestsMap[c.id] && (
                        <p className="text-[12px] text-neutral-400">Loading tests...</p>
                      )}
                      {joinedTestsMap[c.id]?.length === 0 && (
                        <p className="text-[12px] text-neutral-400">No tests assigned yet.</p>
                      )}
                      {joinedTestsMap[c.id]?.map(t => (
                        <div key={t.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${dark ? 'bg-neutral-950' : 'bg-white'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={13} className="text-neutral-400 shrink-0" />
                            <div className="min-w-0">
                              <p className={`text-[12px] font-medium truncate ${text}`}>{t.title}</p>
                              <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                                <Clock size={10} /> {t.timeLimitMinutes} min · {t.questions?.length || 0} questions
                              </p>
                            </div>
                          </div>
                          {t.submitted ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-500 shrink-0">
                              <CheckCircle2 size={12} /> {t.submission.score}/{t.submission.total}
                            </span>
                          ) : (
                            <button
                              onClick={() => navigate(`/dashboard/test/${c.id}/${t.id}`)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium shrink-0 ${btnC}`}
                            >
                              Start
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- CLASSROOM MANAGEMENT VIEW (teacher) ----
  if (activeClassroom) {
    return (
      <div className="p-6 md:p-8 max-w-3xl space-y-6">
        <button
          onClick={() => setActiveClassroom(null)}
          className="text-[13px] text-neutral-400 hover:text-black transition-colors"
        >
          ← Back to classrooms
        </button>

        <div>
          <h2 className={`text-xl md:text-2xl font-semibold tracking-[-0.3px] mb-1 ${text}`}>{activeClassroom.name}</h2>
          <p className="text-neutral-400 text-[13px]">Code: {activeClassroom.code}</p>
        </div>

        {creatingTest ? (
          <TestCreator
            classroomId={activeClassroom.id}
            user={user}
            dark={dark}
            text={text}
            onClose={() => setCreatingTest(false)}
            onSaved={() => { setCreatingTest(false); fetchTests(activeClassroom.id) }}
          />
        ) : (
          <>
            <button
              onClick={() => setCreatingTest(true)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 ${btnC}`}
            >
              <Plus size={14} /> New Test
            </button>

            <div className={`border shadow-sm rounded-2xl p-6 ${cardC}`}>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Tests</p>
              {testsLoading && <p className="text-[13px] text-neutral-400">Loading...</p>}
              {!testsLoading && tests.length === 0 && (
                <p className="text-[13px] text-neutral-400">No tests yet. Create your first one above.</p>
              )}
              <div className="space-y-2">
                {tests.map(t => (
                  <div key={t.id} className={`rounded-xl ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={15} strokeWidth={2} className="text-neutral-400 shrink-0" />
                        <div className="min-w-0">
                          <p className={`text-[13px] font-medium truncate ${text}`}>{t.title}</p>
                          <p className="text-[11px] text-neutral-400 flex items-center gap-2">
                            <span className="flex items-center gap-1"><Clock size={11} /> {t.timeLimitMinutes} min</span>
                            <span>·</span>
                            <span>{t.questions?.length || 0} questions</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => toggleResults(t.id)} className="flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
                          <Eye size={12} /> Results
                          {expandedTestId === t.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <button onClick={() => deleteTest(t.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {expandedTestId === t.id && (
                      <div className="px-4 pb-4">
                        {submissionsLoading && !submissionsMap[t.id] && (
                          <p className="text-[12px] text-neutral-400">Loading results...</p>
                        )}
                        {submissionsMap[t.id]?.length === 0 && (
                          <p className="text-[12px] text-neutral-400">No submissions yet.</p>
                        )}
                        <div className="space-y-1.5">
                          {submissionsMap[t.id]?.map(s => (
                            <div key={s.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${dark ? 'bg-neutral-950' : 'bg-white'}`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={s.photo} className="w-6 h-6 rounded-full shrink-0" alt={s.name} />
                                <p className={`text-[12px] font-medium truncate ${text}`}>{s.name}</p>
                                {s.reason === 'left_page' && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-500 shrink-0">
                                    <AlertTriangle size={10} /> left page
                                  </span>
                                )}
                                {s.reason === 'time_up' && (
                                  <span className="text-[10px] font-semibold text-amber-500 shrink-0">time up</span>
                                )}
                              </div>
                              <span className={`text-[12px] font-bold shrink-0 ${text}`}>{s.score}/{s.total}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ---- CLASSROOM LIST / CREATE / JOIN VIEW (teacher) ----
  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-8">
      <div>
        <h2 className={`text-xl md:text-2xl font-semibold tracking-[-0.3px] mb-2 ${text}`}>Teacher</h2>
        <p className="text-neutral-400 text-[13px] mb-6">Create a classroom for your students, or join one with a code.</p>
      </div>

      <div className={`border shadow-sm rounded-2xl p-6 ${cardC}`}>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Create a classroom</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Classroom name"
            className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none ${inputC}`} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="text"
            className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none ${inputC}`} />
          <button onClick={handleCreate} disabled={creating || !name.trim() || !password.trim()}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 ${btnC}`}>
            <Plus size={14} /> Create
          </button>
        </div>

        {owned.length > 0 && (
          <div className="mt-5 space-y-2">
            {owned.map(c => (
              <div key={c.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                <div className="flex items-center gap-3">
                  <School size={15} strokeWidth={2} className="text-neutral-400" />
                  <p className={`text-[13px] font-medium ${text}`}>{c.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => copyCode(c.code)}
                    className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-black transition-colors">
                    {copied === c.code ? <Check size={12} /> : <Copy size={12} />}
                    {c.code}
                  </button>
                  <button onClick={() => openClassroom(c)}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
                    Manage <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`border shadow-sm rounded-2xl p-6 ${cardC}`}>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Join a classroom</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Classroom code"
            className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none uppercase ${inputC}`} />
          <input value={joinPassword} onChange={e => setJoinPassword(e.target.value)} placeholder="Password" type="text"
            className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none ${inputC}`} />
          <button onClick={handleJoin} disabled={joining || !joinCode.trim() || !joinPassword.trim()}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 ${btnC}`}>
            <LogIn size={14} /> Join
          </button>
        </div>
        {joinError && <p className="text-[12px] text-red-500 mt-2">{joinError}</p>}

        {joined.length > 0 && (
          <div className="mt-5 space-y-2">
            {joined.map(c => (
              <div key={c.id} className={`rounded-xl ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                <button onClick={() => toggleJoinedClassroom(c)} className="w-full flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <School size={15} strokeWidth={2} className="text-neutral-400" />
                    <div className="text-left">
                      <p className={`text-[13px] font-medium ${text}`}>{c.name}</p>
                      <p className="text-[11px] text-neutral-400">by {c.teacherName}</p>
                    </div>
                  </div>
                  {expandedJoinedId === c.id ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
                </button>

                {expandedJoinedId === c.id && (
                  <div className="px-4 pb-4 space-y-2">
                    {joinedTestsLoading && !joinedTestsMap[c.id] && (
                      <p className="text-[12px] text-neutral-400">Loading tests...</p>
                    )}
                    {joinedTestsMap[c.id]?.length === 0 && (
                      <p className="text-[12px] text-neutral-400">No tests assigned yet.</p>
                    )}
                    {joinedTestsMap[c.id]?.map(t => (
                      <div key={t.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${dark ? 'bg-neutral-950' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={13} className="text-neutral-400 shrink-0" />
                          <div className="min-w-0">
                            <p className={`text-[12px] font-medium truncate ${text}`}>{t.title}</p>
                            <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                              <Clock size={10} /> {t.timeLimitMinutes} min · {t.questions?.length || 0} questions
                            </p>
                          </div>
                        </div>
                        {t.submitted ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-500 shrink-0">
                            <CheckCircle2 size={12} /> {t.submission.score}/{t.submission.total}
                          </span>
                        ) : (
                          <button
                            onClick={() => navigate(`/dashboard/test/${c.id}/${t.id}`)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium shrink-0 ${btnC}`}
                          >
                            Start
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
