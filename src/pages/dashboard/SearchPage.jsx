import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, LayoutGrid } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { syllabus } from '../../data/syllabus'

export default function SearchPage() {
  const { dark, text, setSelectedClass, setSelectedSubject } = useDashboard()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [term, setTerm] = useState(params.get('q') || '')

  useEffect(() => { setTerm(params.get('q') || '') }, [params])

  const results = useMemo(() => {
    if (!term.trim()) return []
    const q = term.trim().toLowerCase()
    const out = []
    Object.entries(syllabus).forEach(([cls, subjects]) => {
      Object.entries(subjects).forEach(([subject, chapters]) => {
        chapters.forEach(chapter => {
          if (chapter.toLowerCase().includes(q)) out.push({ cls, subject, chapter })
        })
      })
    })
    return out.slice(0, 40)
  }, [term])

  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'

  const openChapter = (r) => {
    setSelectedClass(r.cls)
    setSelectedSubject(r.subject)
    navigate('/dashboard/explorer')
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-8 ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
        <SearchIcon size={15} strokeWidth={2} className="text-neutral-400" />
        <input
          value={term}
          onChange={e => { setTerm(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}) }}
          placeholder="Search chapters across all classes..."
          className={`bg-transparent border-0 outline-none text-[14px] w-full placeholder-neutral-400 ${text}`}
          autoFocus
        />
      </div>

      {!term.trim() && (
        <p className="text-[13px] text-neutral-400">Start typing to search chapters. People and doubt search from Community are coming next.</p>
      )}

      {term.trim() && results.length === 0 && (
        <p className="text-[13px] text-neutral-400">No chapters matched "{term}".</p>
      )}

      <div className="space-y-2.5">
        {results.map((r, i) => (
          <button key={i} onClick={() => openChapter(r)}
            className={`w-full text-left border shadow-sm rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md ${cardC}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
              <LayoutGrid size={15} strokeWidth={2} className="text-neutral-400" />
            </div>
            <div className="min-w-0">
              <p className={`text-[13px] font-semibold truncate ${text}`}>{r.chapter}</p>
              <p className="text-[11px] text-neutral-400">{r.cls} · {r.subject}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
