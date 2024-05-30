import {IAgentPool} from "./IAgentPool";
import {IAgent} from "../Agent/IAgent";

export class AgentPool<AgentNames extends string> implements IAgentPool<AgentNames> {
    constructor (private readonly pool: Map<AgentNames, IAgent>) {}

    getAgent(name: AgentNames): IAgent | null {
        return this.pool.get(name) || null;
    }

}