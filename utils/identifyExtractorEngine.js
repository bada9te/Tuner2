const {YoutubeiExtractor} = require("discord-player-youtubei");
const {AttachmentExtractor, SpotifyExtractor, SoundCloudExtractor} = require("@discord-player/extractor");


function identifyExtractorEngine(url) {
    if (url.startsWith('https://cdn.discordapp.com')) {
        return `ext:${AttachmentExtractor.identifier}`;
    }

    if (url.startsWith('https://open.spotify.com')) {
        return `ext:${SpotifyExtractor.identifier}`;
    }

    if (url.startsWith('https://soundcloud.com')) {
        return `ext:${SoundCloudExtractor.identifier}`;
    }

    return `ext:${YoutubeiExtractor.identifier}`;
}

module.exports = identifyExtractorEngine;