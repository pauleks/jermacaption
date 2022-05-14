const CommandTypes = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3,
}

const CommandOptionTypes = {
    STRING: 3,
}

const InteractionTypes = {
    PING: 1,
    APPLICATION_COMMAND: 2,
    MESSAGE_COMPONENT: 3,
}

const InteractionCallbackTypes = {
    PONG: 1,
    RESPONSE: 4,
    ACKNOWLEDGE: 5,
}

module.exports = { CommandTypes, CommandOptionTypes, InteractionTypes, InteractionCallbackTypes };