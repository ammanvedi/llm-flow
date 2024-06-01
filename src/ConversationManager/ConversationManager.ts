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

    async handleRequestAgentResponse(agent: IAgent | null): Promise<{message: string | null, agentName: string }> {

        if(!agent) {
            return {
                agentName: agent || 'unknown',
                message: null
            }
        }

        agent.updateInjectedSystemPrompt(
            this.conversation.summariseConversationForAgent()
        )

        const response = await agent.getAgentResponse(
            this.machine.getAvailableToolsForState(
                this.machine.getCurrentState()
            ),
            this.handleToolCalls.bind(this)
        )

        // todo - what if the user
        //
        return response.includes('__TERMINATE__') ? {
            agentName: agent.getName(),
            message: null
        } : {
            agentName: agent.getName(),
            message: response
        }
    }

    async handleToolCalls(calls: ChatCompletionMessageToolCall[]): Promise<ToolResponseMessage[]> {
        return Promise.all(calls.map(this.handleToolCall.bind(this)))
    }

    async handleToolCall(call: ChatCompletionMessageToolCall): Promise<ToolResponseMessage> {
        switch(call.function.name) {
            case 'updateContext':
                this.machine.updateContext(JSON.parse(call.function.arguments))
                return {
                    role: 'tool',
                    tool_call_id: call.id,
                    content: 'SUCCESS',
                }
            /**
             * TODO
             * Whenever we call this function it might cause some change in the state
             * machine and we should not take any more input from the user or any
             * agent until this state change has resolved itself
             *
             * The question is how to determine this, because it might not always
             * cause a state transition
             *
             * we will make the tool call and then ask for the AIs response to the tool call
             * statement. i think we should do this as long as one of the tools called is not
             * the done function?
             */
            case 'sendEvent':
                this.machine.send(JSON.parse(call.function.arguments))
                return {
                    role: 'tool',
                    tool_call_id: call.id,
                    content: 'SUCCESS',
                }
            case 'askAgent':
                // todo - find a better model for agent delegation
            /**
             * perhaps it looks something like the following
             * 1. get a delegation request
             * 2. users state in machine remains the same
             * 3. active agent becomes a stack
             * 4. push delegated agent onto the stack, make it the active agent
             * 5. give delegated agent a new type of system prompt "delegation prompt" which tells it its being delegated to
             * 6. also tell it the user query
             *      - tell it what they were doing before
             *      - tell it to call a function when it wants to yeild
             * 7. respond to current agent with success
             *  - will need to prevent the response somehow
             *  - tell it to respond with __DELEGATE__
             * 8.

             */
            // get the agent
                // const args = JSON.parse(call.function.arguments) as {agentName: string, query: string}
                // const agent = this.agentPool.getAgent(args.agentName)
                // agent?.addUserMessageToThread(args.query)
                // const result = await this.handleRequestAgentResponse(agent)
                // console.log(result)
                // return {
                //     role: 'tool',
                //     tool_call_id: call.id,
                //     content: 'Agent says: ' + result.message || '',
                // }
                //console.log('asking another agent', JSON.parse(call.function.arguments))

        }

        return {
            role: 'tool',
            tool_call_id: call.id,
            content: '',
        }
    }

    async handleRequestUserResponse(speaker:Speaker, thread:ConversationThread): Promise<{message: string | null, agentName: string }> {
        const agent = this.getActiveAgent()

        if(!agent) {
            return {
                message: null,
                agentName: 'user'
            }
        }

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });


        const response = await rl.question(``);

        rl.close()

        agent.addUserMessageToThread(response)

        return {
            agentName: 'user',
            message: response
        }
    }

    async handleRequestSpeakerResponse(speaker:Speaker, thread:ConversationThread): Promise<{message: string | null, agentName: string }> {
        switch(speaker) {
            case Speaker.User:
                return this.handleRequestUserResponse(speaker, thread)
            case Speaker.Agent:
                return this.handleRequestAgentResponse(this.getActiveAgent())
        }
    }

    async onMachineTransition(state: StateType, context: ContextType): Promise<void> {
        console.log('transition ::', state)
        this.changeActiveAgent(this.machine.getAgentForState(state))
    }

}