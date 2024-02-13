import fs from 'fs';

export const getGIFNames = () => {
    return fs.readdirSync("./assets", { withFileTypes: true }).filter((el) => el.isFile()).map((val) => val.name.slice(0,-4));
}

export const getRandomFile = (allFiles: string[]) => {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomIndex = randomArray[0] % allFiles.length;
    return allFiles[randomIndex];
}

export const getBannedUsers = () => {
    let banList = fs.readFileSync("./config/banned_users.txt").toString();
    const newBanlist = [];
    return banList
        .split("\n")
        .filter((el) => !el.startsWith("#"))
        .map((el) => el.split(" ")[0]);
}