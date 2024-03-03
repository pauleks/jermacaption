import fs from 'fs/promises'; // Using fs.promises for async file operations
import { consola } from 'consola';
import Constants from './constants';
import { API, RESTPutAPIApplicationCommandsJSONBody } from '@discordjs/core';
import { SlashCommandBuilder, ContextMenuCommandBuilder } from '@discordjs/builders';

// Setup check
export const checkToken = async (DISCORD_API: API) => {
    if (!process.env.DISCORD_APPLICATION_PUBLIC_KEY ||
        !process.env.DISCORD_APPLICATION_ID ||
        !process.env.DISCORD_APPLICATION_BOT_TOKEN)
        throw new Error("Application configuration/environmental variables are not set correctly.");

    const user = await DISCORD_API.users.getCurrent();
    consola.info(`Hello! I am ${user.username}#${user.discriminator}!`);
};

export const checkSetup = async (DISCORD_API: API) => {
    try {
        await fs.access('./config/version.txt'); // Check if the file exists
        consola.info("Configuration version file found. If you want to redo the first time setup, delete config/version.txt.");
    } catch (err) {
        await initiateSetup(DISCORD_API);
    }
};

// Discord interactions
const initiateSetup = async (DISCORD_API: API) => {
    consola.info("Registering Discord interactions.");
    const hasCmds = await hasApplicationCommands(DISCORD_API);
    if (!hasCmds) {
        await registerInteractionCommands(DISCORD_API);
        await createConfigFiles();
    } else {
        let answer = await consola.prompt("Your bot already has interaction commands. Do you want to override them?", { type: "confirm" });
        if (answer) {
            await registerInteractionCommands(DISCORD_API);
            await createConfigFiles();
        } else {
            answer = await consola.prompt("Continue setup without registering commands?", { type: "confirm" });
            if (!answer) {
                throw new Error("You've quit the setup.");
            }
            await createConfigFiles();
        }
    }
};

const hasApplicationCommands = async (DISCORD_API: API) => {
    const result = await DISCORD_API.applicationCommands.getGlobalCommands(process.env.DISCORD_APPLICATION_ID as string);
    return result.length !== 0;
};

const registerInteractionCommands = async (DISCORD_API: API) => {
    const commands = [
        new SlashCommandBuilder()
            .setName('jerma')
            .setDescription('Make Jerma say something!')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('What should I say?')
                    .setRequired(true)
                    .setMaxLength(5000)
            )
            .addStringOption(option =>
                option.setName('gif')
                    .setDescription('Not feeling lucky? You can now choose a specific GIF to use.')
                    .setRequired(false)
                    .setAutocomplete(true)
            ),
        new ContextMenuCommandBuilder()
            .setName('Turn into GIF')
            .setType(3) // Text message
    ];

    consola.info("Pushing new commands to Discord.");
    await DISCORD_API.applicationCommands.bulkOverwriteGlobalCommands(process.env.DISCORD_APPLICATION_ID as string, commands as RESTPutAPIApplicationCommandsJSONBody);
    consola.success("Done!");
};

// Config files

const createConfigFiles = async () => {
    consola.info("Creating configuration files.");
    await fs.writeFile('./config/banned_users.txt', Constants.CONFIG_BANNED_USERS_FILE_INTRO);
    await fs.mkdir('./_temp', { recursive: true });
    await fs.mkdir('./_temp/texts', { recursive: true });
    await fs.writeFile('./config/version.txt', Constants.CONFIG_CURRENT_CONFIG_VERSION);
    consola.success("Done!");
};
