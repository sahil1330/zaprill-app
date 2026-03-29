import { createOpenAI } from "@ai-sdk/openai";
export const hackclub = createOpenAI({
    baseURL: "https://ai.hackclub.com/proxy/v1",
    // HackClub doesn't enforce auth — fall back to a placeholder so the SDK
    // never receives `undefined` and throws before even making a request.
    apiKey: process.env.AI_API_KEY ?? "hackclub",
});