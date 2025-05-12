import youtubedl from 'youtube-dl-exec';

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
        extractAudio: true,
        audioFormat: "m4a",
        output: `${videoId}fd.m4a`, 
        paths: "./music", 
        noSimulate: true,
        postprocessorArgs: "-af loudnorm=I=-30:linear=true,volume=0.2",
    });

    const videoInfo = {
        id: videoId,
        title: videoTitle,
        uploader: videoUploader,
    };
    return videoInfo;
}