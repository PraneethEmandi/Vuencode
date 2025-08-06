
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let chat: Chat | null = null;

export function resetChat() {
    chat = null;
}

function getChatSession(): Chat {
  if (chat) {
    return chat;
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not found. Please ensure it's configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  
  return chat;
}

async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}


export async function* streamChat(message: string, file?: File): AsyncGenerator<string> {
  try {
    const chatSession = getChatSession();

    const messageParts: (string | Part)[] = [];
    
    if (file) {
        const videoPart = await fileToGenerativePart(file);
        messageParts.push(videoPart);
    }
    
    messageParts.push(message);

    const result = await chatSession.sendMessageStream({ message: messageParts });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
             throw new Error("The provided API key is invalid. Please check your configuration.");
        }
        throw new Error(`Failed to communicate with the AI model: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
}
