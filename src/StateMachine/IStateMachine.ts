import {Tool} from "../Agent/IAgent";

export interface IStateMachine<
    MachineType,
    EventType,
    StateType,
    ContextType
> {
    getRequiredAgents(): string[]
    send(event: EventType): void
    onTransition(cb: (state: StateType, context: ContextType) => void): void
    getAgentForState(stateName: StateType): string
    getAvailableToolsForState(state: StateType): Tool[]
    getCurrentState(): StateType
    updateContext(params: {key: string, value: string}): void
}

