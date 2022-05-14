const nacl = require('tweetnacl');

const verifyRequest = async (req) => {
    try {
        const PUBLIC_KEY = process.env.PUBLICKEY;
        const signature = req.headers['x-signature-ed25519'];
        const timestamp = req.headers['x-signature-timestamp'];
        const body = JSON.stringify(req.body);

        const isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex'),
        );

        return isVerified;
    } catch {
        return false;
    }
};

module.exports = { verifyRequest };