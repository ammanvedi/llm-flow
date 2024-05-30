import {IAgentPool} from "./IAgentPool";
import {IAgent} from "../Agent/IAgent";

export class AgentPool implements IAgentPool {
    constructor (private readonly pool: Map<string, IAgent>) {}

    getAgent(name: string): IAgent | null {
        return this.pool.get(name) || null;
    }

}