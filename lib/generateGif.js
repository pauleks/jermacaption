const path = require('path');
const fs = require('fs/promises');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const imageSize = require('image-size');
const crypto = require('crypto');

const ImpactFont = fs.readFile(path.join(__dirname, 'fonts', 'Impact.ttf')).toString('base64');
const NotoFont = fs.readFile(path.join(__dirname, 'fonts', 'NotoColorEmoji.ttf')).toString('base64');

let _browser = null;

const getBrowser = async () => {
    if (_browser) return _browser;
    // Ubuntu fix
    _browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    return _browser;
}

const charactersMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
}

const sanitizeInput = (input) => {
    return input.replace(/[&<>"'\/]/g, (key) => charactersMap[key]);
}

const getHTML = (input, width) => {
    return `<html>
    <head>
        <style>
            @font-face {
                font-family: 'Impact';
                src: url('${ImpactFont}');
            }
    
            @font-face {
                font-family: 'Noto';
                src: url('${NotoFont}');
            }
    
            h1 {
                font-family: 'Noto', 'Impact', sans-serif;
                font-size: 32px;
                font-weight: normal;
                color: black;
                padding: 0;
            }

            div {
                margin: 8px;
            }
    
            html, body {
                text-align: center;
                width: ${width}px;
            }
        </style>
    </head>
    <body>
        <div><h1>${sanitizeInput(input)}</h1></div>
    </body>
    </html>`;
}

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
        const width = await imageSize(gif).width,
            html = getHTML(text, width),
            browser = await getBrowser(),
            page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.setViewport({ width, height: 10 });

        const elem = await page.$('div'),
            boundingBox = await elem.boxModel();
        await page.setViewport({ width, height: Math.round(boundingBox.height) + 16 });

        const screenshot = await page.screenshot();
        page.close();

        await fs.writeFile(path.join(__dirname, '../', '_temp', 'texts', `${identifier}.png`), screenshot);
        resolve(path.join(__dirname, '../', '_temp', 'texts', `${identifier}.png`));
    } catch (err) {
        reject(err);
    }
});

const generate = async (input, identifier) => new Promise(async (resolve, reject) => {
    try {
        let randomGifs = await fs.readdir(path.join(__dirname, 'gifs')),
            gif = path.join(__dirname, 'gifs', randomGifs[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 * randomGifs.length)]),
            text = await caption(input, identifier, gif);

        await sh(`ffmpeg -i ${text} -i ${gif} -filter_complex vstack=inputs=2 ${path.join(__dirname, '../', '_temp', `${identifier}.gif`)}`); // Generate an unoptimized gif
        await sh(`ffmpeg -i ${path.join(__dirname, '../', '_temp', `${identifier}.gif`)} -vf "fps=15,scale=350:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -fs 7M -loop 0 ${path.join(__dirname, '../', '_temp', `${identifier}-optimized.gif`)}`); // generate an optimized gif

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
