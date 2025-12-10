// Gemini AI Service for KT Secure Chatbot

const GEMINI_API_KEY = 'AIzaSyAuKsfkPgNyDAu4UXBHgq6CgUIMWeVWviU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are KT Secure AI, an expert assistant for the KT Secure HSM (Hardware Security Module) Code Signing Platform. You help users with:

- Organization management (creating, updating, hierarchy)
- User management (roles: KTSecure Admin, Org Admin, Crypto Admin, Crypto User)
- PKCS#11 key management (RSA, ECDSA algorithms)
- Signing configurations (hash algorithms, timestamp authorities)
- Certificate Authority integration (EJBCA, MSCA)
- Code signing operations (Windows PE, macOS, firmware)
- Audit logs and compliance

Be concise, helpful, and security-focused. Use technical terms appropriately but explain complex concepts when needed.`;

export interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
    }[];
}

export async function sendGeminiMessage(
    userMessage: string,
    conversationHistory: GeminiMessage[] = []
): Promise<string> {
    try {
        // Build the conversation with system context
        const contents: GeminiMessage[] = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'I am KT Secure AI, ready to help with HSM and code signing operations.' }] },
            ...conversationHistory,
            { role: 'user', parts: [{ text: userMessage }] }
        ];

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    topP: 0.9,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', error);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        }

        return 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return 'I\'m having trouble connecting to the AI service. Please check your connection and try again.';
    }
}
