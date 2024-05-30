import {IAgent, Message, Tool} from "./IAgent";
import OpenAI from "openai";

export class GPTAgent implements IAgent {

    private thread: Message[] = [
        {
            role: 'system',
            content: this.baseSystemPrompt
        }
    ]

    constructor(
        private readonly baseSystemPrompt: string,
        private readonly openAI: OpenAI
    ) {
    }

    async getAgentResponse(tools: Tool[]) {
        const completion = await this.openAI.chat.completions.create({
            messages: this.thread,
            model: "gpt-4o",
            tools
        });

        return completion.choices[0].message.content || ''
    }

    async resetAgent() {
    }

    addMessageToThread(message: Message): void {
        this.thread.push(message)
    }
}