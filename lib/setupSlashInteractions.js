const https = require('https');
const { CommandTypes, CommandOptionTypes } = require('./constants');
require('dotenv').config();

if (!process.env.APPLICATIONID || !process.env.BOTTOKEN) {
  console.error('Hi! Check the README.md file again and see what tokens you need to provide, because I can\'t find them D:');
  process.exit(1);
}

const data = new TextEncoder().encode(
  JSON.stringify([
    {
      name: 'jerma',
      type: CommandTypes.CHAT_INPUT,
      description: 'Caption your text!',
      options: [
        {
          type: CommandOptionTypes.STRING,
          name: 'text',
          description: 'What should I caption?',
          required: true,
        }
      ],  // TODO: Add choices for specific gifs and context menu selections
    }
  ]),
);

const options = {
  hostname: 'discord.com',
  path: `/api/v10/applications/${process.env.APPLICATIONID}/commands`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    Authorization: `Bot ${process.env.BOTTOKEN}`,
  },
};

const req = https.request(options, (res) => {
  if (res.statusCode === 200) return console.log('Commands were successfully registered! 🎉');

  res.on('data', (d) => console.error(`Something went wrong\n${res.statusCode} - ${d}`));
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
