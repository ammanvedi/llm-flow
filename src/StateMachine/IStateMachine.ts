export interface IStateMachine<
    MachineType,
    EventType,
    StateType,
    ContextType
> {
    getRequiredAgents(): string[]
    send(event: EventType): void
    onTransition(cb: (state: StateType, context: ContextType) => void): void
}

