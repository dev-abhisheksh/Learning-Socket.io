import { useState } from 'react'
import { io } from "socket.io-client"

const App = () => {
  const [token, setToken] = useState(null)
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleAuth = async (type) => {
    // type = "login" or "register"
    const res = await fetch(`http://localhost:4000/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if (type === "login") {
      // connect to socket WITH token
      const newSocket = io("http://localhost:3000", {
        auth: { token: data.token }  // 🔑 this is what server reads
      })

      newSocket.on("recieve-message", (msg) => {
        setMessages((prev) => [...prev, msg])
      })

      setToken(data.token)
      setSocket(newSocket)
    } else {
      alert(data.message)  // "Registered successfully"
    }
  }

  const sendMessage = () => {
    if (!message.trim()) return

    const data = {
      text: message,
      sender: username,  // now we have real username!
      time: new Date().toLocaleTimeString()
    }

    socket.emit("send-message", data)
    setMessage("")
  }

  // show login screen if not logged in
  if (!token) return (
    <div>
      <h2>Login / Register</h2>
      <input placeholder="username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => handleAuth("register")}>Register</button>
      <button onClick={() => handleAuth("login")}>Login</button>
    </div>
  )

  // show chat if logged in
  return (
    <div>
      <h2>💬 Welcome {username}</h2>

      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.sender}</b>: {msg.text}
            <span> {msg.time}</span>
          </div>
        ))}
      </div>

      <div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default App