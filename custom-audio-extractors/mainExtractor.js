const { BaseExtractor } = require('discord-player');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const path = require("path");



const ffmpegPath = require('ffmpeg-static');  // Import the ffmpeg static binary
const ffmpeg = require('fluent-ffmpeg');  // Use fluent-ffmpeg for easier interaction

// Set the path for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);  // Point fluent-ffmpeg to the correct ffmpeg binary



class MainCustomExtractor extends BaseExtractor {
    static identifier = 'custom-youtube';

    // Create track from the attached audio file
    async createTrackFromFile(fileUrl, context) {
        return {
            cleanTitle: path.basename(fileUrl), // Clean title from filename
            title: path.basename(fileUrl), // Track title
            description: 'Audio file uploaded',
            author: context.requestedBy.username, // User who requested the file
            url: fileUrl, // URL of the file (this could be a remote file)
            thumbnail: '', // No thumbnail for file attachments
            duration: 1000, // File duration
            views: 0, // Views are not applicable to uploaded files
            requestedBy: context.requestedBy, // User who requested
            source: 'file', // Source is file
            queryType: 'audioFile',
            extractor: this,
            raw: fileUrl
        };
    }




    async activate() {
        this.protocols = ['yt'];
    }

    async validate(query) {
        // Accept both URLs/IDs and keyword-based searches
        return true; // Let handle() decide
    }

    async handle(query, context) {
        const results = [];

        // if we have attachment
        if (query.startsWith('https://cdn.discordapp.com')) {
            let fileExtension = path.extname(query).toLowerCase();
            fileExtension = fileExtension.substring(0, fileExtension.indexOf('?'));

            if (['.mp3', '.wav', '.ogg', '.flac'].includes(fileExtension)) {
                // For audio files, we'll process them
                const track = await this.createTrackFromFile(query, context);
                results.push(track);
            } else {
                console.error('[AudioFileExtractor] Unsupported file format:', fileExtension);
            }
        } else {
            try {
                if (ytdl.validateURL(query) || ytdl.validateID(query)) {
                    const info = await ytdl.getInfo(query);

                    const track = {
                        cleanTitle: info.videoDetails.title,
                        title: info.videoDetails.title,
                        description: info.videoDetails.description,
                        author: info.videoDetails.author.name,
                        url: info.videoDetails.video_url,
                        thumbnail: info.videoDetails.thumbnails?.[0]?.url,
                        duration: this.parseDuration(parseInt(info.videoDetails.lengthSeconds)),
                        views: parseInt(info.videoDetails.viewCount),
                        requestedBy: context.requestedBy,
                        source: 'youtube',
                        queryType: 'youtubeVideo',
                        extractor: this,
                        raw: info
                    };

                    results.push(track);
                } else {
                    // Search by title using ytsr
                    const searchResults = await ytSearch(query);

                    const videos = searchResults.videos.slice(0, 5);

                    for (const video of videos) {
                        results.push({
                            cleanTitle: video.title,
                            title: video.title,
                            description: '',
                            author: video.author.name,
                            url: video.url,
                            thumbnail: video.image,
                            duration: this.parseDuration(parseInt(video.seconds)),
                            views: video.views,
                            requestedBy: context.requestedBy,
                            source: 'youtube',
                            queryType: 'youtubeSearch',
                            extractor: this,
                            raw: video,
                        });
                    }
                }
            } catch (err) {
                console.error('[YouTubeExtractor] Failed:', err);
            }
        }


        return this.createResponse(null, results);
    }

    parseDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        return h > 0
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m}:${s.toString().padStart(2, '0')}`;
    }

    async stream(track) {
        if (track.source === 'youtube') {
            return ytdl(track.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
            });
        } else {
            return new Promise((resolve, reject) => {
                const fileUrl = track.url;

                // Create a readable stream from the file URL using ffmpeg
                const stream = ffmpeg()
                    .input(fileUrl)
                    .inputOptions('-f mp3')  // Adjust input format based on your file type
                    .audioCodec('libmp3lame') // Set audio codec for mp3 files
                    .audioBitrate(128)         // Set bitrate (optional)
                    .format('mp3')             // Set output format to mp3
                    .on('end', () => {
                        // console.log('File stream ended.');
                    })
                    .on('error', (err) => {
                        // console.error('Error during streaming:', err);
                        reject(err);
                    })
                    .pipe();  // Return the stream as output

                resolve(stream);  // Resolve the promise with the stream
            });
        }
    }

    async getRelatedTracks(track) {
        return this.createResponse(null, []);
    }
}

module.exports = { MainCustomExtractor };
