import {HandleToolCalls, IAgent, InjectedSystemPrompt, Message, Tool} from "./IAgent";
import OpenAI from "openai";

export class GPTAgent implements IAgent {

    private readonly injectedSystemPrompt: InjectedSystemPrompt = {
        role: 'system_injected',
        content: ''
    }

    private thread: Message[] = [
        {
            role: 'system',
            content: this.baseSystemPrompt
        },
        this.injectedSystemPrompt,
        {
            role: 'user',
            content: '__START__'
        }
    ]

    constructor(
        private readonly baseSystemPrompt: string,
        private readonly openAI: OpenAI,
        private readonly name: string
    ) {
    }

    async getAgentResponse(tools: Tool[], onToolCalls: HandleToolCalls): Promise<string> {

        const completion = await this.openAI.chat.completions.create({
            messages: this.thread.map(msg => {
                if(msg.role === 'system_injected') {
                    return {
                        role: 'system',
                        content: msg.content
                    }
                }

                return msg
            }),
            model: "gpt-4o",
            tools
        });

        const responseMessage = completion.choices[0].message

        this.addMessageToThread(responseMessage)

        if(responseMessage.tool_calls) {
            const toolCallResults = await onToolCalls(responseMessage.tool_calls)

            toolCallResults.forEach(this.addMessageToThread.bind(this))

            /**
             * only do this if we aren't going to call the done function
             * this can be determined by return type of tool call results
             * which could prevent this behaviour
             */
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

    updateInjectedSystemPrompt(message: string): void {
        this.injectedSystemPrompt.content = message
    }

    getName(): string {
        return this.name;
    }
}