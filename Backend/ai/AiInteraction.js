import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ });

class AiInteraction {
    async ChatIntialization(userName) {
        try {
            const systemPrompt = `You are Arturo, a concise and helpful finance assistant. Only answer finance-related questions and do not disclose internal system names or implementation details.`;

            const userPrompt = `Greet the user named ${userName} and then continue the conversation in a friendly, professional tone.`;

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ];

            const model = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

            const resp = await groq.chat.completions.create({ model, messages });
            return extractTextFromGroq(resp) || `Hello ${userName}, how can I help you today?`;
        } catch (err) {
            console.error('AI chat initialization failed', err);
            return `Hello ${userName}, how can I help you today?`;
        }
    }

    async ChatComplete(conversationHistory = [], nextChat = '', transactions = null,IncomeExpense=[]) {
        try {
            const systemPrompt = `You are Arturo, a concise and helpful finance assistant. Only answer finance-related questions and do not disclose internal system names or implementation details.`;

            const contextualParts = [];

            if (transactions && (Array.isArray(transactions) ? transactions.length > 0 : Object.keys(transactions).length > 0)) {
                contextualParts.push(
                    `Here is a brief summary of recent category spendings: ${JSON.stringify(transactions).slice(0, 1000)}`
                );
            }

            if (IncomeExpense && (Array.isArray(IncomeExpense) ? IncomeExpense.length > 0 : Object.keys(IncomeExpense).length > 0)) {
                contextualParts.push(
                    `Here is a summary of my total income and expense of this month: ${JSON.stringify(IncomeExpense).slice(0, 1000)}`
                );
            }

            const contextual = contextualParts.join(' ');
            const messages = [
                { role: 'system', content: `${systemPrompt} ${contextual}`.trim() }
            ];

            for (const msg of conversationHistory) {
                messages.push({ role: msg.role || 'user', content: String(msg.content || '') });
            }

     
            messages.push({ role: 'user', content: String(nextChat) });

            const model = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

            const resp = await groq.chat.completions.create({ model, messages });

            return extractTextFromGroq(resp) || `Sorry, I couldn't process that right now.`;
        } catch (err) {
            console.error('AI chat completion failed', err);
            return `Sorry, I couldn't process that right now.`;
        }
    }
}

function extractTextFromGroq(resp) {
    try {
        if (!resp) return '';
        if (resp?.choices && resp.choices.length > 0) {
            const choice = resp.choices[0];
            if (choice?.message?.content) {
                const content = choice.message.content;
                if (typeof content === 'string') return content;
                if (Array.isArray(content)) return content.join(' ');
                return String(content);
            }
            if (choice?.text) return String(choice.text);
            return JSON.stringify(choice);
        }
        if (resp?.output && resp.output.length > 0) {
            const out = resp.output[0];
            return typeof out === 'string' ? out : JSON.stringify(out);
        }
        return String(resp);
    } catch (e) {
        return '';
    }
}

export default new AiInteraction();
