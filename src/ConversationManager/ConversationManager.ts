import {IStateMachine} from "../StateMachine/IStateMachine";
import {IAgentPool} from "../AgentPool/IAgentPool";
import {Conversation, ConversationMessage, ConversationThread, Speaker} from "../Conversation/Conversation";
import {IAgent, ToolResponseMessage} from "../Agent/IAgent";
import OpenAI from "openai";
import ChatCompletionMessageToolCall = OpenAI.ChatCompletionMessageToolCall;
import * as readline from "node:readline/promises";

/**
 * todo how can we unify things a bit better
 * 1. store prompt in state machine
 */

export class ConversationManager<
    MachineType,
    EventType,
    StateType,
    ContextType
> {

    private activeAgent: string | null = null
    protected readonly conversation: Conversation

    constructor(
        private readonly machine: IStateMachine<MachineType, EventType, StateType, ContextType>,
        private readonly agentPool: IAgentPool<string>
    ) {
        this.machine.onTransition(this.onMachineTransition.bind(this))
        this.conversation = new Conversation(this.handleRequestSpeakerResponse.bind(this))
    }

    private changeActiveAgent(agentName: string) {
        this.activeAgent = agentName
    }

    private getActiveAgent(): IAgent | null {
        if(!this.activeAgent) {
            return null
        }

        const agent = this.agentPool.getAgent(this.activeAgent)

        if(!agent) {
            return null
        }

        return agent
    }

    async handleRequestAgentResponse(speaker:Speaker, thread:ConversationThread): Promise<string> {
        const agent = this.getActiveAgent()

        if(!agent) {
            return ''
        }

        return await agent.getAgentResponse(
            this.machine.getAvailableToolsForState(
                this.machine.getCurrentState()
            ),
            this.handleToolCalls.bind(this)
        )
    }

    async handleToolCalls(calls: ChatCompletionMessageToolCall[]): Promise<ToolResponseMessage[]> {
        return Promise.all(calls.map(this.handleToolCall.bind(this)))
    }

    async handleToolCall(call: ChatCompletionMessageToolCall): Promise<ToolResponseMessage> {
        console.log(call)
        switch(call.function.name) {
            case 'updateContext':
                this.machine.updateContext(JSON.parse(call.function.arguments))
                return {
                    role: 'tool',
                    tool_call_id: call.id,
                    content: 'SUCCESS',
                }
            case 'sendEvent':
                this.machine.send(JSON.parse(call.function.arguments))
                return {
                    role: 'tool',
                    tool_call_id: call.id,
                    content: 'SUCCESS',
                }

        }

        console.log('unmatched funtion call', call)

        return {
            role: 'tool',
            tool_call_id: call.id,
            content: '',
        }
    }

    async handleRequestUserResponse(speaker:Speaker, thread:ConversationThread): Promise<string> {
        const agent = this.getActiveAgent()

        if(!agent) {
            return ''
        }

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });


        const response = await rl.question(``);

        rl.close()

        agent.addUserMessageToThread(response)

        return response
    }

    async handleRequestSpeakerResponse(speaker:Speaker, thread:ConversationThread): Promise<string> {
        switch(speaker) {
            case Speaker.User:
                return this.handleRequestUserResponse(speaker, thread)
            case Speaker.Agent:
                return this.handleRequestAgentResponse(speaker, thread)
        }
    }

    async onMachineTransition(state: StateType, context: ContextType): Promise<void> {
        console.log('transitioned', state)
        this.changeActiveAgent(this.machine.getAgentForState(state))
    }

}