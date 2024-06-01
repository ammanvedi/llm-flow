import {IStateMachine} from "./IStateMachine";
import {StateMachine, EventFromLogic, createActor, Actor, SnapshotFrom, interpret} from "xstate";
import {machine} from "../machine";
import {Tool} from "../Agent/IAgent";

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
        console.log('sending', event)
        this.actor.send(event)
    }

    onTransition(cb: (state: StateType, context: ContextType) => void): void {
        this.actor.subscribe((snapshot: SnapshotFrom<AnyMachine>) => {
            cb(snapshot.value, snapshot.context)
        })
        const initialSnapshot: SnapshotFrom<AnyMachine> = this.actor.getSnapshot()
        cb(initialSnapshot.value, initialSnapshot.context)
    }

    // todo allow nulls
    getAgentForState(stateName: StateType): string {
        const state = this.machine.states[stateName as string]
        // todo do this less shittily with a regex
        const agent = state.config.description?.split('\n')[0].split(':')[1]
        return agent || '';
    }

    getCurrentState(): StateType {
        const snapshot: SnapshotFrom<AnyMachine> = this.actor.getSnapshot()
        return snapshot.value
    }

    getAvailableToolsForState(state: StateType): Tool[] {
        return [
            {
                type: 'function',
                function: {
                    name: 'sendEvent',
                    parameters: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string'
                            }
                        },
                        required: ["type"],
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'updateContext',
                    parameters: {
                        type: 'object',
                        properties: {
                            key: {
                                type: 'string'
                            },
                            value: {
                                type: 'string'
                            }
                        },
                        required: ["key", "value"],
                    }
                }
            }
        ]
    }

    updateContext(params: { key: string; value: string }): void {
        // todo implement this via an event?
        console.log('updating context', params)
    }

}