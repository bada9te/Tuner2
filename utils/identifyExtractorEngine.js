const {YoutubeiExtractor} = require("discord-player-youtubei");
const {AttachmentExtractor} = require("@discord-player/extractor");


function identifyExtractorEngine(url) {
    if (url.startsWith('https://cdn.discordapp.com')) {
        return `ext:${AttachmentExtractor.identifier}`;
    }

    if (url.startsWith('https://open.spotify.com')) {
        return undefined;
    }

    if (url.startsWith('https://soundcloud.com')) {
        return undefined;
    }

    return `ext:${YoutubeiExtractor.identifier}`;
}

module.exports = identifyExtractorEngine;