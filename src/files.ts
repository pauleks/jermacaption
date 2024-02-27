import fs from 'fs';
import { createReadStream } from 'fs';
import { promisify } from 'util';
import { randomInt } from 'crypto';

const readStream = promisify(fs.createReadStream);

export const getGIFNames = () => {
    return fs.readdirSync("./assets", { withFileTypes: true })
             .filter((el) => el.isFile())
             .map((val) => val.name.slice(0,-4));
}

export const getRandomFile = (allFiles: string[]) => {
    const randomIndex = randomInt(0, allFiles.length);
    return allFiles[randomIndex];
}

export const getBannedUsers = async () => {
    const bannedUsers = [];

    const stream = createReadStream("./config/banned_users.txt", { encoding: "utf-8" });

    for await (const line of stream) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
            const userId = trimmedLine.split(/\s+/)[0];
            bannedUsers.push(userId);
        }
    }

    return bannedUsers;
};
