import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";

import { addCommentaryAudio, addFilter, cutClip } from "./lib";

type ArgsType = {
  jobs: TimeStamp[];
  moviePath: string;
  ffmpeg: string | null;
  ffprobe: string | null;
  customAudio: boolean;
};

const init = async () => {
  const args = process.argv.slice(2);
  const { jobs, moviePath, ffprobe, ffmpeg, customAudio } = JSON.parse(
    readFileSync(args[0]).toString()
  ) as ArgsType;

  for (const timeStamp of jobs) {
    const { id } = timeStamp;

    cutClip({
      timeStamp,
      moviePath,
      ffmpeg,
      ffprobe,
      customAudio,
    });

    addFilter({
      id: timeStamp.id,
      ffmpeg,
    });

    addCommentaryAudio({
      ffmpeg,
      id,
    });

    console.log("clip-generated");
  }
  // Kill Worker
  process.exit();
};

init();
