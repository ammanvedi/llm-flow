import {IAgent} from "../Agent/IAgent";

export interface IAgentPool {
    getAgent(name: string): IAgent | null
}