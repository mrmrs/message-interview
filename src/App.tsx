import { useEffect, useState, useRef } from "react"
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Color from "colorjs.io"
import { faker } from "@faker-js/faker"
import Logo from "./assets/Logo.tsx"
import { ask } from "./game"

function getRandomInt(min, max) {
    if (min > max) {
        throw new Error("Minimum should be less than or equal to Maximum");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const proximityPhrases = [
    "🥶🥶🥶🥶🥶 Absolute zero",        
    "🧊🧊🧊🧊 Super Ice Cold",
    "❄️❄️❄️ Ice Cold",
    "🍦🍦 Colder",
    "❄️  A little chilly",
    "🤔 You're basically right where you started",
    "☀️  Warmer",
    "🔥🔥 Getting warmer!!",
    "🌶️🌶️🌶️  Hot on the Trail!!!",
    "🔥🔥🔥🔥 Burning up!!!!",
    "🥵🥵🥵🥵🥵 Red Hot!!!!!"                
];

const generateAccessibleColorPair = () => {
    // Function to generate a random Display-P3 color 
    const randomDisplayP3Color = () => new Color("p3", [Math.random(), Math.random(), Math.random()]);
    // Function to check if contrast is above 45 using APCA 45 = 3 60 = 4.5 75 = 7 in WCAG
    const isContrastHighEnough = (background, text, contrastThreshold = 45) => {
        let contrast = background.contrast(text, "APCA");
        return contrast > 60;
    };

    let baseColor, matchingColor;
    do {
        baseColor = randomDisplayP3Color();
        matchingColor = randomDisplayP3Color();
    } while (!isContrastHighEnough(baseColor, matchingColor));

    return {
        color: baseColor.toString({ format: 'p3' }),
        backgroundColor: matchingColor.toString({ format: 'p3' }),
        whiteBool: baseColor.contrast('#ffffff', "APCA") > 45? true : false
    };
};

export type MessageData = {
  from: string
  content: string
  timestamp: Date
  proximity?: number
}

const username = "coolPerson1994"
const animal = faker.animal.type()


const App = () => {
  const bottomRef = useRef(null);
  const [isCorrect, setIsCorrect] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<MessageData[]>([
    { from: "riddler", content: "I'm thinking of an animal, can you guess what it is?", timestamp: new Date() },
  ])

  const [appColors, setAppColors ] = useState(generateAccessibleColorPair())
  const [userColors, setUserColors ] = useState(generateAccessibleColorPair())

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

  const handleGen = () => {
    setAppColors(generateAccessibleColorPair());
    setUserColors(generateAccessibleColorPair());
  };

    useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className="app" style={{ color: appColors.color, backgroundColor: appColors.backgroundColor, padding: '0 32px' }}>
    <header style={{ background: appColors.backgroundColor, position: 'fixed', top: 0, left: 0, right: 0, height: '64px', zIndex: 9999  }}>
      <div style={{ width: '48px', margin: '0 auto', padding: '8px 0' }}><button style={{ 
          appearance: 'none', WebkitAppearance: 'none', border: 0, background: 'transparent', width: '48px'   
        , color: 'inherit',  }} onClick={handleGen}><Logo /></button></div>
    </header>
      <div className="chatWindow" style={{ position: 'fixed', maxHeight: 'calc(100dvh-128px)', overflow: 'auto', bottom: '128px', left: '0', right: '0' }}>
      <div className="messages" style={{ height: '100%', overflow: 'auto', maxHeight: '90dvh', padding: '0 32px' }}>
      <div style={{ maxWidth: '60ch', margin: '0 auto' }}>
            <TransitionGroup className="messages">
          {messages.map((message, index) => (
 <CSSTransition
              key={index}
              timeout={300}
              classNames="message"
            >
              <Message index={index} message={message} colors={userColors} key={index} />
            </CSSTransition>
          ))}
          </TransitionGroup>
          <div ref={bottomRef} />

          </div>
        </div>
        <div className="askQuestion" style={{ background: appColors.backgroundColor, position: 'fixed', bottom: 0, left: 0, right: 0, padding: '32px' }}>
        <div style={{ position: 'relative', maxWidth: '60ch', margin: '0 auto', }}>
          <input
            type="text"
            placeholder="What's your guess?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={isCorrect}
            autofocus='autofocus'
            style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'transparent',
                fontSize: '24px',
                fontWeight: 900,
                border: '6px solid',
                borderColor: appColors.color,
                color: appColors.color,
                borderRadius: '16px',
                padding: '16px',
                width: '100%',
            }}
          />
          <button disabled={isCorrect} type="submit" onClick={askQuestion} style={{ appearance: 'none', WebkitAppearance: 'none', position: 'absolute', right: 0, backgroundColor: appColors.color, color: appColors.backgroundColor, fontWeight: 900, border: 0, borderRadius: '8px', padding: '8px 32px', top: '14px', right: '14px', fontSize: '24px' }}>
            Ask
          </button>
          </div>
        </div>
      </div>
      <div className="answer" style={{ color: appColors.backgroundColor }}>{animal}</div>
    </div>
  )
}

const Message = ({ index, message, colors }: { message: MessageData }) => {
  return (
    <div className={`message ${message.from == username && "self"}`} style={{ textAlign: index % 2 === 0? 'left': 'right'}}>
      <div className="metadata">
        <div className="from" style={{ textTransform: 'capitalize', fontSize: '12px', fontWeight: 700, marginBottom: '4px', opacity: .7 }}>
            {message.from}
        </div>

      </div>
      <div className="content" style={{ color: index % 2 === 0? colors.color : colors.backgroundColor, backgroundColor: index % 2 === 0? colors.backgroundColor: colors.color }}>
      {message.proximity !== undefined && <div className="proximity" style={{ lineHeight: 1, marginTop: 0, display: 'inline-block', fontSize: '12px', fontWeight: 400, 
     // backgroundColor: colors.whiteBool? 'white' : 'black', 
      width: 'auto', }}> {proximityPhrases[message.proximity + 5]} </div>}

      <p style={{margin: 0, fontSize: '32px', }}>{message.content}</p>

      </div>

        <time className="timestamp" style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'monospace', opacity: .5 }}>{message.timestamp.toLocaleTimeString()}</time>
    </div>
  )
}

export default App
