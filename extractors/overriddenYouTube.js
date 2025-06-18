const { QueryType, useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');


class OverriddenYoutubeExtractor extends YoutubeiExtractor {
    async handle(query, context) {
        // Step 1: Resolve Spotify track as usual
        const originalResult = await super.handle(query, context);

        // If nothing found, return original result (empty or fallback)
        if (!originalResult || !originalResult.tracks.length) {
            return originalResult;
        }

        // Step 2: Use first Spotify track to build SoundCloud search query
        const youtubeTrack = originalResult.tracks[0];
        const title = youtubeTrack.title;
        const author = youtubeTrack.author;

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


module.exports = OverriddenYoutubeExtractor;
