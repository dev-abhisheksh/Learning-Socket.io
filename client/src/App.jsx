import React, { useEffect, useState } from 'react'
import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

const App = () => {

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on("recieve-message", (data) => {
      setMessages((prev) => [...prev, data])
    })

    return () => socket.off("recieve-message")
  }, [])

  const sendMessage = () => {
    if (!message.trim()) return

    const data = {
      text: message,
      sender: socket.id,
      time: new Date().toLocaleDateString()
    }

    socket.emit("send-message", data)
    setMessage("")
  }

  return (
    <div>
      <h2>Chat App</h2>

      <div className='flex justify-center items-center flex-col w-full gap-4'>
        {messages.map((msg, i) => (
          <div key={i}
            className='border rounded-lg bg-white p-2 w-[30vw]'
          >
            <h4>{msg.sender.slice(0, 4)}</h4>
            <p>{msg.text}</p>
            <p>{msg.time}</p>
          </div>
        ))}
      </div>

      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder='Enter message ...'
          value={message}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default App