import {MachineConfig, Values} from "xstate";

type StateConfigKey = 'description'
type FilterByStructure<T, U> = T extends U ? T : never;
type GetAgentNames<T> = T extends `agent:${infer A}\n${string}` ? A : never
type AgentFormat = `agent:${string}`
type StateAgentFormat = {description: AgentFormat}
type MachineStates<M extends MachineConfig<any, any>> = Values<M['states']>

export type GetRequiredAgentNames<M extends MachineConfig<any, any>> =
    GetAgentNames<FilterByStructure<MachineStates<M>, StateAgentFormat>[StateConfigKey]>
