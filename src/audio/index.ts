import cluster from "cluster";
import { writeFileSync } from "fs";
import { join } from "path";

import { dataPath, renderPath, textPath } from "../config/paths";

import { spreadWork, getMovie } from "../utils/helpers";
import { getVoice } from "./lib";

export default async () => {
  return new Promise(async (resolve) => {
    const { timeStamps, customAudio, title, categories, intro, outro } =
      getMovie(true);

    if (customAudio === "video") return resolve(null);

    for (const timeStamp of timeStamps) {
      writeFileSync(
        join(renderPath, `${timeStamp.id}-text.txt`),
        timeStamp.text
      );
    }

    // Generate Intro and Outro text files
    const introText = intro
      ? intro
          .replace("{title}", title)
          .replace("{categories}", categories.join(" "))
      : `Hello, today we are going to explain an ${categories.join(
          " "
        )} movie named ${title}, spoilers ahead watch out and take care.`;

    writeFileSync(textPath("intro"), introText);

    const outroText =
      outro ??
      "Make sure to subscribe and turn on notification, See you on another video, Bye";

    writeFileSync(textPath("outro"), outroText);

    if (customAudio === "audio") return resolve(null);

    // Generate Audio Files
    const work = spreadWork(timeStamps);
    let counter = work.length;

    const voice = getVoice();

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(dataPath, `${index + ""}-audio.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

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
