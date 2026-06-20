import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { idToEmail } from '../lib/idToEmail'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signup(id, password, nickname) {
    const cred = await createUserWithEmailAndPassword(auth, idToEmail(id), password)
    await updateProfile(cred.user, { displayName: nickname })
    setUser({ ...cred.user, displayName: nickname })
    return cred.user
  }

  async function login(id, password) {
    const cred = await signInWithEmailAndPassword(auth, idToEmail(id), password)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
