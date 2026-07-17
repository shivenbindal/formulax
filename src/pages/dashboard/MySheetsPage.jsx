import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function MySheetsPage() {
  const { user, dark, surface, border2, text } = useDashboard()
  const navigate = useNavigate()
  const [savedSheets, setSavedSheets] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)

  useEffect(() => { fetchSavedSheets() }, [user])

  const fetchSavedSheets = async () => {
    if (!user) return
    setSavedLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'saved'))
      setSavedSheets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    finally { setSavedLoading(false) }
  }

  const openSavedSheet = (s) => {
    navigate('/dashboard/explorer', { state: { openSheet: s } })
  }

  return (
    <div className="p-8">
      <h2 className={`text-2xl font-black mb-8 ${text}`}>My Sheets</h2>
      {savedLoading && <div className="text-center py-12"><div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`} /></div>}
      {!savedLoading && savedSheets.length === 0 && <div className="text-center py-20 text-neutral-400 text-sm">No saved sheets yet. Open any chapter sheet and tap ♡ to save.</div>}
      {!savedLoading && savedSheets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedSheets.map(s => (
            <div key={s.id} className={`${surface} border ${border2} rounded-2xl p-5`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-neutral-400">{s.class} · {s.subject}</p>
                <button onClick={async () => { await deleteDoc(doc(db, 'users', user.uid, 'saved', s.id)); setSavedSheets(prev => prev.filter(x => x.id !== s.id)) }} className="text-red-500 text-lg leading-none">♥</button>
              </div>
              <p className={`text-sm font-semibold mb-4 ${text}`}>{s.chapter}</p>
              <button onClick={() => openSavedSheet(s)}
                className={`w-full text-xs py-2 rounded-full transition-colors ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>
                Open →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
