
export enum Speaker {
    User = 'User',
    Agent = 'Agent'
}

export type ConversationMessage =
    | {role: Speaker.Agent, content: string}
    | {role: Speaker.User, content: string}

export type ConversationThread = ConversationMessage[]

type SpeakerRequestHandler = (speaker: Speaker, thread: ConversationThread) => Promise<string>

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

            _self.onRequestSpeakerResponse(_self.currentSpeaker, _self.thread).then(message => {
                _self.addMessageToThread({
                    role: _self.currentSpeaker,
                    content: message
                });

                _self.currentSpeaker = _self.getNextSpeaker()

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
}