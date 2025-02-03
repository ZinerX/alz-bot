const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const get_video = async (bvid) => {
    const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    const data = await fetch(url, {
        method: "GET",
    });
    const json_data = await data.json();
    console.log(json_data);
    if (json_data.code != -400) {
        const cid = json_data.data.cid;
        const aid = json_data.data.aid;
        console.log(aid);
        console.log(cid);
        const video_url = `https://api.bilibili.com/x/player/playurl?fnval=80&avid=${aid}&cid=${cid}`;
        const video_data = await fetch(video_url, {
            method: "GET",
        });
        const json_video_data = await video_data.json();
        const audio_dl_url = json_video_data.data.dash.audio[0].baseUrl;
        console.log(audio_dl_url);
        const stream = fs.createWriteStream(`${bvid}.mp3`);
        const { body } = await fetch(audio_dl_url, {
            method: "GET",
            referrer: `https://www.bilibili.com/video/${bvid}`
        })
        await finished(Readable.fromWeb(body).pipe(stream));


    }

    
}

module.exports = {get_video};