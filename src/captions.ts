import { Canvas } from "canvas";
const { createCanvas, registerFont } = require("canvas");
const {
  fillTextWithTwemoji,
  measureText,
} = require("node-canvas-with-twemoji-and-discord-emoji");

registerFont("./assets/fonts/Impact.ttf", { family: "Impact" });
registerFont("./assets/fonts/Arial.ttf", { family: "Arial" });

async function wrapText(
  context,
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {
  let words = text.split(" ");
  let line = "";
  let wrappedLines = [];

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let metrics = await measureText(context, testLine);
    let testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      wrappedLines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  wrappedLines.push(line);
  
  for (let wrappedLine of wrappedLines) {
    await fillTextWithTwemoji(context, wrappedLine.trim(), x, y);
    y += lineHeight;
  }
}

export async function generateImage(customText, id) {
  // Create a new canvas
  const canvas = createCanvas(800, 100); // Set the canvas size according to your requirement
  const ctx = canvas.getContext("2d");

  // Set text properties
  ctx.font = '80px Impact, Arial'; // Change the font size and style as needed
  ctx.fillStyle = "black"; // Change the text color as needed
  ctx.textAlign = "center"; // Center the text horizontally
  ctx.textBaseline = "top";

  // Wrap the text to new lines if width exceeds 700px
  const maxWidth = 700;
  const x = canvas.width / 2; // Calculate x-coordinate for centering horizontally
  const y = 10;
  const lineHeight = 90;

  await wrapText(ctx, customText, x, y, maxWidth, lineHeight);

  // To save the canvas as an image buffer
  return canvas.toBuffer('image/png');
}
