import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function HistoryPage() {
  const { user, dark, surface, border2, text } = useDashboard()
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState(null)

  useEffect(() => { fetchHistory() }, [user])

  const fetchHistory = async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'histories'), where('userId', '==', user.uid)))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setHistory(items.slice(0, 30))
    } catch (err) { console.error(err) }
    finally { setHistoryLoading(false) }
  }

  return (
    <div className="p-8">
      <h2 className={`text-2xl font-black mb-8 ${text}`}>Formula Finder History</h2>
      {historyLoading && <div className="text-center py-12"><div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`} /></div>}
      {!historyLoading && history.length === 0 && <div className="text-center py-20 text-neutral-400 text-sm">No history yet. Use Formula Finder to see your past searches here.</div>}
      {!historyLoading && history.length > 0 && (
        <div className="space-y-3 max-w-2xl">
          {history.map(h => (
            <div key={h.id} className={`${surface} border ${border2} rounded-2xl p-5 cursor-pointer`} onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${text}`}>{h.question}</p>
                  <p className="text-xs text-neutral-400 mt-1">{h.imageUsed ? '📷 Image question · ' : ''}{new Date(h.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className="text-neutral-400 text-xs">{expandedHistory === h.id ? '▲' : '▼'}</span>
              </div>
              {expandedHistory === h.id && h.result && (
                <div className="mt-4 space-y-2">
                  {h.result.formulas?.map((f, i) => (
                    <div key={i} className={`rounded-xl p-4 ${dark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className={`text-xs font-semibold ${text}`}>{f.name}</p>
                        <code className={`text-xs font-mono px-2 py-0.5 rounded ${dark ? 'bg-neutral-700 text-white' : 'bg-white text-black border border-black/8'}`}>{f.formula}</code>
                      </div>
                      <p className="text-xs text-neutral-500">{f.why}</p>
                    </div>
                  ))}
                  {h.result.hint && <p className="text-xs text-neutral-400 mt-2 italic">{h.result.hint}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
