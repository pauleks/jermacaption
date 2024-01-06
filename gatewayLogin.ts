const Discord = require('discord.js');
const { generate } = require('./lib/generateGif');

const client = new Discord.Client({ intents: [] });
require('dotenv').config();

client.on('interactionCreate', async (interaction) => {
    try {
        const text = interaction.options.getString('text', true);

        if (text.length > 10000) {
            return interaction.reply(':warning: The text cannot be longer than 10000 characters!');
        }

        await interaction.deferReply();

        let attachment;
        try {
            attachment = await generate(text, `${interaction.id}-${interaction.member.user.id}`);
            interaction.editReply({ files: [{ attachment, name: 'jerma.gif' }] });
        } catch (err) {
            console.error(`Error generating GIF: ${err}`);
            return interaction.editReply(':sweat_smile: Sorry! Something went wrong while generating the GIF. Please try again later.');
        }
    } catch (err) {
        console.error(`Error processing interaction: ${err}`);
        return interaction.reply(':sweat_smile: Sorry! Something went wrong. Please try again later.');
    }
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.login(process.env.BOTTOKEN);
