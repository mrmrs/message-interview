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

const animalEmojis = {
  ant: "🐜",
  bat: "🦇",
  bear: "🐻",
  bee: "🐝",
  buffalo: "🦬",
  butterfly: "🦋",
  camel: "🐫",
  cat: "🐱",
  chicken: "🐔",
  cow: "🐄",
  crab: "🦀",
  deer: "🦌",
  dog: "🐶",
  dolphin: "🐬",
  dragon: "🐲",
  elephant: "🐘",
  fish: "🐟",
  flamingo: "🦩",
  fox: "🦊",
  frog: "🐸",
  giraffe: "🦒",
  horse: "🐴",
  kangaroo: "🦘",
  koala: "🐨",
  ladybug: "🐞",
  lion: "🦁",
  lobster: "🦞",
  monkey: "🐒",
  mouse: "🐭",
  narwhal: "🦄🐋",
  octopus: "🐙",
  orca: "🐋",
  otter: "🦦",
  owl: "🦉",
  panda: "🐼",
  parrot: "🦜",
  peacock: "🦚",
  penguin: "🐧",
  pig: "🐖",
  rabbit: "🐰",
  scorpion: "🦂",
  shark: "🦈",
  sheep: "🐑",
  skunk: "🦨",
  sloth: "🦥",
  snail: "🐌",
  snake: "🐍",
  spider: "🕷️",
  squid: "🦑",
  tiger: "🐅",
  turtle: "🐢",
  whale: "🐳",
  zebra: "🦓",
};

const randomDisplayP3Color = () => new Color("p3", [Math.random(), Math.random(), Math.random()]);

