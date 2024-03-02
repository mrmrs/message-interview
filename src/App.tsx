import { useState } from "react"
import { faker } from "@faker-js/faker"
import logo from "./assets/logo.svg"
import { ask } from "./game"

export type MessageData = {
  from: string
  content: string
  timestamp: Date
  proximity?: number
}

const username = "coolPerson1994"
const animal = faker.animal.type()

const App = () => {
  const [isCorrect, setIsCorrect] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<MessageData[]>([
    { from: "riddler", content: "I'm thinking of an animal, can you guess what it is?", timestamp: new Date() },
  ])

  const askQuestion = async () => {
    if (question === "") return

    const newQuestion = { from: username, content: question, timestamp: new Date() }
    let updatedMessages = [...messages, newQuestion]
    setMessages(updatedMessages)
    setQuestion("")
    try {
      const response = await ask([...updatedMessages], animal)
      const newResponse = {
        from: "riddler",
        content: response.content,
        timestamp: new Date(),
        proximity: response.proximity,
      }
      updatedMessages = [...updatedMessages, newResponse]
      setMessages(updatedMessages)

      setIsCorrect(response.isCorrect)
    } catch (error) {
      const newResponse = {
        from: "riddler",
        content: "I'm sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      }
      updatedMessages = [...updatedMessages, newResponse]
      setMessages(updatedMessages)
      console.error(error)
    }
  }

  return (
    <div className="app">
      <img src={logo} className="logo" alt="React" />
      <div className="chatWindow">
        <div className="messages">
          {messages.map((message, index) => (
            <Message message={message} key={index} />
          ))}
        </div>
        <div className="askQuestion">
          <input
            type="text"
            placeholder="What's your guess?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={isCorrect}
          />
          <button disabled={isCorrect} type="submit" onClick={askQuestion}>
            ask
          </button>
        </div>
      </div>
      <div className="answer">{animal}</div>
    </div>
  )
}

const Message = ({ message }: { message: MessageData }) => {
  return (
    <div className={`message ${message.from == username && "self"}`}>
      <div className="metadata">
        <div className="from">{message.from}</div>
        <div className="timestamp">{message.timestamp.toLocaleTimeString()}</div>
        {message.proximity !== undefined && <div className="proximity">{message.proximity}</div>}
      </div>
      <div className="content">{message.content}</div>
    </div>
  )
}

export default App
