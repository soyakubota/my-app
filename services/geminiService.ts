
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePerformance(
  metrics: string,
  flaskCode: string,
  locustCode: string
) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      Analyze the following Flask API and Locust test script for potential performance bottlenecks.
      
      FLASK CODE:
      ${flaskCode}
      
      LOCUST CODE:
      ${locustCode}
      
      REPORTED METRICS (Simulation):
      ${metrics}
      
      Provide 3 actionable optimization tips for the Flask backend and 1 tip for the Locust configuration.
    `,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return response.text;
}

export async function analyzeLogs(logs: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      The user is getting the following terminal logs/errors while trying to run a Flask API or Locust test.
      Explain what happened and how to fix it simply.
      
      LOGS:
      ${logs}
    `,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
}

export async function generateCustomEndpoint(purpose: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a Flask endpoint in Python for: ${purpose}. Also provide the corresponding Locust task.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flask_code: { type: Type.STRING },
          locust_code: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["flask_code", "locust_code", "explanation"]
      }
    }
  });
  return JSON.parse(response.text);
}
