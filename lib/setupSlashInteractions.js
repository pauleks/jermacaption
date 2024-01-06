const fetch = require('node-fetch');
const { CommandTypes, CommandOptionTypes } = require('./constants');
require('dotenv').config();

if (!process.env.APPLICATIONID || !process.env.BOTTOKEN) {
  console.error('Hi! Check the README.md file again and see what tokens you need to provide, because I can\'t find them D:');
  process.exit(1);
}

const body = JSON.stringify([
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
]);

const url = `https://discord.com/api/v10/applications/${process.env.APPLICATIONID}/commands`;

fetch(url, {
  method: 'PUT',
  body,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bot ${process.env.BOTTOKEN}`,
  },
})
  .then(response => {
    if (response.ok) {
      console.log('Commands were successfully registered! 🎉');
    } else {
      response.text().then(errorMsg => {
        console.error(`Something went wrong\n${response.status} - ${errorMsg}`);
      });
    }
  })
  .catch(error => {
    console.error(error);
  });
