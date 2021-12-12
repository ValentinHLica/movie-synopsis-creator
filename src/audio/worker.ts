import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const timeStamps = JSON.parse(
    readFileSync(args[0]).toString()
  ) as TimeStamp[];
  const voice = args[1];

  for (let index = 0; index < timeStamps.length; index++) {
    const timeStamp = timeStamps[index];

    const exportPath = join(renderPath, timeStamp.id + "");

    generateAudioFile({
      exportPath,
      textFilePath: join(exportPath, "text.txt"),
      voice,
    });
  }

  // Kill Worker
  process.exit();
};

init();
