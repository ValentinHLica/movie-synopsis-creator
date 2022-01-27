import cluster from "cluster";
import { writeFileSync } from "fs";
import { join } from "path";

import { dataPath, renderPath, textPath } from "../config/paths";

import { spreadWork, getMovie } from "../utils/helpers";
import { getVoice } from "./lib";

export default async () => {
  return new Promise(async (resolve) => {
    const {
      timeStamps,
      cli: { balcon, bal4web },
      customAudio,
    } = getMovie(true);

    for (const timeStamp of timeStamps) {
      writeFileSync(
        join(renderPath, `${timeStamp.id}-text.txt`),
        timeStamp.text
      );
    }

    // Generate Audio Files
    const work = spreadWork(timeStamps);
    let counter = work.length;

    const voice = getVoice();

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(dataPath, `${index + ""}-audio.json`);

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          jobs,
          voice,
          balcon,
          bal4web,
          customAudio,
        })
      );

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [jobsFilePath, voice],
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
