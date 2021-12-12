import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";

import { getDuration } from "../utils/helpers";

import { addCommentaryAudio, cutClip } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const timeStamps = JSON.parse(
    readFileSync(args[0]).toString()
  ) as TimeStamp[];
  const moviePath = args[1] as string;

  for (let index = 0; index < timeStamps.length; index++) {
    const timeStamp = timeStamps[index];

    const exportPath = join(renderPath, timeStamp.id + "");

    const audioDuration = getDuration(join(exportPath, "subtitle.srt"));

    cutClip({
      startTime: timeStamp.startTime,
      duration: audioDuration,
      exportPath,
      moviePath,
    });

    addCommentaryAudio({
      clipPath: join(exportPath, "clip.mp4"),
      audioPath: join(exportPath, "audio.mp3"),
      exportPath,
    });

    console.log("clip-created");
  }

  // Kill Worker
  process.exit();
};

init();
