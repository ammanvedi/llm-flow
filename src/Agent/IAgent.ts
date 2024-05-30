type Message =
    | {role: 'system', message: string}
    | {role: 'user', message: string}
    | {role: 'assistant', message: string}

export interface IAgent {
    getAgentResponse(thread: Message[]): void
    resetAgent(): void
}