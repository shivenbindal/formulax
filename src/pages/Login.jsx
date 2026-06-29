import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Login() {
  const { loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          navigate('/dashboard')
        } else {
          navigate('/onboarding')
        }
      }
    }
    checkUser()
  }, [user])

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white border border-black/8 rounded-3xl p-10 w-full max-w-md text-center shadow-sm"
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-6">Formula X</p>
        <h1 className="text-3xl font-black tracking-tighter text-black mb-2">Welcome back.</h1>
        <p className="text-neutral-500 text-sm mb-10">Sign in to access your formula sheets.</p>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-black/10 rounded-full py-4 text-sm font-medium text-black hover:bg-neutral-50 hover:border-black/20 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
          Continue with Google
        </button>

        <p className="text-xs text-neutral-400 mt-8">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}