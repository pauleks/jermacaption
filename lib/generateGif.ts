import * as path from 'path';
import { promises as fs } from 'fs';
import * as puppeteer from 'puppeteer';
import { exec } from 'child_process';
import * as imageSize from 'image-size';
import * as crypto from 'crypto';

const DEFAULT_WIDTH = 800;

const ImpactFont = fs
  .readFile(path.join(__dirname, 'fonts', 'Impact.ttf'))
  .then((font) => font.toString('base64'));
const NotoFont = fs
  .readFile(path.join(__dirname, 'fonts', 'NotoColorEmoji.ttf'))
  .then((font) => font.toString('base64'));

let _browser: puppeteer.Browser | null = null;

const getBrowser = async (): Promise<puppeteer.Browser> => {
  if (_browser) return _browser;
  _browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  return _browser;
};

const charactersMap: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

const sanitizeInput = (input: string): string => {
  return input.replace(/[&<>"'\/]/g, (key) => charactersMap[key]);
};

const getHTML = async (input: string, width: number): Promise<string> => {
  const [impactFont, notoFont] = await Promise.all([ImpactFont, NotoFont]);
  return `<html>
    <head>
        <style>
            @font-face {
                font-family: 'Impact';
                src: url('data:font/truetype;base64,${impactFont}');
            }
    
            @font-face {
                font-family: 'Noto';
                src: url('data:font/truetype;base64,${notoFont}');
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
};

const sh = (command: string): Promise<{ stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });

const caption = async (
  text: string,
  identifier: string,
  gif: string
): Promise<string> => {
  try {
    const imgSize = imageSize.imageSize(gif);
    const width = imgSize ? imgSize.width || DEFAULT_WIDTH : DEFAULT_WIDTH;
    const html = await getHTML(text, width);
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.setViewport({ width, height: 10 });

    const elem = await page.$('div');
    const boundingBox = await elem?.boxModel();
    const actualHeight =
      boundingBox && boundingBox.height ? Math.round(boundingBox.height) : 0;
    await page.setViewport({ width, height: actualHeight + 16 });

    const screenshot = await page.screenshot();
    await page.close();

    const imagePath = path.join(
      __dirname,
      '../',
      '_temp',
      'texts',
      `${identifier}.png`
    );
    await fs.writeFile(imagePath, screenshot);

    return imagePath;
  } catch (err) {
    throw err;
  }
};

const generate = async (
  input: string,
  identifier: string
): Promise<Buffer> => {
  try {
    let randomGifs = await fs.readdir(path.join(__dirname, 'gifs'));
    let gif = path.join(
      __dirname,
      'gifs',
      randomGifs[Math.floor(crypto.randomInt(0, randomGifs.length))]
    );

    let text = await caption(input, identifier, gif);

    await sh(
      `ffmpeg -i ${text} -i ${gif} -filter_complex vstack=inputs=2 ${path.join(
        __dirname,
        '../',
        '_temp',
        `${identifier}.gif`
      )}`
    );
    await sh(
      `ffmpeg -i ${path.join(
        __dirname,
        '../',
        '_temp',
        `${identifier}.gif`
      )} -vf "fps=15,scale=350:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -fs 7M -loop 0 ${path.join(
        __dirname,
        '../',
        '_temp',
        `${identifier}-optimized.gif`
      )}`
    );

    const optimizedGifPath = path.join(
      __dirname,
      '../',
      '_temp',
      `${identifier}-optimized.gif`
    );
    const image = await fs.readFile(optimizedGifPath);

    await fs.unlink(path.join(__dirname, '../', '_temp', `${identifier}.gif`));
    await fs.unlink(path.join(__dirname, '../', '_temp', 'texts', `${identifier}.png`));
    await fs.unlink(path.join(__dirname, '../', '_temp', `${identifier}-optimized.gif`));

    return image;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export { generate };
