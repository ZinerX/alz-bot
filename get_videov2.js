const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap('./yt-dlp/yt-dlp.exe');

const get_videov2 = async (link) => {
    // ytDlpWrap
    //     .exec([
    //         link,
    //         '-f',
    //         'bestaudio',
    //         '-o',
    //         '%(id)s.m4a',
    //         '-P',
    //         './music',
    //     ])
    //     .on('progress', (progress) =>
    //         console.log(
    //             progress.percent,
    //         )
    //     )
    //     .on('ytDlpEvent', (eventType, eventData) =>
    //         console.log(eventType, eventData)
    //     )
    //     .on('error', (error) => console.error(error))
    //     .on('close', () => console.log('all done'));

    let stdout = await ytDlpWrap.execPromise([
        link,
        '-f',
        'bestaudio',
        '-o',
        '%(id)s.m4a',
        '-P',
        './music',
        '--dump-json'
    ]);
    console.log(stdout);
    // let outputJson = await JSON.parse(stdout);
    // console.log(outputJson);
    // return { id: outputJson.id, title: outputJson.title, uploader: outputJson.uploader }
}

get_videov2("https://www.bilibili.com/video/BV1zuFde5ESW/?spm_id_from=333.1007.tianma.1-1-1.click&vd_source=1a9dd214f18071c4fc134b890bb14dff");
// get_videov2("https://www.youtube.com/watch?v=v6HBZC9pZHQ");

// module.exports = { get_videov2 }