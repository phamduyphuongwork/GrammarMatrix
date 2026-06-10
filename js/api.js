// Namespace for Grammar Matrix Gemini AI APIs
window.GrammarAPI = {
    get apiKey() {
        return localStorage.getItem('gemini_api_key') || "";
    },

    set apiKey(val) {
        localStorage.setItem('gemini_api_key', val);
    },

    get activeModel() {
        return localStorage.getItem('gemini_model') || "gemini-2.5-flash";
    },

    set activeModel(val) {
        localStorage.setItem('gemini_model', val);
    },

    /**
     * Cleans Gemini's output of potential Markdown code blocks like ```json ... ```
     * to prevent crashes during JSON.parse.
     * @param {string} rawText
     * @returns {string}
     */
    cleanJSONResponse(rawText) {
        if (!rawText) return "";
        let cleanText = rawText.trim();
        
        // Remove leading ```json or ```
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.substring(3);
        }
        
        // Remove trailing ```
        if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        
        return cleanText.trim();
    },

    /**
     * Unified Gemini API Fetcher with Exponential Backoff
     * @param {string} prompt 
     * @param {string} systemInstruction 
     * @param {object|null} responseSchema 
     * @returns {Promise<object>}
     */
    async callGeminiAPI(prompt, systemInstruction, responseSchema = null) {
        const key = this.apiKey;
        if (!key) {
            if (typeof window.GrammarApp !== 'undefined' && typeof window.GrammarApp.showAPIKeyPrompt === 'function') {
                window.GrammarApp.showAPIKeyPrompt();
            } else {
                alert("Vui lòng cấu hình Gemini API Key trước khi sử dụng tính năng AI!");
            }
            throw new Error("Gemini API Key chưa được cấu hình.");
        }

        const model = this.activeModel;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        };

        if (responseSchema) {
            payload.generationConfig = {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            };
        }

        let retryCount = 0;
        const maxRetries = 5;

        while (retryCount < maxRetries) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const result = await response.json();
                return result;
            } catch (error) {
                console.warn(`Gemini API error (retry ${retryCount + 1}/${maxRetries}):`, error);
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw error;
                }
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};
