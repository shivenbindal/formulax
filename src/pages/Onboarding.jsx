import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12']
const exams = ['CBSE Boards', 'NEET', 'JEE Mains', 'JEE Advanced', 'Just studying']

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFinish = async () => {
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        class: selectedClass,
        exam: selectedExam,
        createdAt: new Date().toISOString(),
      })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6 font-['Inter']">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <p className="text-center text-sm font-black text-black mb-10 tracking-tight">Formula X</p>

        <AnimatePresence mode="wait">

          {/* STEP 1 — WELCOME */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-black/8 rounded-3xl p-10 text-center shadow-sm"
            >
              <img src={user?.photoURL} className="w-16 h-16 rounded-full mx-auto mb-4" />
              <h1 className="text-2xl font-black text-black mb-2">
                Welcome, {user?.displayName?.split(' ')[0]}!
              </h1>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                Let's set up your profile so we can show you the right formula sheets.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-black text-white py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all"
              >
                Let's go →
              </button>
            </motion.div>
          )}

          {/* STEP 2 — CLASS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-black/8 rounded-3xl p-10 shadow-sm"
            >
              <p className="text-xs text-neutral-400 mb-2">Step 1 of 2</p>
              <h2 className="text-2xl font-black text-black mb-2">Which class are you in?</h2>
              <p className="text-sm text-neutral-500 mb-8">We'll filter formula sheets to match your syllabus.</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {classes.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`py-4 rounded-2xl text-sm font-semibold border transition-all ${
                      selectedClass === c
                        ? 'bg-black text-white border-black'
                        : 'border-black/10 text-black hover:border-black/30'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!selectedClass}
                className="w-full bg-black text-white py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* STEP 3 — EXAM */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-black/8 rounded-3xl p-10 shadow-sm"
            >
              <p className="text-xs text-neutral-400 mb-2">Step 2 of 2</p>
              <h2 className="text-2xl font-black text-black mb-2">What are you preparing for?</h2>
              <p className="text-sm text-neutral-500 mb-8">We'll highlight the most relevant chapters.</p>

              <div className="space-y-3 mb-8">
                {exams.map(e => (
                  <button
                    key={e}
                    onClick={() => setSelectedExam(e)}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold border transition-all ${
                      selectedExam === e
                        ? 'bg-black text-white border-black'
                        : 'border-black/10 text-black hover:border-black/30'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <button
                onClick={handleFinish}
                disabled={!selectedExam || loading}
                className="w-full bg-black text-white py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up...
                  </>
                ) : 'Go to Dashboard →'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}