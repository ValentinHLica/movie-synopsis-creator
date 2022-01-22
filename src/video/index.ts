import cluster from "cluster";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";

import Jimp from "jimp";

import {
  assetsPath,
  clipPath,
  clipVideoPath,
  dataPath,
  imagePath,
  renderPath,
  textPath,
  videoPath,
} from "../config/paths";
import { resolution } from "../config/video";
import { getDuration, getMovie, spreadWork } from "../utils/helpers";
import { generateAudioFile, getVoice } from "../audio/lib";
import {
  addCommentaryAudio,
  addFilter,
  generateVideo,
  mergeVideos,
} from "./lib";

const createIntro = () => {
  const {
    title,
    categories,
    timeStamps,
    cli: { ffmpeg, balcon, ffprobe },
  } = getMovie();

  const id = "intro";

  // Generate Intro Audio
  const intro = `Hello, today we are going to explain an ${categories.join(
    " "
  )} movie named ${title}, spoilers ahead watch out and take care.`;

  writeFileSync(textPath(id), intro);

  const voice = getVoice();

  generateAudioFile({
    id,
    voice,
    balcon,
  });

  const introDuration =
    getDuration({
      id,
      ffprobe,
    }) + 2;
  let totalDuration = 0;

  const randomIds: number[] = [];
  while (introDuration > totalDuration) {
    const randomId = Math.floor(Math.random() * (timeStamps.length - 1));

    const videoDuration = getDuration({
      id: randomId,
      ffprobe,
    });

    totalDuration += videoDuration;

    if (randomIds.indexOf(randomId) === -1) randomIds.push(randomId);
  }

  const listPath = join(renderPath, `${id}-list.txt`);

  const videos = randomIds.map((id) => `file '${clipPath(id)}'`).join("\n");

  writeFileSync(listPath, videos);

  mergeVideos({
    exportPath: renderPath,
    listPath,
    title: `${id}-clip`,
  });

  addFilter({
    id,
    ffmpeg,
  });

  addCommentaryAudio({
    id,
    ffmpeg,
  });
};

const createOutro = async () => {
  const {
    cli: { ffmpeg, balcon },
  } = getMovie();

  const id = "outro";

  // Generate Audio File
  writeFileSync(
    textPath(id),
    "Make sure to subscribe and turn on notification, See you on another video, Bye"
  );

  const voice = getVoice();

  generateAudioFile({
    id,
    voice,
    balcon,
  });

  const { width, height } = resolution;

  const image = new Jimp(width, height, "#eeeeed");
  const font = await Jimp.loadFont(join(assetsPath, "font", "outro.fnt"));
  const outroText = `Thank you for watching`;
  const outroTextWidth = Jimp.measureText(font, outroText);

  image.print(font, width / 2 - outroTextWidth / 2, 150, outroText);

  await image.writeAsync(imagePath(id));

  generateVideo({
    id,
    ffmpeg,
  });
};

const createClips = () => {
  return new Promise(async (resolve) => {
    const {
      timeStamps,
      moviePath,
      cli: { ffmpeg, ffprobe },
    } = getMovie();

    const work = spreadWork(timeStamps);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(dataPath, `${index + ""}-movie.json`);

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          jobs,
          moviePath,
          ffmpeg,
          ffprobe,
        })
      );

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [jobsFilePath],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        counter--;

        if (counter === 0) {
          resolve(null);
        }
      });
    }
  });
};

const mergeFinalVideo = async () => {
  const { timeStamps, exportPath } = getMovie();

  const videos = timeStamps
    .filter((_, index) => {
      return existsSync(videoPath(index));
    })
    .map((_, index) => `file '${videoPath(index)}'`)
    .join("\n");

  const listPath = join(renderPath, "list.txt");

  const listPathText = [
    `file '${videoPath("intro")}'`,
    videos,
    `file '${clipPath("outro")}'`,
  ].join("\n");

  writeFileSync(listPath, listPathText);

  const videoExportPath = join(exportPath, `movie.mp4`);

  mergeVideos({
    listPath,
    exportPath,
  });

  console.log(`process-done=${videoExportPath}`);
};

export default async () => {
  await createClips();

  createIntro();

  await createOutro();

  await mergeFinalVideo();
};