const generateAccessibleColorPair = (optionalColor, contrastThreshold = 60, algorithm = 'APCA' ) => {
    // Function to generate a random Display-P3 color 

    // Function to check if contrast is above a threshold using APCA
    const isContrastHighEnough = (color1, color2) => {
        let contrast = color1.contrast(color2, algorithm);
        return contrast > contrastThreshold || contrast <= -60;
    };

    let primaryColor, secondaryColor;
    if (optionalColor) {
        try {
            // Use the provided optional color as one of the pair
            primaryColor = new Color(optionalColor);

            // Generate the other color
            do {
                secondaryColor = randomDisplayP3Color();
            } while (!isContrastHighEnough(primaryColor, secondaryColor, contrastThreshold));
        } catch (error) {
            throw new Error("Invalid optional color provided.");
        }
    } else {
        // If no optional color is provided, generate both colors
        do {
            primaryColor = randomDisplayP3Color();
            secondaryColor = randomDisplayP3Color();
        } while (!isContrastHighEnough(primaryColor, secondaryColor));
    }

    return {
        backgroundColor: primaryColor.toString({ format: 'p3' }),
        color: secondaryColor.toString({ format: 'p3' }),
        whiteBool: secondaryColor.contrast('#ffffff', algorithm) > contrastThreshold ? true : false
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
  const [isAsking, setIsAsking] = useState(false);

  const askQuestion = async () => {
    if (question === "") return
    setIsAsking(true);

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

    setIsAsking(false);
  }

  const handleGen = () => {
    setAppColors(generateAccessibleColorPair());
    setUserColors(generateAccessibleColorPair());
  };

  const handleGenLight = () => {
    setAppColors(generateAccessibleColorPair('#ffffff', 4.5, 'WCAG21'));
    setUserColors(generateAccessibleColorPair());
  };

  const handleGenDark = () => {
    setAppColors(generateAccessibleColorPair('#000000', 4.5, 'WCAG21'));
    setUserColors(generateAccessibleColorPair());
  };

    const handleResetGame = () => {
      setIsCorrect(false);
      setQuestion("");
      setMessages([{ from: "riddler", content: "You tricked me last time. Now I'm thinking of a new animal, can you guess what it is?", timestamp: new Date() }]);
      // Generate a new animal
      animal = faker.animal.type();
    };

    useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !isCorrect) {
        askQuestion();
      }
  };


  return (
    <div className="app" style={{ color: appColors.backgroundColor, backgroundColor: appColors.backgroundColor, padding: '0 32px' }}>
    <header style={{ background: appColors.backgroundColor, color: appColors.color, position: 'fixed', top: 0, left: 0, right: 0, height: '64px', zIndex: 9999  }}>
      <div style={{ width: '48px', margin: '0 auto', padding: '8px 0' }}><button style={{ 
          appearance: 'none', WebkitAppearance: 'none', border: 0, background: 'transparent', width: '48px'   
        , color: appColors.color }} onClick={handleGen} className={isAsking ? 'wiggle' : ''}><Logo /></button></div>
        <button style={{ position: 'absolute', top: '12px', right: '12px', border: '1px solid rgba(0,0,0,.25)', display: 'block', appearance: 'none', WebkitAppearance: 'none', height: '12px', width: '12px', padding: 0, borderRadius: '9999px', background: 'white', }} onClick={handleGenLight}> </button>
        <button style={{ position: 'absolute', top: '12px', right: '28px', border: '1px solid rgba(255,255,255,.25)', display: 'block', appearance: 'none', WebkitAppearance: 'none', height: '12px', width: '12px', padding: 0, borderRadius: '9999px', background: 'black', }} onClick={handleGenDark}> </button>
    </header>
      <div className="chatWindow" style={{ position: 'fixed', maxHeight: 'calc(100dvh-128px)', overflow: 'auto', bottom: '134px', left: '0', right: '0' }}>
      <div className="messages" style={{ height: '100%', overflow: 'auto', padding: '0 32px' }}>
      <div style={{ maxWidth: '60ch', margin: '0 auto', color: appColors.color }}>
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
          <div>
   <svg version="1.1" id="L5" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 100 100" xmlSpace="preserve" style={{ position: 'relative', top: '-24px', width: '64px', transition: 'height .2s ease', opacity: isAsking? '1': '0', margin: '0 auto', display: isAsking? 'block' : 'none' }}>
      <circle fill="currentColor" stroke="none" cx="6" cy="50" r="6">
        <animateTransform 
          attributeName="transform" 
          dur="1s" 
          type="translate" 
          values="0 15 ; 0 -15; 0 15" 
          repeatCount="indefinite" 
          begin="0.1"/>
      </circle>
      <circle fill="currentColor" stroke="none" cx="30" cy="50" r="6">
        <animateTransform 
          attributeName="transform" 
          dur="1s" 
          type="translate" 
          values="0 10 ; 0 -10; 0 10" 
          repeatCount="indefinite" 
          begin="0.2"/>
      </circle>
      <circle fill="currentColor" stroke="none" cx="54" cy="50" r="6">
        <animateTransform 
          attributeName="transform" 
          dur="1s" 
          type="translate" 
          values="0 5 ; 0 -5; 0 5" 
          repeatCount="indefinite" 
          begin="0.3"/>
      </circle>
    </svg>
          </div>
          <div ref={bottomRef} />

          </div>
        </div>
        <div className="askQuestion" style={{ background: appColors.backgroundColor, position: 'fixed', bottom: 0, left: 0, right: 0, padding: '32px' }}>
        <div style={{ display: isCorrect? 'block' : 'none', position: 'relative', textAlign: 'center', maxWidth: '60ch', margin: '0 auto', }}>
            <button onClick={handleResetGame} style={{ appearance: 'none', WebkitAppearance: 'none',  backgroundColor: appColors.color, color: appColors.backgroundColor, fontWeight: 900, border: 0, borderRadius: '8px', padding: '8px 32px', fontSize: '24px', margin: '0 auto' }}>Play again</button>
        </div>
        <div style={{ display: isCorrect? 'none' : 'block', position: 'relative', maxWidth: '60ch', margin: '0 auto', }}>
          <input
            type="text"
            placeholder="What's your guess?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={isCorrect}
            autoFocus='autofocus'
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
          <button disabled={isCorrect} type="submit" onClick={askQuestion} style={{ appearance: 'none', WebkitAppearance: 'none', position: 'absolute', backgroundColor: appColors.color, color: appColors.backgroundColor, fontWeight: 900, border: 0, borderRadius: '8px', padding: '8px 32px', top: '14px', right: '14px', fontSize: '24px' }}>
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

     const replaceAnimalWithEmoji = (text) => {
        return text.split(/\s+/).map(word => {
          // Check if the word is an animal name and replace with an emoji if it is
          return animalEmojis[word.toLowerCase()] || word;
        }).join(" ");
      };


  return (
    <div className={`message ${message.from == username && "self"}`} style={{ textAlign: message.from == username? 'right': 'left'}}>
      <div className="metadata">
        <div className="from" style={{ color: 'inherit', textTransform: 'capitalize', fontSize: '12px', fontWeight: 700, marginBottom: '4px', opacity: .7 }}>
            {message.from}
        </div>
      </div>
      <div className="content" style={{ width: 'auto', color: message.from == username? colors.backgroundColor : colors.color, backgroundColor: message.from == username? colors.color: colors.backgroundColor }}>
      {message.proximity !== undefined && <div className="proximity" style={{ lineHeight: 1, marginTop: 0, display: 'block', fontSize: '12px', fontWeight: 400, 
      width: 'auto', }}> {proximityPhrases[message.proximity + 5]} </div>}

      <p style={{margin: 0, fontSize: '24px', display: 'inline-block', width: 'auto'  }}>
         {replaceAnimalWithEmoji(message.content)}
      </p>

      </div>

        <time className="timestamp" style={{ fontSize: '10px', marginTop: '4px', fontFamily: 'monospace', opacity: .75, color: 'inherit' }}>{message.timestamp.toLocaleTimeString()}</time>
    </div>
  )
}

export default App
