import cluster from "cluster";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";

import { dataPath, renderPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";

import { getFolders, getMovie, spreadWork } from "../utils/helpers";
import { mergeVideos } from "./lib";

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
    .map((t) => `file '${join(renderPath, t, "video.mp4")}'`);

  const listPath = join(renderPath, "list.txt");

  writeFileSync(listPath, videos.join("\n"));

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

  await mergeFinalVideo({ exportPath });
};
