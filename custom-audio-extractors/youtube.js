const { BaseExtractor } = require('discord-player');
const ytdl = require('@distube/ytdl-core');

class YouTubeExtractor extends BaseExtractor {
    static identifier = 'custom-youtube';

    async activate() {
        this.protocols = ['yt'];
    }

    async validate(query) {
        return ytdl.validateURL(query) || ytdl.validateID(query);
    }

    async handle(query, context) {
        const results = [];

        try {
            const info = await ytdl.getInfo(query);

            const track = {
                cleanTitle: info.videoDetails.title,
                title: info.videoDetails.title,
                description: info.videoDetails.description,
                author: info.videoDetails.author.name,
                url: info.videoDetails.video_url,
                thumbnail: info.videoDetails.thumbnails?.[0]?.url,
                duration: parseInt(info.videoDetails.lengthSeconds),
                views: parseInt(info.videoDetails.viewCount),
                requestedBy: context.requestedBy,
                source: 'youtube',
                queryType: 'youtubeVideo',
                extractor: this,
                raw: info
            };

            results.push(track);
        } catch (err) {
            console.error('[YouTubeExtractor] Failed to fetch video info:', err);
        }

        return this.createResponse(null, results);
    }

    async stream(track) {
        return ytdl(track.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
        });
    }

    async getRelatedTracks(track) {
        // YouTube suggestions API not used here
        return this.createResponse(null, []);
    }
}

module.exports = { YouTubeExtractor };
