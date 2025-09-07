
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const JWT_SECRET = process.env.JWT_SECRET || "dev_super_secret_change_me";
const PORT = process.env.PORT || 4000;

// ---- In-memory "DB" ----
let users = [
  // demo user: email: demo@shop.com, password: demo123
];
let items = [
  { id: 1,image: "", name: "Bluetooth Headphones", price: 1999, category: "electronics" },
  { id: 2,image:"", name: "Running Shoes", price: 2999, category: "fashion" },
  { id: 3,image:"", name: "Classic T-Shirt", price: 799, category: "fashion" },
  { id: 4,image:"", name: "Coffee Maker", price: 2499, category: "home" },
  { id: 5,image:"", name: "USB-C Cable", price: 299, category: "electronics" }
];
let nextItemId = 6;
// carts: { [userId]: [{ itemId, qty }] }
let carts = {};

// utils
const makeToken = (user) => jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// seed demo user
(async () => {
  const hash = await bcrypt.hash("demo123", 10);
  users.push({ id: 1, email: "demo@shop.com", password: hash });
  carts[1] = [];
})();

// ---- Auth ----
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  if (users.some(u => u.email === email)) return res.status(409).json({ message: "Email already registered" });
  const hash = await bcrypt.hash(password, 10);
  const id = users.length ? Math.max(...users.map(u=>u.id)) + 1 : 1;
  const user = { id, email, password: hash };
  users.push(user);
  carts[id] = carts[id] || [];
  const token = makeToken(user);
  return res.json({ token, user: { id, email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = makeToken(user);
  return res.json({ token, user: { id: user.id, email: user.email } });
});

// ---- Items CRUD with filters ----
app.get("/api/items", (req, res) => {
  let { minPrice, maxPrice, category, q } = req.query;
  let result = [...items];
  if (minPrice) result = result.filter(i => i.price >= Number(minPrice));
  if (maxPrice) result = result.filter(i => i.price <= Number(maxPrice));
  if (category) result = result.filter(i => i.category === String(category).toLowerCase());
  if (q) {
    const s = String(q).toLowerCase();
    result = result.filter(i => i.name.toLowerCase().includes(s));
  }
  res.json(result);
});

app.post("/api/items", auth, (req, res) => {
  const { image ,name, price, category } = req.body;
  if (!image || !name || price == null || !category) return res.status(400).json({ message: "name, price, category required" });
  const item = { id: nextItemId++,image , name, price: Number(price), category: String(category).toLowerCase() };
  items.push(item);
  res.status(201).json(item);
});

app.put("/api/items/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });
  const { image, name, price, category } = req.body;
  items[idx] = { 
    ...items[idx], 
    ...(image !== undefined && {image}),
    ...(name && {name}), 
    ...(price != null && {price: Number(price)}), 
    ...(category && {category: String(category).toLowerCase()}) };
  res.json(items[idx]);
});

app.delete("/api/items/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });
  const [removed] = items.splice(idx, 1);
  // also remove from carts
  Object.keys(carts).forEach(uid => {
    carts[uid] = (carts[uid] || []).filter(ci => ci.itemId !== id);
  });
  res.json(removed);
});

// ---- Cart ----
app.get("/api/cart", auth, (req, res) => {
  const uid = req.user.uid;
  const cart = carts[uid] || [];
  const detailed = cart.map(ci => {
    const item = items.find(i => i.id === ci.itemId);
    return item ? { ...ci, item } : null;
  }).filter(Boolean);
  res.json(detailed);
});

app.post("/api/cart/add", auth, (req, res) => {
  const uid = req.user.uid;
  const { itemId, qty } = req.body;
  const item = items.find(i => i.id === Number(itemId));
  if (!item) return res.status(404).json({ message: "Item not found" });
  carts[uid] = carts[uid] || [];
  const existing = carts[uid].find(ci => ci.itemId === item.id);
  if (existing) existing.qty += Number(qty || 1);
  else carts[uid].push({ itemId: item.id, qty: Number(qty || 1) });
  res.json({ message: "Added", cart: carts[uid] });
});

app.post("/api/cart/remove", auth, (req, res) => {
  const uid = req.user.uid;
  const { itemId } = req.body;
  carts[uid] = (carts[uid] || []).filter(ci => ci.itemId !== Number(itemId));
  res.json({ message: "Removed", cart: carts[uid] });
});

app.patch("/api/cart/update", auth, (req, res) => {
  const uid = req.user.uid;
  const { itemId, qty } = req.body;
  const entry = (carts[uid] || []).find(ci => ci.itemId === Number(itemId));
  if (!entry) return res.status(404).json({ message: "Item not in cart" });
  entry.qty = Math.max(1, Number(qty || 1));
  res.json({ message: "Updated", cart: carts[uid] });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
