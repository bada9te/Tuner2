const axios = require('axios');
const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { SoundCloudExtractor } = require("@discord-player/extractor");
require("dotenv").config();


ffmpeg.setFfmpegPath(ffmpegPath);


const api = 'https://api-v2.soundcloud.com/';
const clientId = process.env.SOUNDCLOUD_CLIENT_ID;


class OverriddenSoundCloudExtractor extends SoundCloudExtractor {
    async stream(info) {
        console.log('🔁 Replacing SoundCloud stream with custom download...', info.url);
        try {
            const stream = await this.downloadTrack(info.url);
            return stream;
        } catch (err) {
            console.error('❌ Failed to download from SoundCloud:', err.message);
            throw err;
        }
    };


    async followRedirect(url) {
        return await axios.get(url)
            .then((response) => {
                return response.request._redirectable._currentUrl;
            }).catch((error) => {
                throw error;
            });
    };


    async resolveDataFromUrl(url) {
        if (url.match(/on.soundcloud.com/))
            url = await this.followRedirect(url);
    
        const response = await axios.get(api + 'resolve', {
            params: {
                url,
                format: 'json',
                client_id: clientId
            }
        }).catch((err) => {
            throw err;
        });
    
        return response.data;
    };


    async resolveMusicDataFromUrl(url) {
        let data = await this.resolveDataFromUrl(url);
        return this.resolveMusicDataFromJson(data);
    };


    resolveMusicDataFromJson(data) {
        try {
            return {
                title: data.title,
                cover: data?.artwork_url?.replace('-large', '-t500x500') || '',
                duration: data.duration,
                genre: data.genre,
                artist: data?.publisher_metadata?.artist,
                album_title: data?.publisher_metadata?.album_title,
                url: data.uri,
                track: data.media.transcodings.find(item => item.format.protocol === 'progressive').url
            };
        } catch (e){
            console.error('Error fetching music data:', e.message, data);
        }
    };

    async downloadTrack(url) {
        let track = await this.resolveMusicDataFromUrl(url);
    
        if (!track)
            throw new Error('No track founded.');
    
        try {
            const trackResponse = await axios.get(track.track, {
                params: {
                    client_id: clientId
                }
            });
    
            const trackUrl = trackResponse.data.url;
    
            const trackData = await axios.get(trackUrl, {
                responseType: 'arraybuffer'
            });
    
            const audioBuffer = Buffer.from(trackData.data);
            const audioStream = Readable.from([audioBuffer]);
    
            const ffmpegStream = ffmpeg(audioStream)
                .format('mp3') // or 'opus', 's16le', etc., depending on use case
                .audioCodec('libmp3lame') // optional: pick a codec
                .on('start', cmd => console.log('🎬 FFmpeg started:', cmd))
                .on('error', err => console.error('❌ FFmpeg error:', err.message));
    
            return ffmpegStream.pipe();
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OverriddenSoundCloudExtractor;