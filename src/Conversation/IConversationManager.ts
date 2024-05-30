import {IStateMachine} from "../StateMachine/IStateMachine";
import {IAgentPool} from "../AgentPool/IAgentPool";

export abstract class IConversationManager<
    MachineType,
    EventType,
    StateType,
    ContextType
> {
    constructor(
        private readonly machine: IStateMachine<MachineType, EventType, StateType, ContextType>,
        private readonly agentPool: IAgentPool
    ) {
        this.machine.onTransition(this.onMachineTransition)
    }

    public abstract onMachineTransition(state: StateType, context: ContextType): void
}