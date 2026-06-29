import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, googleProvider)
      return result
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)