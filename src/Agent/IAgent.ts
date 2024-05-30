import OpenAI from "openai";
import ChatCompletionTool = OpenAI.ChatCompletionTool;

export type Message =
    | {role: 'system', content: string}
    | {role: 'user', content: string}
    | {role: 'assistant', content: string}

export type Tool = ChatCompletionTool

export interface IAgent {
    addMessageToThread(message: Message): void
    getAgentResponse(tools: Tool[]): Promise<string>
    resetAgent(): Promise<void>
}