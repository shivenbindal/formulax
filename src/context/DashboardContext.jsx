import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { syllabus } from '../data/syllabus'

const DashboardContext = createContext(null)

export function useDashboard() {
  return useContext(DashboardContext)
}

export function DashboardProvider({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState('Class 11')
  const [selectedSubject, setSelectedSubject] = useState('Physics')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [classPanelOpen, setClassPanelOpen] = useState(false)
  const [classLoaded, setClassLoaded] = useState(false)
  const [dark, setDark] = useState(false)
  const [streak, setStreak] = useState(0)
  const [classChangeVersion, setClassChangeVersion] = useState(0)

  useEffect(() => {
    const init = async () => {
      if (!user) {
        console.log('DashboardContext: No user, marking as loaded')
        setClassLoaded(true)
        return
      }

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('DashboardContext: Initialization timeout, marking as loaded anyway')
        setClassLoaded(true)
      }, 5000)

      try {
        console.log('DashboardContext: Initializing for user:', user.uid)
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        const data = snap.exists() ? snap.data() : {}
        
        console.log('DashboardContext: User data:', data)
        
        if (data.class && syllabus[data.class]) {
          setSelectedClass(data.class)
          setSelectedSubject(Object.keys(syllabus[data.class])[0])
        }
        if (typeof data.darkMode === 'boolean') setDark(data.darkMode)

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        let newStreak = data.streak || 0
        if (data.lastActive === today) {
          // already counted
        } else if (data.lastActive === yesterday) {
          newStreak = newStreak + 1
          await setDoc(userRef, { streak: newStreak, lastActive: today }, { merge: true })
        } else {
          newStreak = 1
          await setDoc(userRef, { streak: newStreak, lastActive: today }, { merge: true })
        }
        setStreak(newStreak)

        await addDoc(collection(db, 'activity'), {
          userId: user.uid, userName: user.displayName, userEmail: user.email,
          action: 'session', timestamp: new Date().toISOString(),
        })

        console.log('DashboardContext: Initialization complete')
      } catch (err) {
        console.error('DashboardContext: Initialization error:', err)
      }
      finally {
        clearTimeout(timeout)
        setClassLoaded(true)
      }
    }
    init()
  }, [user])

  const handleLogout = async () => { await logout(); navigate('/') }

  const handleClassChange = async (c) => {
    setSelectedClass(c)
    setSelectedSubject(Object.keys(syllabus[c] || {})[0])
    setClassPanelOpen(false)
    setClassChangeVersion(v => v + 1)
    if (user) {
      try { await setDoc(doc(db, 'users', user.uid), { class: c }, { merge: true }) }
      catch (err) { console.error(err) }
    }
  }

  const toggleDark = async () => {
    const newVal = !dark; setDark(newVal)
    if (user) {
      try { await setDoc(doc(db, 'users', user.uid), { darkMode: newVal }, { merge: true }) }
      catch (err) { console.error(err) }
    }
  }

  const bg = dark ? 'bg-neutral-950' : 'bg-[#FAFAF8]'
  const surface = dark ? 'bg-neutral-900' : 'bg-white'
  const border = dark ? 'border-white/10' : 'border-black/6'
  const border2 = dark ? 'border-white/10' : 'border-black/8'
  const text = dark ? 'text-white' : 'text-black'
  const navActive = dark ? 'bg-white text-black' : 'bg-black text-white'
  const navInactive = dark ? 'text-neutral-400 hover:bg-white/5 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'

  const value = {
    user, handleLogout,
    selectedClass, setSelectedClass, selectedSubject, setSelectedSubject,
    sidebarOpen, setSidebarOpen, classPanelOpen, setClassPanelOpen,
    classLoaded, dark, toggleDark, streak, handleClassChange, classChangeVersion,
    bg, surface, border, border2, text, navActive, navInactive,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}
