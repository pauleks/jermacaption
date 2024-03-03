import { spawn } from "child_process";
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { resolve } from 'path';

const sh = (command, args) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', data => {
      stdout += data;
    });

    process.stderr.on('data', data => {
      stderr += data;
    });

    process.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    process.on('error', err => {
      reject(err);
    });
  });
};

const joinPath = (...paths) => {
  return resolve(__dirname, '../', ...paths);
};

export const generateGIF = async (gif, identifier) => {
  try {
    const textPath = joinPath(`_temp/texts/${identifier}.png`);
    const gifPath = joinPath(`assets/${gif}.gif`);
    const palettePath = joinPath(`_temp/${identifier}-palette.png`);

    await sh('ffmpeg', [
      '-i', textPath,
      '-i', gifPath,
      '-filter_complex', `[0:v]scale=700:-1[v0]; [1:v]scale=700:-1[v1]; [v0][v1]vstack=inputs=2,fps=15,palettegen[v]`,
      '-map', '[v]',
      '-y', palettePath
    ]);

    const destinationPath = joinPath(`_temp/${identifier}.gif`);

    await sh('ffmpeg', [
      '-i', textPath,
      '-i', gifPath,
      '-i', palettePath,
      '-filter_complex', `[0:v]scale=700:-1[v0]; [1:v]scale=700:-1[v1]; [v0][v1]vstack=inputs=2,fps=15[v]; [v][2:v]paletteuse[v_optimized]`,
      '-map', '[v_optimized]',
      '-fs', '15M',
      '-b:v', '10M',
      '-loop', '0',
      destinationPath
    ]);

    const image = await fs.readFile(destinationPath);

    return image;
  } catch (err) {
    throw err;
  }
};
