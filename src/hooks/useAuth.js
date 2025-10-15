import { useEffect, useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('jwt') || '')
  const [role, setRole] = useState(() => localStorage.getItem('role') || '')
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '')

  useEffect(() => {
    if (token) localStorage.setItem('jwt', token); else localStorage.removeItem('jwt')
    if (role) localStorage.setItem('role', role); else localStorage.removeItem('role')
    if (email) localStorage.setItem('email', email); else localStorage.removeItem('email')
  }, [token, role, email])

  const logout = () => { setToken(''); setRole(''); setEmail(''); }

  return { token, setToken, role, setRole, email, setEmail, logout }
}
