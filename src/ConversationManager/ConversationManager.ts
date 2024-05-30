import {IConversationManager} from "./IConversationManager";
import {IStateMachine} from "../StateMachine/IStateMachine";
import {IAgentPool} from "../AgentPool/IAgentPool";

/**
 * todo how can we unify things a bit better
 * 1. store prompt in state machine
 */

export class ConversationManager<
    MachineType,
    EventType,
    StateType,
    ContextType
> extends IConversationManager<
    MachineType,
    EventType,
    StateType,
    ContextType
> {

    private activeAgent: string | null = null

    constructor(
        machine: IStateMachine<MachineType, EventType, StateType, ContextType>,
        agentPool: IAgentPool<string>
    ) {
        super(machine, agentPool)
    }

    private changeActiveAgent(agentName: string) {
        this.activeAgent = agentName
    }

    async onMachineTransition(state: StateType, context: ContextType): Promise<void> {
        console.log('ontransition', state, context)
        this.changeActiveAgent(this.machine.getAgentForState(state))

        if(!this.activeAgent) {
            return
        }

        const agent = this.agentPool.getAgent(this.activeAgent)

        if(!agent) {
            return
        }

        //todo check if this has been started already
        // todo store start in constant
        agent.addMessageToThread({
            role: 'user',
            content: '__START__'
        })

        const response = await agent.getAgentResponse([{
            type: 'function',
            function: {
                description: 'this is a fuction',
                name: 'myfunc'
            }
        }])

        console.log(response)
    }

}