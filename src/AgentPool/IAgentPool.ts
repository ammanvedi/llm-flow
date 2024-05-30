import {IAgent} from "../Agent/IAgent";

export interface IAgentPool<AgentNames extends string> {
    getAgent(name: AgentNames): IAgent | null
}