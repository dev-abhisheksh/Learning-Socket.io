import express from "express";
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const app = express();
app.use(cors())
app.use(express.json())

const SECRET = "supersecretkey"

const users = []

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const exists = users.find(u => u.username === username)
    if (exists) return res.status(400).json({ message: "User already exists" })

    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed })

    res.status(201).json({ message: "Registered successfully" })
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("data",username,password)

    const exists = users.find(u => u.username === username)
    if (!exists) return res.status(404).json({ message: "Register first" })

    const isMatch = await bcrypt.compare(password, exists.password)
    if (!isMatch) return res.status(400).json({ message: "Wrong password" })

    const token = await jwt.sign({ username }, SECRET, { expiresIn: "1d" })

    res.json({ token })
})

app.listen(4000, () => console.log("Auth service running on port 4000"))