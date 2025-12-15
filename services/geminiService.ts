

import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is handled by the environment. Do not hardcode.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const parseCvWithAI = async (
  fileData: string, // base64 encoded string
  mimeType: string
): Promise<{ name: string; email: string; phone: string; address: string; skills: string[]; synopsis: string }> => {
  if (!API_KEY) {
    throw new Error("AI features are disabled. Please provide an API key.");
  }

  const prompt = "From the following CV document, extract the candidate's full name, email address, phone number, and full postal address. Also, extract a list of their key skills (maximum 10) and provide a brief professional synopsis of their experience (2-3 sentences).";
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: fileData,
                        },
                    },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    address: { type: Type.STRING },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    synopsis: { type: Type.STRING },
                },
                required: ["name", "email", "phone", "address", "skills", "synopsis"],
            },
        },
    });

    if (response.text) {
        const parsed = JSON.parse(response.text);
        return parsed;
    }
    throw new Error("Failed to parse CV. The response was empty.");

  } catch (error) {
    console.error("Error parsing CV with Gemini API:", error);
    throw new Error("Failed to extract information from the CV using AI.");
  }
};


export const generateEmailTemplate = async (
  candidateName: string,
  jobTitle: string,
  purpose: string
): Promise<{ subject: string; body: string }> => {
  if (!API_KEY) {
    throw new Error("AI features are disabled. Please provide an API key.");
  }

  const prompt = `Generate a professional email for a recruitment process.
  
  Candidate Name: ${candidateName}
  Job Title: ${jobTitle}
  Purpose of the email: ${purpose}

  The tone should be professional but friendly. The email should be addressed to the candidate.
  Provide a suitable subject line and a full email body.
  Do not include any sign-off like "Best regards," or the sender's name.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "The subject line of the email." },
            body: { type: Type.STRING, description: "The body of the email." },
          },
          required: ["subject", "body"],
        },
      },
    });

    if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return parsed;
    }
    throw new Error("Failed to generate email template. The response was empty.");

  } catch (error) {
    console.error("Error generating email template with Gemini API:", error);
    throw new Error("Failed to generate email template using AI.");
  }
};