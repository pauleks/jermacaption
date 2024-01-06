import { InteractionCallbackTypes } from './constants';
import fetch from 'node-fetch';

interface Interaction {
    id: string;
    token: string;
}

const commonHeaders: Record<string, string> = {
    'Authorization': `Bot ${process.env.BOTTOKEN}`,
    'User-Agent': 'DiscordBot/JermaCaptionBot'
};

const acknowledge = (interaction: Interaction): Promise<void> => {
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

const respond = (interaction: Interaction, data: any): Promise<void> => {
    return fetch(`https://discord.com/api/webhooks/${process.env.APPLICATIONID}/${interaction.token}/messages/@original`, {
        method: 'PATCH',
        body: data,
        headers: commonHeaders
    }).then(() => {});
};

export { acknowledge, respond };
