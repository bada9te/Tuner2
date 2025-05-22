const refreshAccessToken = require("./refreshAccessToken");

let cachedOauth = null;
let expiryTime = 0;

module.exports = async function getValidGoogleOauth() {
    const now = Date.now();

    if (!cachedOauth || now >= expiryTime - 60000) { // refresh 1 minute early
        const data = await refreshAccessToken();
        cachedOauth = data.full_response_parsed;
        expiryTime = now + data.full_response.expires_in * 1000;
        console.log("[GOOGLE_TOKENS_REFRESH] 🔄 Refreshed token");
    }

    return cachedOauth;
}

