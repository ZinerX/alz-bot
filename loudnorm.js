const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const loudnorm = (audio) => {
    ffmpeg(`./music/${audio}.mp3`).outputOptions(['-af', 'loudnorm=I=-30,volume=0.2']).save(`./music/${audio}fd.mp3`);
}

module.exports = {loudnorm};