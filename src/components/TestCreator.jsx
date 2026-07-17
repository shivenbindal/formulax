import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { Plus, Trash2, Sparkles, Upload, ChevronLeft, Loader2, Check } from 'lucide-react'
import { db } from '../firebase/config'
import { parseTestQuestions } from '../services/groq'

const emptyQuestion = () => ({
  id: crypto.randomUUID(),
  text: '',
  options: ['', '', '', ''],
  correct: 0,
})

export default function TestCreator({ classroomId, user, dark, text, onClose, onSaved }) {
  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'
  const inputC = dark ? 'border-white/[0.08] bg-neutral-950 text-white' : 'border-black/[0.06] bg-white text-black'
  const btnC = dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'

  const [mode, setMode] = useState('choose') // choose | manual | auto
  const [title, setTitle] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [pasteText, setPasteText] = useState('')
  const [imageBase64, setImageBase64] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => setImageBase64(reader.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const handleParse = async () => {
    if (!pasteText.trim() && !imageBase64) return
    setParsing(true)
    setParseError('')
    try {
      const result = await parseTestQuestions(pasteText, imageBase64)
      const parsedQuestions = (result.questions || []).map((q) => ({
        id: crypto.randomUUID(),
        text: q.text || '',
        options: q.options?.length === 4 ? q.options : [...(q.options || []), '', '', '', ''].slice(0, 4),
        correct: typeof q.correct === 'number' ? q.correct : 0,
      }))
      if (parsedQuestions.length === 0) {
        setParseError('No questions found. Try pasting clearer text or a clearer image.')
        return
      }
      setTitle(result.title || title)
      setQuestions(parsedQuestions)
      setMode('manual')
    } catch (err) {
      setParseError(err.message)
    } finally {
      setParsing(false)
    }
  }

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (id, idx, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) } : q))
    )
  }

  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id))
  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()])

  const validate = () => {
    if (!title.trim()) return 'Give the test a title.'
    if (!timeLimit || timeLimit <= 0) return 'Set a valid time limit.'
    if (questions.length === 0) return 'Add at least one question.'
    for (const q of questions) {
      if (!q.text.trim()) return 'Every question needs question text.'
      if (q.options.some((o) => !o.trim())) return 'Every question needs 4 filled options.'
    }
    return ''
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setSaving(true)
    try {
      await addDoc(collection(db, 'classrooms', classroomId, 'tests'), {
        title: title.trim(),
        timeLimitMinutes: Number(timeLimit),
        questions: questions.map(({ text, options, correct }) => ({
          text: text.trim(), options: options.map((o) => o.trim()), correct,
        })),
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        published: true,
      })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`border shadow-sm rounded-2xl p-6 ${cardC}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] text-neutral-400 hover:text-black transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400">New Test</p>
      </div>

      {mode === 'choose' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('manual')}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dark ? 'border-white/10 hover:border-blue-400' : 'border-blue-200 hover:border-blue-400'}`}
          >
            <Plus size={22} className={`mx-auto mb-2 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-sm font-semibold ${text}`}>Build manually</p>
            <p className="text-xs text-neutral-500 mt-1">Write questions yourself</p>
          </button>
          <button
            onClick={() => setMode('auto')}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dark ? 'border-white/10 hover:border-purple-400' : 'border-purple-200 hover:border-purple-400'}`}
          >
            <Sparkles size={22} className={`mx-auto mb-2 ${dark ? 'text-purple-400' : 'text-purple-600'}`} />
            <p className={`text-sm font-semibold ${text}`}>Upload & auto-generate</p>
            <p className="text-xs text-neutral-500 mt-1">Paste text or upload an image</p>
          </button>
        </div>
      )}

      {mode === 'auto' && (
        <div className="space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your question paper text here..."
            rows={6}
            className={`w-full border rounded-xl px-4 py-3 text-[13px] outline-none resize-none ${inputC}`}
          />
          <div className="flex items-center gap-3">
            <label className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dark ? 'border-white/10 hover:border-purple-400' : 'border-neutral-200 hover:border-purple-400'}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Upload size={16} className="mx-auto mb-1 text-neutral-400" />
              <p className="text-xs text-neutral-400">{imagePreview ? 'Change image' : 'Or upload an image'}</p>
            </label>
            {imagePreview && <img src={imagePreview} className="w-14 h-14 rounded-lg object-cover" alt="Preview" />}
          </div>
          {parseError && <p className="text-[12px] text-red-500">{parseError}</p>}
          <button
            onClick={handleParse}
            disabled={parsing || (!pasteText.trim() && !imageBase64)}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 ${btnC}`}
          >
            {parsing ? <><Loader2 size={14} className="animate-spin" /> Parsing...</> : <><Sparkles size={14} /> Parse Questions</>}
          </button>
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Test title"
              className={`flex-1 border rounded-xl px-4 py-2.5 text-[13px] outline-none ${inputC}`}
            />
            <input
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              type="number"
              min="1"
              placeholder="Time limit (min)"
              className={`w-full sm:w-44 border rounded-xl px-4 py-2.5 text-[13px] outline-none ${inputC}`}
            />
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className={`rounded-xl p-4 ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-[11px] font-bold text-neutral-400 pt-2.5">Q{qi + 1}</span>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder="Question text"
                    rows={2}
                    className={`flex-1 border rounded-lg px-3 py-2 text-[13px] outline-none resize-none ${inputC}`}
                  />
                  <button onClick={() => removeQuestion(q.id)} className="text-neutral-400 hover:text-red-500 transition-colors pt-2">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correct === oi}
                        onChange={() => updateQuestion(q.id, 'correct', oi)}
                        className="accent-black"
                      />
                      <input
                        value={opt}
                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className={`flex-1 border rounded-lg px-3 py-1.5 text-[12px] outline-none ${inputC}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={addQuestion} className={`flex items-center gap-1.5 text-[13px] font-medium ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
            <Plus size={14} /> Add question
          </button>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 ${btnC}`}
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Test</>}
          </button>
        </div>
      )}
    </div>
  )
}
