const { createFFmpegStream } = require("discord-player");
const Spotify = require('spotifydl-core').default;
require('dotenv').config();


const credentials = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
}
const spotify = new Spotify(credentials);


module.exports = async(url) => {
    const song = await spotify.downloadTrack(url);

    return createFFmpegStream(song);
}
