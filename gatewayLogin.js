const Discord = require('discord.js');
const { generate } = require('./lib/generateGif');

const client = new Discord.Client({ intents: [] });

require('dotenv').config();

client.on('interactionCreate', async (interaction) => {
    const text = interaction.options.getString('text', true);
    await interaction.deferReply();

    try {
        if (text.length > 2000) {
            return interaction.editReply(':warning: The text cannot be longer than 2000 characters!');
        }

        try {
            let attachment = await generate(text, `${interaction.id}-${interaction.member.user.id}`);
            interaction.editReply({ files: [{ attachment, name: 'jerma.gif' }] });
        } catch (err) {
            console.error(err);
            return interaction.editReply(':sweat_smile: Sorry! Something went wrong. Try again later.');
        }
    } catch (err) {
        console.error(err);
        return interaction.editReply(':sweat_smile: Sorry! Something went wrong. Try again later.');
    }
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.login(process.env.BOTTOKEN);