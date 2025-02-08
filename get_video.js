const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const { loudnorm } = require('./loudnorm.js');

const get_video = async (bvid) => {
    try {
        const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
        const data = await fetch(url, {
            method: "GET",
        });
        if (!data.ok) {
            throw new Error("Fetch failed, likely host problem");
        }
        var title;
        var owner;
        const json_data = await data.json();
        console.log(json_data);
        if (json_data.code === 0) {
            const cid = json_data.data.cid;
            const aid = json_data.data.aid;
            title = json_data.data.title;
            owner = json_data.data.owner.name;
            console.log(aid);
            console.log(cid);
            const video_url = `https://api.bilibili.com/x/player/playurl?fnval=80&avid=${aid}&cid=${cid}`;
            const video_data = await fetch(video_url, {
                method: "GET",
            });
            const json_video_data = await video_data.json();
            const audio_dl_url = json_video_data.data.dash.audio[0].baseUrl;
            console.log(audio_dl_url);
            const stream = fs.createWriteStream(`./music/${bvid}.mp3`);
            const { body } = await fetch(audio_dl_url, {
                method: "GET",
                referrer: `https://www.bilibili.com/video/${bvid}`
            })
            finished(Readable.fromWeb(body).pipe(stream)).then(loudnorm(bvid));
        }
        else {
            throw new Error("Bilibili API Error, make sure Bilibili is not down or that you have input the correct BVID/LINK");
        }
        return {
            title: title,
            owner: owner,
        };
    }
    catch (e) {
        throw e;
    }
}

module.exports = {get_video};