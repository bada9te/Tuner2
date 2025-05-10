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

    return createFFmpegStream(song, {
        fmt: 'opus', // Opus is optimal for Discord
        encoderArgs: [
            '-f', 'opus',              // Output format: Opus
            //'-ar', '48000',            // Sample rate: 48kHz (Discord standard)
            //'-ac', '2',                // Channels: Stereo
            '-acodec', 'libopus',      // Use libopus encoder for best quality
            '-b:a', '128k',            // Bitrate: 128 kbps for high-quality voice/music
            '-vbr', 'on',              // Enable variable bitrate (better quality)
            //'-compression_level', '10',// Max compression level (quality)
            '-re',                     // Stream in real-time
            '-vn',                     // Disable video
            '-loglevel', 'quiet'       // Suppress logs (optional)
        ],
        skip: false, // Don’t skip stream prep
    });
}
