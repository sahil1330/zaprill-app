import { createOpenAI } from "@ai-sdk/openai";
export const hackclub = createOpenAI({
    baseURL: "https://ai.hackclub.com/proxy/v1",
    apiKey: process.env.AI_API_KEY,
});