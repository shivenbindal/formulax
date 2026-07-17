import { useState, useEffect } from 'react'
import {
  collection, collectionGroup, addDoc, query, where, getDocs, doc, setDoc,
} from 'firebase/firestore'
import { School, Plus, LogIn, Copy, Check } from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export default function TeacherPage() {
  const { user, dark, text } = useDashboard()
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
                <button onClick={() => copyCode(c.code)}
                  className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-black transition-colors">
                  {copied === c.code ? <Check size={12} /> : <Copy size={12} />}
                  {c.code}
                </button>
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
              <div key={c.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                <School size={15} strokeWidth={2} className="text-neutral-400" />
                <div>
                  <p className={`text-[13px] font-medium ${text}`}>{c.name}</p>
                  <p className="text-[11px] text-neutral-400">by {c.teacherName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
