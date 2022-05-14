const { InteractionCallbackTypes } = require('./constants');

/**
 * Acknowledges an interaction and the user sees the loading state
 * @param {JSON} interaction Which interaction should be acknowledged
 */
const acknowledge = (interaction) => new Promise(async (resolve, reject) => {
    try {
        let body = JSON.stringify({ type: InteractionCallbackTypes.ACKNOWLEDGE });
        await fetch(`https://discord.com/api/interactions/${interaction.id}/${interaction.token}/callback`, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${process.env.BOTTOKEN}`,
                'User-Agent': 'DiscordBot/JermaCaptionBot',
                'Content-Length': body.length,
            },
        });
        resolve();
    } catch (err) {
        reject(err);
    }
});

/**
 * Responds to an interaction with a loading state
 * @param {JSON} interaction Which interaction should be responded to
 * @param {FormData} data The response object
 */
const respond = (interaction, data) => new Promise(async (resolve, reject) => {
    try {
        let result = await fetch(`https://discord.com/api/webhooks/${process.env.APPLICATIONID}/${interaction.token}/messages/@original`, {
            method: 'PATCH',
            body: data,
            headers: {
                Authorization: `Bot ${process.env.BOTTOKEN}`,
                'User-Agent': 'DiscordBot/JermaCaptionBot',
            },
        });
        resolve();
    } catch (err) {
        reject(err);
    }
});

module.exports = { acknowledge, respond };