
export enum Speaker {
    User = 'User',
    Agent = 'Agent'
}

export type ConversationMessage =
    | {role: Speaker.Agent, agentName: string, content: string}
    | {role: Speaker.User, content: string}

export type ConversationThread = ConversationMessage[]

type SpeakerRequestHandler = (speaker: Speaker, thread: ConversationThread) => Promise<{message: string | null, agentName: string }>

/**
 * Models a conversation between one agent (which may be made up of multiple aggregates in implementation)
 * and a single user.
 */
export class Conversation {
    private readonly thread: ConversationThread = []
    private currentSpeaker: Speaker = Speaker.Agent

    private readonly onRequestSpeakerResponse: SpeakerRequestHandler

    constructor(
        onRequestSpeakerResponse: SpeakerRequestHandler
    ) {
        setTimeout(this.advanceConversation.bind(this), 0)
        this.onRequestSpeakerResponse = onRequestSpeakerResponse
    }

    advanceConversation() {
        const _self = this

        setTimeout(() => {
            _self.onRequestSpeakerResponse(_self.currentSpeaker, _self.thread).then(({message, agentName}) => {
                if(message) {
                    _self.addMessageToThread(_self.currentSpeaker === Speaker.User ? {
                        role: _self.currentSpeaker,
                        content: message
                    } : {
                        role: _self.currentSpeaker,
                        agentName,
                        content: message
                    });

                    _self.currentSpeaker = _self.getNextSpeaker()
                }

                _self.advanceConversation()
            })

        }, 0)

    }

    addMessageToThread(message: ConversationMessage) {
        console.log(`${message.role} :: ${message.content}`)
        this.thread.push(message)
    }

    private getNextSpeaker(): Speaker {
        return this.currentSpeaker === Speaker.User ? Speaker.Agent : Speaker.User
    }

    summariseConversationForAgent(): string {
        // todo move to prompts
        return `
            To help you with your task here is the conversation so far
            between the user and the system that you are part of
            
            in this conversation entries marked with "agent (<NAME>)" come from the system
            
            NAME tells you which agent gave this response which might be helpful
            when determining which other agent to ask when you need help.
            
            ${this.thread.map(msg => {
                const speaker = msg.role === Speaker.User ? 'user' : `agent ${msg.agentName}`
                return `${speaker} : ${msg.content}`
            }).join('\n')}
        `
    }
}