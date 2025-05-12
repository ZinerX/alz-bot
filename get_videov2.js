const youtubedl = require('youtube-dl-exec')

const get_videov2 = async (link) => {
    const output = await youtubedl(link, {
        format: "bestaudio",
        output: "%(id)s.m4a",
        paths: "./music",
        print: "%(id)s-|::|-%(title)s-|::|-%(uploader)s",
        noSimulate: true,
        exec: "ffmpeg -i ./music/%(id)s.m4a -af loudnorm=I=-30,volume=0.2 ./music/%(id)sfd.m4a -y",
    })
    const splitted = output.split("-|::|-");
    const videoInfo = {};
    videoInfo.id = splitted[0];
    videoInfo.title = splitted[1];
    videoInfo.uploader = splitted[2];
    return videoInfo;
}

module.exports = { get_videov2 }