import { GoogleGenerativeAI } from "@google/generative-ai";

let model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

//@TODO: MAKE THIS MORE GENERIC IN THE FUTURE IE A SUPERCLASS
export async function transformUserInput(input: string): Promise<string> {
  const result = await getModel().generateContent(createPrompt(input));
  return result.response.text().trim();
}

function getModel() {
  const MODEL_NAME = "gemini-2.5-flash-lite";
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
  }
  return model;
}

function createPrompt(input: string): string {
  return `
  You are a search query optimizer for an e-commerce product search engine. 
  Extract the core product search intent from the user's input and return ONLY a concise keyword string — no explanation, no punctuation, no extra words.
  Input: "${input}"`;
}
