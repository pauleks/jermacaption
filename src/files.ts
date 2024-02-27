import fs from 'fs';
import crypto from 'crypto';

export const getGIFNames = () => {
    const files = fs.readdirSync("./assets", { withFileTypes: true });
    return files
        .filter((el) => el.isFile() && el.name.endsWith('.gif'))
        .map((val) => val.name.slice(0, -4));
}

export const getRandomFile = (allFiles: string[]) => {
    const randomIndex = crypto.randomInt(0, allFiles.length);
    return allFiles[randomIndex];
}

export const getBannedUsers = () => {
    const banList = fs.readFileSync("./config/banned_users.txt", "utf-8");
    const lines = banList.split("\n");
    const bannedUsers = lines
        .filter((el) => !el.startsWith("#") && el.trim().length > 0)
        .map((el) => el.split(/\s+/)[0]);
    return bannedUsers;
}
