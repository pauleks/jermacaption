import fs from 'fs';
import { createReadStream } from 'fs';
import { promisify } from 'util';
import { randomInt } from 'crypto';

const readdir = promisify(fs.readdir);
const readStream = promisify(createReadStream);

export const getGIFNames = async () => {
    try {
        const files = await readdir("./assets", { withFileTypes: true });
        return files
            .filter((file) => file.isFile() && file.name.endsWith('.gif'))
            .map((file) => file.name.slice(0, -4));
    } catch (error) {
        console.error("Error reading GIF names:", error);
        return [];
    }
};

export const getRandomFile = (allFiles) => {
    const randomIndex = randomInt(0, allFiles.length);
    return allFiles[randomIndex];
};

export const getBannedUsers = async () => {
    const bannedUsers = [];

    try {
        const stream = await readStream("./config/banned_users.txt", { encoding: "utf-8" });

        for await (const line of stream) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith("#")) {
                const userId = trimmedLine.split(/\s+/)[0];
                bannedUsers.push(userId);
            }
        }
    } catch (error) {
        console.error("Error reading banned users:", error);
    }

    return bannedUsers;
};
