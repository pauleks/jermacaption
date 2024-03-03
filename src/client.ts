import consola from "consola";
import {
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  MessageContextMenuInteraction,
} from "discord.js";
import { getBannedUsers, getGIFNames, getRandomFile } from "./files";
import Constants from "./constants";
import { generateImage } from "./captions";
import { generateGIF } from "./ffmpeg";

const currentGIFs = getGIFNames();
let bannedUsers: string[] = [];

type QueueItem = {
  interaction: CommandInteraction | MessageContextMenuInteraction;
  text: string;
  gif: string;
};

const gifQueue: QueueItem[] = [];
let isProcessingGif = false;

export const launchBot = () => {
  try {
    consola.info("Logging in...");

    const client = new Client({
      intents: ["GUILD_MESSAGES", "MESSAGE_CONTENT"],
    });

    client.on("interactionCreate", async (interaction) => {
      if (bannedUsers.includes(interaction.user.id)) {
        if (interaction.isAutocomplete()) return interaction.respond([]);
        if (
          interaction.isMessageContextMenu() ||
          interaction.isApplicationCommand()
        ) {
          return interaction.reply({
            content: Constants.BANNED_USER_MESSAGE,
            ephemeral: true,
          });
        }
      }

      if (interaction.isAutocomplete()) {
        handleAutocomplete(interaction);
      }

      if (interaction.isMessageContextMenu()) {
        if (interaction.targetMessage.content == "")
          return interaction.reply({
            content: ":x: The message must have text.",
            ephemeral: true,
          });
        await interaction.deferReply();
        handleNewGIF(interaction, interaction.targetMessage.content);
      }

      if (interaction.isCommand()) {
        await interaction.deferReply();
        handleNewGIF(
          interaction,
          interaction.options.getString("text") as string,
          interaction.options.getString("gif") as string
        );
      }
    });

    client.once("ready", () => {
      consola.success("The bot is now working!");

      bannedUsers = getBannedUsers();
      setInterval(() => {
        bannedUsers = getBannedUsers();
      }, 1000 * 60 * 5);
    });

    client.login(process.env.DISCORD_APPLICATION_BOT_TOKEN);
  } catch (e) {
    consola.error(e);
  }
};

const returnGIFQuery = (searchQuery: string) => {
  return currentGIFs
    .filter((result) =>
      result.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 25);
}

const handleAutocomplete = async (interaction: AutocompleteInteraction) => {
  const searchPhrase = interaction.options.get("gif")?.value as string;
  if (searchPhrase == "")
    return interaction.respond(
      currentGIFs
        .map((result) => ({ name: result, value: result }))
        .slice(0, 25)
    );

  const matchingResults = returnGIFQuery(searchPhrase);

  return interaction.respond(
    matchingResults.map((result) => ({ name: result, value: result }))
  );
};

async function handleNewGIF(
  interaction: CommandInteraction | MessageContextMenuInteraction,
  text: string,
  gif?: string
): Promise<void> {
  if (gif && returnGIFQuery(gif).length == 1) {
    await handleNewGIFWithGif(interaction, text, returnGIFQuery(gif)[0]);
  } else {
    await handleNewGIFWithRandomGif(interaction, text);
  }
}

async function handleNewGIFWithGif(
  interaction: CommandInteraction | MessageContextMenuInteraction,
  text: string,
  gif: string
): Promise<void> {
  if (isProcessingGif) {
    gifQueue.push({ interaction, text, gif });
  } else {
    isProcessingGif = true;
    await processGif(interaction, text, gif);
  }
}

async function handleNewGIFWithRandomGif(
  interaction: CommandInteraction | MessageContextMenuInteraction,
  text: string
): Promise<void> {
  const randomGif = getRandomFile(currentGIFs);
  await handleNewGIFWithGif(interaction, text, randomGif);
}

const processGif = async (
  interaction: CommandInteraction | MessageContextMenuInteraction,
  text: string,
  gif: string
) => {
  consola.log(`${interaction.user.id}: ${text}`);
  try {
    await generateImage(text, `${interaction.user.id}-${interaction.id}`);
    const attachment = await generateGIF(gif, `${interaction.user.id}-${interaction.id}`);
    await interaction.editReply({ files: [{ attachment, name: 'jerma.gif' }] });
  } catch (e) {
    consola.error(e);
    await interaction.editReply({ content: ":sweat: Sorry! Something went wrong... Try again later!" });
  }

  const nextTask = gifQueue.shift();
  if (nextTask) {
    isProcessingGif = false;
    handleNewGIFWithGif(
      nextTask.interaction,
      nextTask.text,
      nextTask.gif
    );
  } else {
    isProcessingGif = false;
  }
};
