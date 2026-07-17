import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { ChevronDown, ChevronUp, Camera } from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function HistoryPage() {
  const { user, dark, surface, text } = useDashboard()
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

  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'

  return (
    <div className="p-6 md:p-8">
      <h2 className={`text-xl md:text-2xl font-semibold tracking-[-0.3px] mb-8 ${text}`}>Formula Finder history</h2>
      {historyLoading && <div className="text-center py-12"><div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`} /></div>}
      {!historyLoading && history.length === 0 && <div className="text-center py-20 text-neutral-400 text-[13px]">No history yet. Use Formula Finder to see your past searches here.</div>}
      {!historyLoading && history.length > 0 && (
        <div className="space-y-2.5 max-w-2xl">
          {history.map(h => (
            <div key={h.id} className={`border shadow-sm rounded-2xl p-5 cursor-pointer ${cardC}`} onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${text}`}>{h.question}</p>
                  <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                    {h.imageUsed && <><Camera size={11} strokeWidth={2} /> Image question ·</>}
                    {new Date(h.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {expandedHistory === h.id ? <ChevronUp size={14} className="text-neutral-400 shrink-0" /> : <ChevronDown size={14} className="text-neutral-400 shrink-0" />}
              </div>
              {expandedHistory === h.id && h.result && (
                <div className="mt-4 space-y-4">
                  {h.result.approach?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">The approach</p>
                      <div className="space-y-2">
                        {h.result.approach.map((step, i) => (
                          <div key={i} className={`rounded-xl p-3 flex gap-2 items-start ${dark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
                            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>{i + 1}</span>
                            <p className={`text-[12px] pt-0.5 ${text}`}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.result.formulas?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">Formula(s)</p>
                      <div className="space-y-2">
                        {h.result.formulas.map((f, i) => (
                          <div key={i} className={`rounded-xl p-4 ${dark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
                            <p className={`text-[12px] font-semibold mb-1 ${text}`}>{f.name}</p>
                            <code className={`block text-[12px] font-mono px-2 py-1.5 rounded whitespace-normal break-words ${dark ? 'bg-neutral-800 text-white' : 'bg-white text-black border border-black/[0.04]'}`}>{f.formula}</code>
                            <p className="text-[11px] text-neutral-500 mt-2">{f.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!h.result.approach && h.result.hint && <p className="text-[12px] text-neutral-400 mt-2 italic">{h.result.hint}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
