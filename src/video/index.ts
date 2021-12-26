import cluster from "cluster";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import Jimp from "jimp";

import { dataPath, renderPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";

import { getFolders, getMovie, spreadWork } from "../utils/helpers";
import { generateAudioFile, getVoice } from "../audio/lib";
import { addCommentaryAudio, getVideoRes, mergeVideos } from "./lib";

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
  const folders = getFolders(renderPath);

  const randomIds: number[] = [];
  while (randomIds.length < 8) {
    var randomId = Math.floor(Math.random() * folders.length) + 1;
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
  });

  addCommentaryAudio({
    exportPath: introPath,
    audioPath: join(introPath, "audio.mp3"),
    clipPath: join(introPath, "movie.mp4"),
  });
};

const createOutro = () => {
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

  // Generate Outro image
  const folders = getFolders(renderPath).filter(
    (e) => e !== "intro" && e !== "outro"
  );

  const { width, height } = getVideoRes(join(renderPath, folders[0]));

  const image = new Jimp(width, height, "#eeeeed");

  const outroText = `Thank you for watching`;
};

type CreateClips = (args: {
  timeStamps: TimeStamp[];
  moviePath: string;
}) => Promise<void>;

const createClips: CreateClips = ({ timeStamps, moviePath }) => {
  return new Promise(async (resolve) => {
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

const mergeFinalVideo = async ({ exportPath }) => {
  const videos = getFolders(renderPath)
    .filter((f) => existsSync(join(renderPath, f, "video.mp4")))
    .map((t) => `file '${join(renderPath, t, "video.mp4")}'`)
    .join("\n");

  const listPath = join(renderPath, "list.txt");

  const listPathText = [
    `file '${join(renderPath, "intro", "video.mp4")}'`,
    videos,
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
  const { timeStamps, moviePath, exportPath } = getMovie();

  await createClips({ timeStamps, moviePath });

  createIntro();

  // createOutro();

  await mergeFinalVideo({ exportPath });
};
