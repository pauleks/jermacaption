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
    const gifPath = joinPath(`assets/${gif}.gif`)

    await sh(
      `ffmpeg -i "${textPath}" -i "${gifPath}" -filter_complex "[0:v]scale=700:-1:flags=fast_bilinear[v0]; [1:v]scale=700:-1:flags=fast_bilinear[v1]; [v0][v1]vstack=inputs=2[v]" -map "[v]" "${joinPath(`_temp/${identifier}.gif`)}"`
    );
    await sh(
      `ffmpeg -i "${joinPath(`_temp/${identifier}.gif`)}" -vf "fps=15,scale=350:-1" -fs 7M -loop 0 "${joinPath(`_temp/${identifier}-optimized.gif`)}"`
    );

    const image = await fs.readFile(joinPath(`_temp/${identifier}-optimized.gif`));

    await fs.unlink(joinPath(`_temp/texts/${identifier}.png`))
    await fs.unlink(joinPath(`_temp/${identifier}.gif`))
    await fs.unlink(joinPath(`_temp/${identifier}-optimized.gif`))

    return image;
  } catch (err) {
    throw err;
  }
};
