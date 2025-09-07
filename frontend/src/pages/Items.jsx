
import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/auth.jsx'

export default function Items() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [message, setMessage] = useState(null)

  const fetchItems = async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    const res = await fetch(`/api/items?${params.toString()}`)
    setItems(await res.json())
  }

  useEffect(() => { fetchItems() }, [])

  const addToCart = async (itemId) => {
    if (!token) { setMessage('Please login to add to cart.'); return; }
    setMessage(null)
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ itemId, qty: 1 })
    })
    const data = await res.json()
    if (!res.ok) setMessage(data.message || 'Failed')
    else setMessage('Added to cart ✅')
  }

  return (
    <div className="card">
      <h2>Items</h2>
      <div className="row">
        <input className="input" placeholder="search..." value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home</option>
        </select>
        <input className="input" placeholder="min price" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
        <input className="input" placeholder="max price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
        <button className="btn" onClick={fetchItems}>Apply</button>
      </div>
      {message && <p className="muted">{message}</p>}
      
<div className="grid" style={{marginTop: '1rem'}}>
  {items.map(it => (
    <div className="card" key={it.id}>
      <div className="row item">
        <img 
          src={it.image || 'image1.jpg'} 
          alt={it.name} 
          style={{width: '80px', height: '80px', objectFit: 'cover', marginRight: '1rem'}} 
        />
        <div>
          <div><strong>{it.name}</strong></div>
          <div className="badge">{it.category}</div>
        </div>
        <div className="price">₹{it.price}</div>
      </div>
      <button className="btn primary" onClick={()=>addToCart(it.id)}>Add to cart</button>
    </div>
  ))}
</div>
      </div>
   
  )
}
