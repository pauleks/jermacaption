const path = require('path');
const fs = require('fs/promises');
const jimp = require('jimp');
const { exec } = require('child_process');

const sh = async (command) => new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            reject(err);
        } else {
            resolve({ stdout, stderr });
        }
    });
});

const caption = (text, identifier, gif) => new Promise(async (resolve, reject) => {
    try {
        const font = await jimp.loadFont(path.join(__dirname, 'fonts', 'Impact.fnt')),
            loadedGif = await jimp.read(gif),
            width = loadedGif.bitmap.width,
            height = jimp.measureTextHeight(font, text, width) + 32,
            image = new jimp(width, height, '#FFFFFF');

        image.print(
            font,
            0, 0, {
            text,
            alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
        },
            width, height,
        )

        await image.writeAsync(path.join(__dirname, '../', '_temp', 'texts', `${identifier}.png`));
        resolve(path.join(__dirname, '../', '_temp', 'texts', `${identifier}.png`));
    } catch {
        reject();
    }
});

const generate = async (input, identifier) => new Promise(async (resolve, reject) => {
    try {
        let randomGifs = await fs.readdir(path.join(__dirname, 'gifs')),
            gif = path.join(__dirname, 'gifs', randomGifs[Math.floor(Math.random() * randomGifs.length)]),
            text = await caption(input, identifier, gif);

        await sh(`ffmpeg -i ${text} -i ${gif} -filter_complex vstack=inputs=2 ${path.join(__dirname, '../', '_temp', `${identifier}.gif`)}`); // Generate an unoptimized gif
        await sh(`ffmpeg -i ${path.join(__dirname, '../', '_temp', `${identifier}.gif`)} -vf "fps=15,scale=350:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${path.join(__dirname, '../', '_temp', `${identifier}-optimized.gif`)}`); // generate an optimized gif

        let image = await fs.readFile(path.join(__dirname, '../', '_temp', `${identifier}-optimized.gif`));
        resolve(image);

        fs.unlink(path.join(__dirname, '../', '_temp', `${identifier}.gif`));
        fs.unlink(path.join(__dirname, '../', '_temp', 'texts', `${identifier}.png`));
        fs.unlink(path.join(__dirname, '../', '_temp', `${identifier}-optimized.gif`));
    } catch (err) {
        console.error(err);
        reject(err);
    }
});

module.exports = { generate };