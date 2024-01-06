const { InteractionCallbackTypes } = require('./constants');
const fetch = require('node-fetch');

const commonHeaders = {
    'Authorization': `Bot ${process.env.BOTTOKEN}`,
    'User-Agent': 'DiscordBot/JermaCaptionBot'
};

const acknowledge = (interaction) => {
    const body = { type: InteractionCallbackTypes.ACKNOWLEDGE };

    return fetch(`https://discord.com/api/interactions/${interaction.id}/${interaction.token}/callback`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            ...commonHeaders,
            'Content-Type': 'application/json'
        }
    }).then(() => {});
};

const respond = (interaction, data) => {
    return fetch(`https://discord.com/api/webhooks/${process.env.APPLICATIONID}/${interaction.token}/messages/@original`, {
        method: 'PATCH',
        body: data,
        headers: commonHeaders
    }).then(() => {});
};

module.exports = { acknowledge, respond };
