import { Navigate } from 'react-router-dom'

export default function Protected({ token, allow, role, children }) {
  if (!token) return <Navigate to="/login" replace />
  if (allow && allow.length && !allow.includes(role)) return <Navigate to="/" replace />
  return children
}
