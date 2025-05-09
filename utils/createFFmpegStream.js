const ffmpegPath = require('ffmpeg-static');  // Import the ffmpeg static binary
const ffmpeg = require('fluent-ffmpeg');  // Use fluent-ffmpeg for easier interaction

// Set the path for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);  // Point fluent-ffmpeg to the correct ffmpeg binary

module.exports = async(urlOrStream) => {
    return new Promise((resolve, reject) => {
        // Create a readable stream from the file URL using ffmpeg
        const stream = ffmpeg()
            .input(urlOrStream)
            .audioCodec('libopus')
            .format('opus') // Discord prefers opus for audio streaming
            .on('start', cmd => {
                console.log('[FFmpeg] Started:', cmd);
            })
            .on('codecData', data => {
                console.log('[FFmpeg] Input is:', data);
            })
            .on('error', (err, stdout, stderr) => {
                console.error('[FFmpeg Error]', err.message);
                console.error('[FFmpeg Stderr]', stderr);
                reject(err);
            })
            .on('end', () => {
                console.log('[FFmpeg] Processing finished');
            })
            .pipe();

        resolve(stream);  // Resolve the promise with the stream
    });
}