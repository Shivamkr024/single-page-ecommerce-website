
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Items from './pages/Items.jsx'
import Cart from './pages/Cart.jsx'
import { AuthProvider, useAuth } from './state/auth.jsx'
import './styles.css'

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <Link to="/items" className="brand">MiniShop</Link>
      <div className="spacer" />
      <Link to="/items">Items</Link>
      <Link to="/cart">Cart</Link>
      {user ? (
        <>
          <span className="muted">{user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  )
}

function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/items" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/items" element={<Items />} />
            <Route path="/cart" element={<Protected><Cart /></Protected>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
