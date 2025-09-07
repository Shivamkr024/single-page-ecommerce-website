
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../state/auth.jsx'

export default function Login() {
  const [email, setEmail] = useState('demo@shop.com')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState(null)
  const nav = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Login failed')
      const data = await res.json()
      login(data)
      nav('/items')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form className="form" onSubmit={onSubmit}>
        <div>
          <div className="label">Email</div>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <div className="muted">⚠️ {error}</div>}
        <button className="btn primary" type="submit">Sign in</button>
        <div className="muted">No account? <Link to="/signup">Create one</Link></div>
      </form>
    </div>
  )
}
