import {XStateMachine} from "./StateMachine/XStateMachine";
import {machine} from "./machine";
import OpenAI from "openai";
import 'dotenv/config'
import {AgentPool} from "./AgentPool/AgentPool";
import {GPTAgent} from "./Agent/GPTAgent";
import {ConversationManager} from "./ConversationManager/ConversationManager";
import {prompts} from "./Prompt/prompts";

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
})

const stateMachine = new XStateMachine(machine)
const agentPool = new AgentPool<
    /**
     * todo:
     * we can make this type safe with GetRequiredAgentNames but we need to
     * accept making the machine json with an as const and storing it separately so
     * we can do typeof machineJson and pass that to the helper
     */
    string
>(new Map([
    ['onboarding', new GPTAgent(prompts.onboardingAgent.baseSystemPrompt, openai)],
    ['triage', new GPTAgent(prompts.baseAgentPrompt, openai)],
    ['content_video', new GPTAgent(prompts.baseAgentPrompt, openai)],
    ['question_exercise', new GPTAgent(prompts.baseAgentPrompt, openai)],
    ['roleplay', new GPTAgent(prompts.baseAgentPrompt, openai)],
    ['summary', new GPTAgent(prompts.baseAgentPrompt, openai)],
]))


const conversation = new ConversationManager(
    stateMachine,
    agentPool
)