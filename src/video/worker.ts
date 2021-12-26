import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";

import { addCommentaryAudio, addFilter, cutClip } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const timeStamps = JSON.parse(
    readFileSync(args[0]).toString()
  ) as TimeStamp[];
  const moviePath = args[1] as string;

  for (let index = 0; index < timeStamps.length; index++) {
    const timeStamp = timeStamps[index];

    const exportPath = join(renderPath, timeStamp.id + "");

    cutClip({
      timeStamp,
      exportPath,
      moviePath,
    });

    addFilter({
      inputPath: join(exportPath, "clip.mp4"),
      exportPath: join(exportPath, "clip-video.mp4"),
      text: timeStamp.text,
    });

    addCommentaryAudio({
      clipPath: join(exportPath, "clip-video.mp4"),
      audioPath: join(exportPath, "audio.mp3"),
      exportPath,
    });

    console.log("clip-created");
  }

  // Kill Worker
  process.exit();
};

init();
