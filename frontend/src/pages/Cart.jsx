
import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'

export default function Cart() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [message, setMessage] = useState(null)

  const load = async () => {
    const res = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => { load() }, [])

  const updateQty = async (itemId, qty) => {
    const res = await fetch('/api/cart/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ itemId, qty })
    })
    if (res.ok) load()
  }

  const removeItem = async (itemId) => {
    const res = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ itemId })
    })
    if (res.ok) load()
  }

  const total = items.reduce((sum, it) => sum + (it.item.price * it.qty), 0)

  return (
    <div className="card">
      <h2>Your Cart</h2>
      {items.length === 0 && <p className="muted">Your cart is empty.</p>}
      <div className="grid">
        {items.map(ci => (
          <div className="card" key={ci.itemId}>
            <div className="row item">
              <div>
                <div><strong>{ci.item.name}</strong></div>
                <div className="badge">{ci.item.category}</div>
              </div>
              <div className="price">₹{ci.item.price}</div>
            </div>
            <div className="row">
              <button className="btn" onClick={()=>updateQty(ci.itemId, Math.max(1, ci.qty-1))}>-</button>
              <span>Qty: {ci.qty}</span>
              <button className="btn" onClick={()=>updateQty(ci.itemId, ci.qty+1)}>+</button>
              <button className="btn" onClick={()=>removeItem(ci.itemId)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <hr />
      <div className="row" style={{justifyContent:'space-between'}}>
        <strong>Total:</strong>
        <strong>₹{total}</strong>
      </div>
    </div>
  )
}
