const axios = require('axios');
const tokensObjectToString = require('./tokensObjectToString');
require('dotenv').config();


function parseOAuthTokenString(str) {
    const result = {};
  
    // Split the string by semicolons
    const pairs = str.split(';');

    for (let pair of pairs) {
        // Trim whitespace and split by '='
        const [key, ...rest] = pair.trim().split('=');
        const value = rest.join('=');

        if (key === 'scope') {
            // Split scope into an array
            result.scope = value.trim().split(/\s+/);
        } else if (key === 'expiry_date') {
            // Convert to Date object or keep as string
            result.expiry_date = value.trim();
        } else {
            result[key] = value.trim();
        }
    }

    return result;
}


module.exports = async function refreshAccessToken() {
    const parsedOauthString = parseOAuthTokenString(process.env.YT_CRE);

    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: parsedOauthString.refresh_token,
            grant_type: 'refresh_token'
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('[GOOGLE_TOKENS_REFRESH] 🔄 New access token grabbed!');

    return {
        access_token: response.data.access_token,
        full_response_parsed: tokensObjectToString({ 
            ...response.data, 
            refresh_token: parsedOauthString.refresh_token 
        }),
        full_response: response.data
    };
}

