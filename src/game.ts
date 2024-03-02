import OpenAI from "openai"
import { MessageData } from "./App"

const openai = new OpenAI({
  apiKey: import.meta.env["VITE_OPENAI_API_KEY"], // This is the default and can be omitted
  dangerouslyAllowBrowser: true, // This is required for the browser
})

export const ask = async (messages: MessageData[], animal: string) => {
  let isCorrect = false
  let proximity = 0
  const guessIsCorrect = () => {
    isCorrect = true
  }

  const guessProximity = (args: { proximity: number }) => {
    proximity = args.proximity
  }

  const chatCompletion = await openai.beta.chat.completions.runTools({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `You are playing a game with the user. You are thinking of a ${animal}, but do not tell the user what animal you are thinking of! The user is going to try and guess which animal. If they guess it (or are close) tell them they won! If they guess wrong tell them one thing in common their guess has with a ${animal}, but be cryptic! After every guess run the 'guessProximity' function to tell the user how close they are to the correct answer. If the user guesses correctly, run the 'guessProximity' function. If the user guesses correctly, run the 'guessIsCorrect' function.`,
      },
      ...messages.map<OpenAI.ChatCompletionMessageParam>((message) => ({
        role: message.from === "riddler" ? "assistant" : "user",
        content: message.content,
      })),
    ],
    tools: [
      {
        type: "function",
        function: {
          function: guessIsCorrect,
          name: "guessIsCorrect",
          description: "Called when the user guesses correctly",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          function: guessProximity,
          name: "guessProximity",
          description: "Called after every guess. Tells the user how close they are to the correct answer.",
          parse: JSON.parse,
          parameters: {
            type: "object",
            properties: {
              proximity: {
                type: "number",
                description:
                  "The proximity of the user's guess to the correct answer. The range of the 'proximity' param is -5 to 5, where -5 is very far away and 5 is very close.",
              },
            },
          },
        },
      },
    ],
  })

  const finalContent = (await chatCompletion.finalContent()) || "I'm having some trouble answering you. Try again!"

  return {
    content: finalContent,
    isCorrect,
    proximity,
  }
}
