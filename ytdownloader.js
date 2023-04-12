import fs from 'fs';
import ytdl from 'ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import { execSync } from 'child_process';
import { EOL } from 'os';

async function main() {
  const quality = 'highest';
  const links = fs.readFileSync('ytlist.txt').toString().split(EOL);

  for (const link of links) {
    try {
      console.log('Downloading audio for video...');
      await new Promise((resolve, reject) => {
        ytdl(link, { quality, filter: 'audioonly' })
          .on('progress', (_, downloaded, total) => {
            const progress = (downloaded / total) * 100;
            console.log(`${progress.toFixed()} % completed`);
          })
          .on('end', () => {
            resolve();
          })
          .on('error', () => reject())
          .pipe(fs.createWriteStream('video.mp3'));
      });
    } catch {
      console.log('Failed to download audio.');
      return;
    }

    try {
      console.log('Downloading video...');
      await new Promise((resolve, reject) => {
        ytdl(link, { quality, filter: 'videoonly' })
          .on('progress', (_, downloaded, total) => {
            const progress = (downloaded / total) * 100;
            console.log(`${progress} % completed`);
          })
          .on('end', () => {
            resolve();
          })
          .on('error', () => reject())
          .pipe(fs.createWriteStream('video.mp4'));
      });
    } catch {
      console.log('Failed to download video');
      return;
    }
    console.log('Merging audio and video');
    let title;
    try {
      title = (await ytdl.getInfo(link)).videoDetails.title;
    } catch {
      console.log('Failed to get video title');
      return;
    }
    try {
      execSync(
        `${ffmpegPath} -i  video.mp4 -i video.mp3 -c:v copy -c:a aac ${title.replace(
          /[^a-zA-Z0-9]/g,
          ''
        )}.mp4`
      );
    } catch {
      console.log('Could not merge video and audio');
      return;
    }
    console.log('Merge complete!');

    try {
      fs.unlinkSync('video.mp3');
      fs.unlinkSync('video.mp4');
    } catch {
      console.log(
        'Unable to delete leftover audio and video files after merging.'
      );
    }
  }
}

main();
