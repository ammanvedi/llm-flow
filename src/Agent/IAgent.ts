import OpenAI from "openai";
import ChatCompletionTool = OpenAI.ChatCompletionTool;
import {Chat} from "openai/resources";
import ChatCompletionMessageToolCall = Chat.ChatCompletionMessageToolCall;
import {ChatCompletionToolMessageParam} from "openai/src/resources/chat/completions";

export type ToolResponseMessage = ChatCompletionToolMessageParam

export type Message =
    | {role: 'system', content: string}
    | {role: 'user', content: string}
    | {role: 'assistant', content: string | null}
    | ToolResponseMessage

export type Tool = ChatCompletionTool

export type HandleToolCalls = (calls: ChatCompletionMessageToolCall[]) => Promise<ToolResponseMessage[]>

export interface IAgent {
    addMessageToThread(message: Message): void
    addAgentMessageToThread(message: string): void
    addUserMessageToThread(message: string): void
    getAgentResponse(tools: Tool[], onToolCalls: HandleToolCalls ): Promise<string>
    resetAgent(): Promise<void>
}