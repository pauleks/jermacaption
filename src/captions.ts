import { Canvas } from "canvas";
const { createCanvas, registerFont } = require("canvas");
const {
  fillTextWithTwemoji,
  measureText,
} = require("node-canvas-with-twemoji-and-discord-emoji");

registerFont("./assets/fonts/Impact.ttf", { family: "Impact" });
registerFont("./assets/fonts/Arial.ttf", { family: "Arial" });

async function wrapText(
  context: Canvas,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  let words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let metrics = await measureText(context, testLine);
    let testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      await fillTextWithTwemoji(context, line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  await fillTextWithTwemoji(context, line, x, y);
  y += lineHeight;
  return y;
}

export async function generateImage(customText: string, id: string) {
  // Create a new canvas
  const canvas = createCanvas(800, 100); // Set the canvas size according to your requirement
  const ctx = canvas.getContext("2d");

  // Set text properties
  ctx.font = '80px Impact, Arial'; // Change the font size and style as needed
  ctx.fillStyle = "black"; // Change the text color as needed
  ctx.textAlign = "center"; // Center the text horizontally
  ctx.textBaseline = "top";

  // Wrap the text to new lines if width exceeds 600px
  const maxWidth = 700;
  const x = canvas.width / 2; // Calculate x-coordinate for centering horizontally
  const y = 10;
  const lineHeight = 90;

  canvas.height = 20 + await wrapText(ctx, customText, x, y, maxWidth, lineHeight);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Set text properties
  ctx.font = '80px Impact, Arial'; // Change the font size and style as needed
  ctx.fillStyle = "black"; // Change the text color as needed
  ctx.textAlign = "center"; // Center the text horizontally
  ctx.textBaseline = "top";
  await wrapText(ctx, customText, x, y, maxWidth, lineHeight);

  // To save the canvas as an image file
  const fs = require("fs");
  const out = fs.createWriteStream(`./_temp/texts/${id}.png`); // Specify the path and filename for the output image
  const stream = canvas.createPNGStream();
  stream.pipe(out);
}
