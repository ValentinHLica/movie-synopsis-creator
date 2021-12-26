import cluster from "cluster";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import Jimp from "jimp";

import { assetsPath, dataPath, renderPath } from "../config/paths";

import {
  getDuration,
  getFolders,
  getMovie,
  parseTime,
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
  const { title, categories } = getMovie();

  const introPath = join(renderPath, "intro");
  mkdirSync(introPath);

  // Generate Intro Audio
  const intro = `Hello, today we are going to explain an ${categories.join(
    " "
  )} movie named ${title}, spoilers ahead watch out and take care.`;

  const textFilePath = join(introPath, "text.txt");

  writeFileSync(textFilePath, intro);

  const voice = getVoice();

  generateAudioFile({
    voice,
    exportPath: introPath,
    textFilePath,
  });

  // Generate random intro video
  const folders = getFolders(renderPath).filter(
    (e) => e !== "intro" && e !== "outro"
  );

  const introDuration = parseTime(getDuration(introPath)) + 2;
  let totalDuration = 0;

  const randomIds: number[] = [];
  while (introDuration > totalDuration) {
    const randomId = Math.floor(Math.random() * (folders.length - 1));

    const videoDuration = parseTime(
      getDuration(join(renderPath, randomId + ""))
    );

    totalDuration += videoDuration;

    if (randomIds.indexOf(randomId) === -1) randomIds.push(randomId);
  }

  const listPath = join(introPath, "list.txt");

  const videos = randomIds
    .map((id) => `file '${join(renderPath, id + "", "clip.mp4")}'`)
    .join("\n");

  writeFileSync(listPath, videos);

  mergeVideos({
    exportPath: introPath,
    listPath,
    title: "clip",
  });

  addFilter({
    inputPath: join(introPath, "clip.mp4"),
    exportPath: join(introPath, "clip-video.mp4"),
  });

  addCommentaryAudio({
    clipPath: join(introPath, "clip-video.mp4"),
    audioPath: join(introPath, "audio.mp3"),
    exportPath: introPath,
  });
};

const createOutro = async () => {
  const outroPath = join(renderPath, "outro");
  mkdirSync(outroPath);

  const outro =
    "Make sure to subscribe and turn on notification, See you on another video, Bye";

  // Generate Audio File
  const textFilePath = join(outroPath, "text.txt");

  writeFileSync(textFilePath, outro);

  const voice = getVoice();

  generateAudioFile({
    voice,
    exportPath: outroPath,
    textFilePath,
  });

  const width = 1920;
  const height = 1080;

  const image = new Jimp(width, height, "#eeeeed");
  const logoImage = await Jimp.read(join(assetsPath, "images", "logo.png"));
  const resize = 250;
  const logo = logoImage.resize(resize, resize);
  const font = await Jimp.loadFont(
    join(assetsPath, "font", "outro", "outro.fnt")
  );

  const outroText = `Thank you for watching`;
  const outroTextWidth = Jimp.measureText(font, outroText);
  const outroTextHeight = Jimp.measureTextHeight(
    font,
    outroText,
    outroTextWidth + 100
  );

  const gropWidth = outroTextWidth + resize;

  image.composite(logo, width / 2 - gropWidth / 2, 20);
  image.print(
    font,
    width / 2 - gropWidth / 2 + resize,
    resize / 2 - outroTextHeight / 2 + 10,
    outroText
  );

  const imagePath = join(outroPath, "image.png");
  await image.writeAsync(imagePath);

  const duration = getDuration(outroPath);

  generateVideo({
    duration,
    exportPath: outroPath,
    image: imagePath,
    audio: join(outroPath, "audio.mp3"),
    title: "clip",
  });

  addFilter({
    inputPath: join(outroPath, "clip.mp4"),
    exportPath: join(outroPath, "video.mp4"),
  });
};

const createClips = () => {
  return new Promise(async (resolve) => {
    const { timeStamps, moviePath } = getMovie();

    const work = spreadWork(timeStamps);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(dataPath, `${index + ""}-movie.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [jobsFilePath, moviePath],
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
  const { exportPath } = getMovie();

  const videos = getFolders(renderPath)
    .filter((f) => existsSync(join(renderPath, f, "video.mp4")))
    .map((t) => `file '${join(renderPath, t, "video.mp4")}'`)
    .join("\n");

  const listPath = join(renderPath, "list.txt");

  const listPathText = [
    `file '${join(renderPath, "intro", "video.mp4")}'`,
    videos,
    `file '${join(renderPath, "outro", "video.mp4")}'`,
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
