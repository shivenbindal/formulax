import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { Clock, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function TakeTestPage() {
  const { classroomId, testId } = useParams()
  const navigate = useNavigate()
  const { user, dark, text } = useDashboard()
  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'
  const btnC = dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [existingSubmission, setExistingSubmission] = useState(null)
  const [phase, setPhase] = useState('loading') // loading | intro | active | result | notfound
  const [answers, setAnswers] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(0)

  const startedRef = useRef(false)
  const submittedRef = useRef(false)
  const answersRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => { answersRef.current = answers }, [answers])

  useEffect(() => {
    const load = async () => {
      try {
        const testSnap = await getDoc(doc(db, 'classrooms', classroomId, 'tests', testId))
        if (!testSnap.exists()) { setPhase('notfound'); setLoading(false); return }
        const testData = { id: testSnap.id, ...testSnap.data() }
        setTest(testData)

        const subSnap = await getDoc(doc(db, 'classrooms', classroomId, 'tests', testId, 'submissions', user.uid))
        if (subSnap.exists()) {
          setExistingSubmission(subSnap.data())
          setPhase('result')
        } else {
          setAnswers(new Array(testData.questions.length).fill(-1))
          setPhase('intro')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [classroomId, testId, user])

  const submitTest = async (reason) => {
    if (submittedRef.current || !test) return
    submittedRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)

    const finalAnswers = answersRef.current
    let score = 0
    test.questions.forEach((q, i) => { if (finalAnswers[i] === q.correct) score++ })

    const submission = {
      uid: user.uid,
      name: user.displayName,
      photo: user.photoURL,
      answers: finalAnswers,
      score,
      total: test.questions.length,
      reason,
      submittedAt: new Date().toISOString(),
    }

    try {
      await setDoc(doc(db, 'classrooms', classroomId, 'tests', testId, 'submissions', user.uid), submission)
    } catch (err) { console.error(err) }

    setExistingSubmission(submission)
    setPhase('result')
  }

  // Leave detection — only active while the test is in progress
  useEffect(() => {
    if (phase !== 'active') return

    const handleLeave = () => { if (!submittedRef.current) submitTest('left_page') }
    const handleVisibility = () => { if (document.hidden) handleLeave() }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleLeave)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleLeave)
      // In-app navigation away also counts as leaving
      if (startedRef.current && !submittedRef.current) submitTest('left_page')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Timer
  useEffect(() => {
    if (phase !== 'active') return
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          submitTest('time_up')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const beginTest = () => {
    startedRef.current = true
    setSecondsLeft(test.timeLimitMinutes * 60)
    setPhase('active')
  }

  const setAnswer = (qIdx, optIdx) => {
    setAnswers((prev) => prev.map((a, i) => (i === qIdx ? optIdx : a)))
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (loading) return <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
  if (phase === 'notfound') return <div className="p-8 text-center text-neutral-400 text-sm">Test not found.</div>

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {phase !== 'active' && (
        <button onClick={() => navigate('/dashboard/teacher')} className="flex items-center gap-1.5 text-[13px] text-neutral-400 hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
      )}

      {phase === 'intro' && (
        <div className={`border shadow-sm rounded-2xl p-8 text-center ${cardC}`}>
          <Clock size={28} className="mx-auto mb-4 text-blue-500" />
          <h2 className={`text-xl font-bold mb-2 ${text}`}>{test.title}</h2>
          <p className="text-neutral-400 text-[13px] mb-1">{test.questions.length} questions · {test.timeLimitMinutes} minutes</p>
          <div className={`mt-6 mb-6 rounded-xl p-4 text-left text-[12px] flex items-start gap-2 ${dark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>Once you begin, leaving this page or switching tabs will auto-submit your test immediately. Stay on this page until you're done.</span>
          </div>
          <button onClick={beginTest} className={`px-6 py-3 rounded-xl text-[13px] font-medium ${btnC}`}>
            Begin Test
          </button>
        </div>
      )}

      {phase === 'active' && (
        <div className="space-y-4">
          <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3 rounded-xl border ${cardC}`}>
            <p className={`text-sm font-semibold ${text}`}>{test.title}</p>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${secondsLeft < 60 ? 'text-red-500' : text}`}>
              <Clock size={14} /> {formatTime(secondsLeft)}
            </div>
          </div>

          {test.questions.map((q, qi) => (
            <div key={qi} className={`border rounded-2xl p-5 ${cardC}`}>
              <p className={`text-[13px] font-semibold mb-3 ${text}`}>Q{qi + 1}. {q.text}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    answers[qi] === oi
                      ? dark ? 'bg-blue-500/20' : 'bg-blue-50'
                      : dark ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
                  }`}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => setAnswer(qi, oi)}
                      className="accent-black"
                    />
                    <span className={`text-[13px] ${text}`}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => submitTest('normal')}
            className={`w-full px-5 py-3 rounded-xl text-[13px] font-medium ${btnC}`}
          >
            Submit Test
          </button>
        </div>
      )}

      {phase === 'result' && existingSubmission && (
        <div className={`border shadow-sm rounded-2xl p-8 text-center ${cardC}`}>
          {existingSubmission.reason === 'left_page' && (
            <div className={`mb-4 rounded-xl p-3 text-[12px] flex items-center justify-center gap-2 ${dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
              <AlertTriangle size={14} /> Auto-submitted because you left the test page
            </div>
          )}
          {existingSubmission.reason === 'time_up' && (
            <div className={`mb-4 rounded-xl p-3 text-[12px] flex items-center justify-center gap-2 ${dark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <Clock size={14} /> Auto-submitted — time ran out
            </div>
          )}
          <CheckCircle2 size={28} className="mx-auto mb-4 text-green-500" />
          <h2 className={`text-xl font-bold mb-1 ${text}`}>{existingSubmission.score} / {existingSubmission.total}</h2>
          <p className="text-neutral-400 text-[13px]">Test submitted</p>
        </div>
      )}
    </div>
  )
}
