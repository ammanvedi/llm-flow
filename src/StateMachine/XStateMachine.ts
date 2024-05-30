import {IStateMachine} from "./IStateMachine";
import {StateMachine, EventFromLogic, createActor, Actor, SnapshotFrom} from "xstate";
import {machine} from "../machine";

type AnyMachine = StateMachine<any, any, any, any, any, any, any, any, any, any, any>

export class XStateMachine<
    Machine extends AnyMachine,
    EventType extends EventFromLogic<Machine> = EventFromLogic<Machine>,
    StateType extends SnapshotFrom<AnyMachine>['value'] = SnapshotFrom<AnyMachine>['value'],
    ContextType = Machine['config']['context']
> implements IStateMachine<Machine, EventType, StateType, ContextType> {

    private readonly machine: Machine
    private readonly actor: Actor<Machine>

    constructor(machine: Machine) {
        this.machine = machine
        this.actor = createActor(this.machine)
    }

    getRequiredAgents(): string[] {
        return [];
    }

    send(event: EventType): void {
        this.actor.send(event)
    }

    onTransition(cb: (state: StateType, context: ContextType) => void): void {
        this.actor.subscribe((snapshot: SnapshotFrom<AnyMachine>) => {
            cb(snapshot.value, snapshot.context)
        })
        const initialSnapshot: SnapshotFrom<AnyMachine> = this.actor.getSnapshot()
        cb(initialSnapshot.value, initialSnapshot.context)
    }

    // todo allow null
    getAgentForState(stateName: StateType): string {
        const state = this.machine.states[stateName as string]
        // todo do this less shittily with a regex
        const agent = state.config.description?.split('\n')[0].split(':')[1]
        console.log(agent)
        return agent || '';
    }
}