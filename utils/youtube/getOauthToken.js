const axios = require('axios');
const readline = require('readline');
const open = require('open');
const tokensObjectToString = require('./tokensObjectToString');
require('dotenv').config();


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly'
].join(' ');
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';


async function getAuthorizationCode() {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

    console.log('Opening browser to authorize...');
    await open.default(authUrl);

    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Paste the authorization code here: ', (code) => {
            rl.close();
            resolve(code.trim());
        });
    });
}

async function exchangeCodeForTokens(code) {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return response.data;
}


(async () => {
    try {
        const code = await getAuthorizationCode();
        const tokens = await exchangeCodeForTokens(code);

        console.log('\n✅ Tokens got:');
        console.log(tokens);
        console.log(tokensObjectToString(tokens));
    } catch (err) {
        console.error('\n❌ Error getting tokens:', err.response?.data || err.message);
    }
})();
