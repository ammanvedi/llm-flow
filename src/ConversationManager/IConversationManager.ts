import {IStateMachine} from "../StateMachine/IStateMachine";
import {IAgentPool} from "../AgentPool/IAgentPool";

export abstract class IConversationManager<
    MachineType,
    EventType,
    StateType,
    ContextType
> {
    constructor(
        protected readonly machine: IStateMachine<MachineType, EventType, StateType, ContextType>,
        protected readonly agentPool: IAgentPool<string>
    ) {
        this.machine.onTransition(this.onMachineTransition.bind(this))
    }

    public abstract onMachineTransition(state: StateType, context: ContextType): Promise<void>
}