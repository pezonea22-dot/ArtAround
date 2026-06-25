import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('profile')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const saveProfile = (profileData) => {
    localStorage.setItem('profile', JSON.stringify(profileData))
    setProfile(profileData)
  }

  return (
    <UserContext.Provider value={{ user, profile, login, logout, saveProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)