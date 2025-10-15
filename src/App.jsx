import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import NavBar from './components/NavBar'
import Protected from './components/Protected'
import Home from './pages/Home'
import Login from './pages/Login'
import Users from './pages/Users'
import DucaRegister from './pages/DucaRegister'
import Validation from './pages/Validation'
import States from './pages/States'
import NotFound from './pages/NotFound'

export default function App() {
  const { token, setToken, role, setRole, email, setEmail, logout } = useAuth()
  const nav = useNavigate()
  const doLogout = () => { logout(); nav('/login') }

  return (
    <>
      {token && <NavBar role={role} onLogout={doLogout} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToken={setToken} setRole={setRole} setEmail={setEmail} />} />

        <Route path="/usuarios" element={
          <Protected token={token} role={role} allow={['ADMIN']}>
            <Users token={token} />
          </Protected>
        }/>

        <Route path="/duca/registrar" element={
          <Protected token={token} role={role} allow={['TRANSPORTISTA']}>
            <DucaRegister token={token} />
          </Protected>
        }/>

        <Route path="/validacion" element={
          <Protected token={token} role={role} allow={['AGENTE']}>
            <Validation token={token} />
          </Protected>
        }/>

        <Route path="/estados" element={
          <Protected token={token} role={role} allow={['TRANSPORTISTA']}>
            <States token={token} />
          </Protected>
        }/>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
