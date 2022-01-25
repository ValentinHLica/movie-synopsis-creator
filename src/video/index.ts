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
  videoPath,
} from "../config/paths";

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
    timeStamps,
    cli: { ffmpeg, balcon, ffprobe },
    customAudio,
    audioTrimDuration,
  } = getMovie();

  const id = "intro";

  if (!customAudio) {
    const voice = getVoice();

    generateAudioFile({
      id,
      voice,
      balcon,
    });
  }

  const introDuration = getDuration({
    id,
    ffprobe,
    audioTrimDuration,
  });

  let totalDuration = 0;

  const randomIds: number[] = [];

  while (introDuration > totalDuration) {
    const randomId = Math.floor(Math.random() * (timeStamps.length - 1));

    const videoDuration = getDuration({
      id: randomId,
      ffprobe,
      audioTrimDuration,
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

const createOutro = async () => {
  const {
    cli: { ffmpeg, balcon },
    customAudio,
    outroImage,
  } = getMovie();

  const id = "outro";

  if (!customAudio) {
    const voice = getVoice();

    generateAudioFile({
      id,
      voice,
      balcon,
    });
  }

  const outroImagePath =
    (existsSync(outroImage) && outroImage) ??
    join(assetsPath, "outro-image.png");

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
      audioTrimDuration,
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
          audioTrimDuration,
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
  const { customAudio } = getMovie();

  if (customAudio == "audio") return;

  await createClips();

  createIntro();

  await createOutro();

  await mergeFinalVideo();
};
