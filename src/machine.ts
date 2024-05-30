import { setup } from "xstate";

export const machine = setup({
    types: {
        context: {} as {
            hi: string
        },
        events: {} as
            | { type: "done" }
            | { type: "remind_wait" }
            | { type: "remind_trigger" }
            | { type: "done_module_leadership" }
            | { type: "done_module_productivity" }
            | { type: "done_module_work_life_balance" },
    },
}).createMachine({
    context: {
        hi: ''
    },
    id: "Root Machine",
    initial: "onboarding",
    states: {
        onboarding: {
            on: {
                done: {
                    target: "triage",
                },
                remind_wait: {
                    target: "remind_onboarding",
                },
            },
            description:
                "agent:onboarding\n\nprompt:This is the prompt given to the machine",
        },
        triage: {
            on: {
                done_module_productivity: {
                    target: "module_productivity_content_video",
                    description:
                        "This module helps people who want to improve\n\ntheir productivity, people who will benefit from\n\nthis module may mention \n\n- poor time management\n- being easily distracted\n- missing deadlines\n- always rushing",
                },
                done_module_leadership: {
                    target: "module_leadership_content_question_excercise",
                    description:
                        "This module helps people who want to grow their\n\nleadership skills, if someone is suited to this module \n\nthey may mentions things like\n\n- difficulty with strategic thinking\n- difficulty or lack of ability to delegate\n- difficulty planning use of resources to acheive a goal\n- difficulty communicating ideas",
                },
                done_module_work_life_balance: {
                    target: "module_work_life_balance_content_role_play",
                    description:
                        "This module helps people who want better tools\n\nfor dealing with work life balance, if someone is\n\nsuited to this module they may mention things like\n\n- struggling with switching off after work\n- frequently working overtime\n- always feeling tired or irritable\n- breakdown of personal relationships",
                },
                remind_wait: {
                    target: "remind_triage",
                },
            },
            description:
                "agent:triage\n\nprompt:This is the prompt given to the main",
        },
        remind_onboarding: {
            on: {
                remind_trigger: {
                    target: "onboarding",
                },
            },
        },
        module_productivity_content_video: {
            on: {
                done: {
                    target: "module_productivity_content_question_excercise",
                },
            },
            description: "agent:content_video\n\nprompt:",
        },
        module_leadership_content_question_excercise: {
            on: {
                done: {
                    target: "module_leadership_content_video",
                },
            },
            description: "agent:question_exercise\n\nprompt:",
        },
        module_work_life_balance_content_role_play: {
            on: {
                done: {
                    target: "module_work_life_balance_content_question_excercise",
                },
            },
            description: "agent:roleplay\n\nprompt:",
        },
        remind_triage: {
            on: {
                remind_trigger: {
                    target: "triage",
                },
            },
        },
        module_productivity_content_question_excercise: {
            on: {
                done: {
                    target: "module_productivity_summary",
                },
            },
            description: "agent:question_exercise\n\nprompt:",
        },
        module_leadership_content_video: {
            on: {
                done: {
                    target: "module_leadership_summary",
                },
            },
            description: "agent:content_video\n\nprompt:",
        },
        module_work_life_balance_content_question_excercise: {
            on: {
                done: {
                    target: "module_work_life_balance_summary",
                },
            },
            description: "agent:question_exercise\n\nprompt:",
        },
        module_productivity_summary: {
            on: {
                done: {
                    target: "triage",
                },
            },
            description: "agent:summary\n\nprompt:",
        },
        module_leadership_summary: {
            on: {
                done: {
                    target: "triage",
                },
            },
            description: "agent:summary\n\nprompt:",
        },
        module_work_life_balance_summary: {
            on: {
                done: {
                    target: "triage",
                },
            },
            description: "agent:question_summary\n\nprompt:",
        },
    },
});