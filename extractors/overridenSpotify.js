const { SpotifyExtractor } = require("@discord-player/extractor");


class OverriddenSpotifyExtractor extends SpotifyExtractor {
    async stream(info) {
        return null;
    }
}

module.exports = OverriddenSpotifyExtractor;
