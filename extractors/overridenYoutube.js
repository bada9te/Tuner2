const { YoutubeiExtractor } = require("discord-player-youtubei");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn } = require('child_process');
require('dotenv').config();


ffmpeg.setFfmpegPath(ffmpegPath);


class OverriddenYoutubeExtractor extends YoutubeiExtractor {
    constructor (...args) {
        super(...args);
        const cookies = process.env.YT_COOKIE;

        fs.writeFileSync(path.join(__dirname, 'cookies.txt'), cookies);
    }

    async stream(info) {
        if (info?.raw?.live) {
            // call parent stream function cause we dont have to download stream
            return super.stream(info);
        }

        console.log('🔁 Replacing Youtube stream with custom download...', info.url);
        try {
            const stream = await this.downloadTrack(info.url);
            return stream;
        } catch (err) {
            console.error('❌ Failed to download from Youtube:', err.message);
            throw err;
        }
    }

    async downloadTrack(url) {
        const detectedOS = os.platform();
        let executablePath = path.join(__dirname, '..', 'utils', 'youtube', 'ytdlp-bin');

        switch(detectedOS) {
            case "linux": 
                executablePath = path.join(executablePath, 'yt-dlp');
                break;
            case "darwin":
                executablePath = path.join(executablePath, 'yt-dlp_macos'); 
                break;
            case "win32": 
                executablePath = path.join(executablePath, 'yt-dlp.exe');
                break;
        }

        // Step 1: Spawn yt-dlp to output to stdout
        const ytdlp = spawn(executablePath, [
            '--cookies', 'cookies.txt', 
            '--proxy', process.env.PROXY_URI,
            '--downloader', 'ffmpeg',
            '-f', 'bestaudio', '--no-part', '--no-cache-dir',
            '-o', '-', // output to stdout
            url
        ], {
            stdio: ['ignore', 'pipe', 'inherit'] // stdout is piped
        });

        return ytdlp.stdout;
        
        /*
        // Step 2: Pipe yt-dlp stdout into ffmpeg
        ffmpeg(ytdlp.stdout)
            .inputFormat('webm') // adjust if needed: 'm4a', 'opus', etc.
            .audioBitrate('320k')
            .audioFrequency(44100)
            .format('mp3') // target format
            .audioCodec('libmp3lame')
            .on('start', cmd => console.log('🎬 FFmpeg started:', cmd))
            .on('error', err => console.error('❌ FFmpeg error:', err.message))
            .pipe(res, { end: true }); // Stream directly to response
        */
    }

}


module.exports = OverriddenYoutubeExtractor;
