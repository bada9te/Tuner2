const { SpotifyExtractor } = require('@discord-player/extractor');
const { QueryType, useMainPlayer } = require('discord-player');


class OverriddenSpotifyExtractor extends SpotifyExtractor {
    async handle(query, context) {
        // Step 1: Resolve Spotify track as usual
        const originalResult = await super.handle(query, context);

        // If nothing found, return original result (empty or fallback)
        if (!originalResult || !originalResult.tracks.length) {
            return originalResult;
        }

        // Step 2: Use first Spotify track to build SoundCloud search query
        const spotifyTrack = originalResult.tracks[0];
        const title = spotifyTrack.title;
        const author = spotifyTrack.author;

        const searchQuery = `${author} - ${title}`;

        // Step 3: Search SoundCloud
        const player = useMainPlayer();
        const scResult = await player.search(searchQuery, {
            requestedBy: context.requestedBy,
            searchEngine: QueryType.SOUNDCLOUD_SEARCH
        });


        const combinedTracks = [
            ...(scResult.tracks || [])
        ];

        return {
            playlist: null,
            tracks: combinedTracks
        };
    }
}


module.exports = OverriddenSpotifyExtractor;
