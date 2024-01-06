import * as nacl from 'tweetnacl';

interface Request {
  headers: {
    'x-signature-ed25519': string;
    'x-signature-timestamp': string;
  };
  body: Record<string, any>;
}

const verifyRequest = async (req: Request): Promise<boolean> => {
  try {
    const PUBLIC_KEY = process.env.PUBLICKEY;
    if (!PUBLIC_KEY || !req.headers['x-signature-ed25519'] || !req.headers['x-signature-timestamp'] || !req.body) {
      throw new Error('Missing required data');
    }

    const signature = Buffer.from(req.headers['x-signature-ed25519'], 'hex');
    const timestamp = req.headers['x-signature-timestamp'];
    const body = JSON.stringify(req.body);

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      signature,
      Buffer.from(PUBLIC_KEY, 'hex')
    );

    return isVerified;
  } catch (error) {
    console.error(`Error verifying request: ${error.message}`);
    return false;
  }
};

export { verifyRequest };
