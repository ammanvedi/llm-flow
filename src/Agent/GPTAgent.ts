import {HandleToolCalls, IAgent, Message, Tool} from "./IAgent";
import OpenAI from "openai";

export class GPTAgent implements IAgent {

    private thread: Message[] = [
        {
            role: 'system',
            content: this.baseSystemPrompt
        },
        {
            role: 'user',
            content: '__START__'
        }
    ]

    constructor(
        private readonly baseSystemPrompt: string,
        private readonly openAI: OpenAI
    ) {
    }

    async getAgentResponse(tools: Tool[], onToolCalls: HandleToolCalls): Promise<string> {

        const completion = await this.openAI.chat.completions.create({
            messages: this.thread,
            model: "gpt-4o",
            tools
        });

        const responseMessage = completion.choices[0].message

        this.addMessageToThread(responseMessage)

        if(responseMessage.tool_calls) {
            const toolCallResults = await onToolCalls(responseMessage.tool_calls)

            toolCallResults.forEach(this.addMessageToThread.bind(this))

            return this.getAgentResponse(tools, onToolCalls)
        }

        const response = responseMessage.content

        return response || ''
    }

    async resetAgent() {
        this.thread = []
    }

    addMessageToThread(message: Message): void {
        this.thread.push(message)
    }

    addAgentMessageToThread(message: string): void {
        this.thread.push({
            role: 'assistant',
            content: message
        })
    }

    addUserMessageToThread(message: string): void {
        this.thread.push({
            role: 'user',
            content: message
        })
    }
}