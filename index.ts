const fastify = require('fastify')();
const { verifyRequest } = require('./lib/verifyInteraction');
const { InteractionTypes, InteractionCallbackTypes } = require('./lib/constants');
const { acknowledge, respond } = require('./lib/handleInteractions');
const { generate } = require('./lib/generateGif');
const filter = require('leo-profanity');

require('dotenv').config();

fastify.register(require('@fastify/helmet'));

fastify.decorateRequest('acknowledge', async function () {
    try {
        await acknowledge(this.body);
    } catch (err) {
        console.error(err);
    }
});

fastify.decorateRequest('respond', async function (response: any) {
    try {
        await respond(this.body, response);
    } catch (err) {
        console.error(err);
    }
});

fastify.get('/', async (req: any, res: any) => {
    res.send(`Hi! This website operates as the host for Caption It Jerma! bot. If you somehow found this - congrats.\nAnyways, you can add the bot from here: ${process.env.LANDINGPAGE}`);
});

fastify.post('/interactions', async (req: any, res: any) => {
    if (!req.headers['x-signature-ed25519'] || !req.headers['x-signature-timestamp']) return res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    if (!await verifyRequest(req)) return res.status(401).send('');

    try {
        if (req.body.type == InteractionTypes.PING) return res.status(200).send({ type: InteractionCallbackTypes.PONG });
        await req.acknowledge();

        res.status(200).send('');

        if (req.body.data.length > 2000) {
            let formData = new FormData();
            formData.append('content', ":warning: The text cannot be longer than 2000 characters!");
            return req.respond(formData);
        }

        let text = req.body.data.options[0].value; //filter.clean(req.body.data.options[0].value); let's hope that people won't abuse this pls pls pls pls pls

        try {
            let file = await generate(text, `${req.body.id}-${req.body.member.user.id}`), formData = new FormData();
            formData.append("files[0]", new Blob([file]), 'jerma.gif');

            req.respond(formData);
        } catch (err) {
            console.error(err);

            let formData = new FormData();
            formData.append('content', ":sweat_smile: Sorry! Something went wrong. Try again later.")
            req.respond(formData);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('');
    }
});

fastify.listen(process.env.PORT || 80, '0.0.0.0', (err: Error, address: string) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(address);
});
