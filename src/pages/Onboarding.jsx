import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Check, AlertCircle, BookOpen, Target, Zap } from 'lucide-react'

const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12']
const exams = ['CBSE Boards', 'NEET', 'JEE Mains', 'JEE Advanced', 'Just studying']

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkUsernameAvailability = async (name) => {
    if (!name.trim()) {
      setUsernameAvailable(null)
      setUsernameError('')
      return
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
      setUsernameError('3-20 chars (letters, numbers, underscore)')
      setUsernameAvailable(false)
      return
    }

    setUsernameChecking(true)
    try {
      const q = query(collection(db, 'users'), where('username', '==', name.toLowerCase()))
      const snap = await getDocs(q)
      if (snap.empty) {
        setUsernameAvailable(true)
        setUsernameError('')
      } else {
        setUsernameAvailable(false)
        setUsernameError('Already taken')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value
    setUsername(value)
    if (value) checkUsernameAvailability(value)
  }

  const handleFinish = async () => {
    if (!usernameAvailable) return
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        username: username.toLowerCase(),
        class: selectedClass,
        exam: selectedExam,
        createdAt: new Date().toISOString(),
        followers: [],
        following: [],
        bio: '',
      })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* STEP 1 — WELCOME */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6 flex justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Zap size={28} className="text-white" strokeWidth={2.5} />
                </div>
              </motion.div>

              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Welcome!
              </h1>
              <p className="text-neutral-700 text-base mb-2 leading-relaxed">
                Hi {user?.displayName?.split(' ')[0]}, let's set up your Formula Labs profile
              </p>
              <p className="text-neutral-500 text-sm mb-8">
                Your personal study companion awaits
              </p>

              <motion.img
                src={user?.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-10 ring-4 ring-blue-100 shadow-lg"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-full font-semibold hover:shadow-xl transition-all text-lg"
              >
                Let's Go →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2 — USERNAME */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">
                Step 1 of 3
              </div>

              <h2 className="text-3xl font-black text-black mb-3">Choose your username</h2>
              <p className="text-neutral-600 text-sm mb-8">
                This is how others find and follow you on Formula Labs
              </p>

              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="e.g., physics_ninja"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all text-sm font-medium bg-gray-50
                      ${
                        usernameAvailable === true
                          ? 'border-green-400 bg-green-50'
                          : usernameAvailable === false
                            ? 'border-red-400 bg-red-50'
                            : 'border-blue-200 focus:border-blue-500'
                      }
                      focus:outline-none`}
                  />
                  {usernameChecking && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {usernameAvailable === true && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
                {usernameError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={13} /> {usernameError}
                  </p>
                )}
                {usernameAvailable === true && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Check size={13} /> Available!
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-neutral-300 text-black py-3 rounded-full font-semibold hover:bg-neutral-50 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(3)}
                  disabled={usernameAvailable !== true}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-40"
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — CLASS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">
                Step 2 of 3
              </div>

              <h2 className="text-3xl font-black text-black mb-2 flex items-center gap-2">
                <BookOpen size={28} className="text-blue-600" />
                Which class?
              </h2>
              <p className="text-neutral-600 text-sm mb-8">We'll customize content just for you</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {classes.map((c) => (
                  <motion.button
                    key={c}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedClass(c)}
                    className={`py-4 rounded-xl font-bold transition-all border-2 ${
                      selectedClass === c
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent'
                        : 'border-neutral-300 text-neutral-700 hover:border-blue-300'
                    }`}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-neutral-300 text-black py-3 rounded-full font-semibold hover:bg-neutral-50 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(4)}
                  disabled={!selectedClass}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-40"
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — EXAM */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mb-4">
                Step 3 of 3
              </div>

              <h2 className="text-3xl font-black text-black mb-2 flex items-center gap-2">
                <Target size={28} className="text-purple-600" />
                Your goal?
              </h2>
              <p className="text-neutral-600 text-sm mb-8">Helps us suggest better content</p>

              <div className="space-y-3 mb-6">
                {exams.map((e) => (
                  <motion.button
                    key={e}
                    onClick={() => setSelectedExam(e)}
                    className={`w-full text-left px-5 py-3 rounded-xl font-semibold border-2 transition-all ${
                      selectedExam === e
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                        : 'border-neutral-300 text-neutral-700 hover:border-purple-300'
                    }`}
                  >
                    {e}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(3)}
                  className="flex-1 border-2 border-neutral-300 text-black py-3 rounded-full font-semibold hover:bg-neutral-50 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleFinish}
                  disabled={!selectedExam || loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Complete →'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
