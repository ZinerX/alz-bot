import youtubedl from 'youtube-dl-exec';
import ffmpegPath from 'ffmpeg-static';

export const get_video = async (link) => {
    
    const videoData = await youtubedl(link, {
        dumpSingleJson: true,
        noWarnings: true,
    });

    const videoId = videoData.id;
    const videoTitle = videoData.title;
    const videoUploader = videoData.uploader || videoData.channel || 'Unknown Uploader';
    
    await youtubedl(link, {
        format: "bestaudio",
        output: "%(id)s.m4a",
        paths: "./music",
        noSimulate: true,
        exec: `"${ffmpegPath}" -i ./music/%(id)s.m4a -af loudnorm=I=-30,volume=0.3 ./music/%(id)sfd.m4a -y`,
    });

    const videoInfo = {
        id: videoId,
        title: videoTitle,
        uploader: videoUploader,
    };
    return videoInfo;
}