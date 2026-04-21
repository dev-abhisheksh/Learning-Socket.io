import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import jwt from "jsonwebtoken"

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

const SECRET = "supersecretkey"

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"))

    try {
        const decoded = jwt.verify(token, SECRET)
        socket.username = decoded.username
        next()
    } catch (error) {
        next(new Error("Invalid token"))
    }
})

io.on("connection", (socket) => {
    console.log("User connected:", socket.username)

    socket.on("send-message", (data) => {
        io.emit("recieve-message", data)
    })

    socket.on("disconnected", () => {
        console.log("User disconnected", socket.username)
    })
})

server.listen(3000, () => {
    console.log("Server is running on port 3000")
})