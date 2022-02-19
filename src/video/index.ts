import cluster from "cluster";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";

import Jimp from "jimp";

import {
  assetsPath,
  clipPath,
  dataPath,
  imagePath,
  renderPath,
  textPath,
  videoPath,
} from "../config/paths";

import {
  getDuration,
  getMovie,
  randomString,
  slugify,
  spreadWork,
} from "../utils/helpers";
import { generateAudioFile, getVoice } from "../audio/lib";
import {
  addCommentaryAudio,
  addFilter,
  generateVideo,
  mergeVideos,
} from "./lib";

const createIntro = () => {
  const {
    timeStamps,
    cli: { ffmpeg, balcon, ffprobe, bal4web },
    intro,
    title,
    categories,
    customAudio,
  } = getMovie();

  const id = "intro";

  // Generate Intro and Outro text files
  const introText = intro
    ? intro
        .replace("{title}", title)
        .replace("{categories}", categories.join(" "))
    : `Hello, today we are going to explain an ${categories.join(
        " "
      )} movie named ${title}, spoilers ahead watch out and take care.`;

  writeFileSync(textPath("intro"), introText);

  const voice = getVoice();

  generateAudioFile({
    id,
    voice,
    balcon,
    bal4web,
    customAudio,
  });

  const introDuration = getDuration({
    id,
    ffprobe,
    customAudio,
  });

  let totalDuration = 0;

  const randomIds: number[] = [];

  while (introDuration > totalDuration) {
    const randomId = Math.floor(Math.random() * (timeStamps.length - 1));

    const videoDuration = getDuration({
      id: randomId,
      ffprobe,
      customAudio,
    });

    if (randomIds.indexOf(randomId) === -1) {
      totalDuration += videoDuration;
      randomIds.push(randomId);
    }
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

  console.log("clip-generated");
};

export const createOutro = async () => {
  const {
    cli: { ffmpeg, balcon, bal4web },
    outroImage,
    outro,
    customAudio,
  } = getMovie();

  const id = "outro";

  const outroText =
    outro ??
    "Make sure to subscribe and turn on notification, See you on another video, Bye";

  writeFileSync(textPath("outro"), outroText);

  const voice = getVoice();

  generateAudioFile({
    id,
    voice,
    balcon,
    bal4web,
    customAudio,
  });

  const outroImagePath =
    outroImage && existsSync(outroImage)
      ? outroImage
      : join(assetsPath, "outro-image.png");

  const image = await Jimp.read(outroImagePath);

  await image.writeAsync(imagePath(id));

  generateVideo({
    id,
    ffmpeg,
  });

  console.log("clip-generated");
};

const createClips = () => {
  return new Promise(async (resolve) => {
    const {
      timeStamps,
      moviePath,
      cli: { ffmpeg, ffprobe },
      customAudio,
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
          customAudio,
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
  const { timeStamps, exportPath, title } = getMovie();

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

  const videoTitle = `${slugify(title.toLowerCase())}-${randomString(2)}`;

  mergeVideos({
    listPath,
    exportPath,
    title: videoTitle,
  });

  console.log(`process-done=${join(exportPath, videoTitle)}.mp4`);
};

export default async () => {
  await createClips();

  createIntro();

  await createOutro();

  await mergeFinalVideo();
};
