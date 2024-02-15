import { exec } from "child_process";
import fs from 'fs/promises';
import * as path from 'path';

const sh = (command: string): Promise<{ stdout: string, stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

const joinPath = (...paths: string[]) => {
  return path.join(__dirname, '../', ...paths);
}

export const generateGIF = async (gif: string, identifier: string): Promise<Buffer> => {
  try {
    const textPath = joinPath(`_temp/texts/${identifier}.png`);
    const gifPath = joinPath(`assets/${gif}.gif`);
    const destinationPath = joinPath(`_temp/${identifier}.gif`);
    const palettePath = joinPath(`_temp/${identifier}-palette.png`);

    await sh(
      `ffmpeg -i "${textPath}" -i "${gifPath}" -filter_complex "[0:v]scale=700:-1[v0]; [1:v]scale=700:-1[v1]; [v0][v1]vstack=inputs=2,fps=15,palettegen[v]" -map "[v]" -y "${palettePath}"`
    )

    await sh(
      `ffmpeg -i "${textPath}" -i "${gifPath}" -i "${palettePath}" -filter_complex "[0:v]scale=700:-1[v0]; [1:v]scale=700:-1[v1]; [v0][v1]vstack=inputs=2,fps=15[v]; [v][2:v]paletteuse[v_optimized]" -map "[v_optimized]" -fs 15M -b:v 10M -loop 0 "${destinationPath}"`
    )

    const image = await fs.readFile(destinationPath);

    await fs.unlink(textPath);
    await fs.unlink(palettePath);
    await fs.unlink(destinationPath);

    return image;
  } catch (err) {
    throw err;
  }
};
