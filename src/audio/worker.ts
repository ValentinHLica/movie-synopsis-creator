import { readFileSync } from "fs";

import { TimeStamp } from "../interfaces/utils";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const timeStamps = JSON.parse(
    readFileSync(args[0]).toString()
  ) as TimeStamp[];
  const voice = args[1] as string;
  const balcon = args[2] as string | null;

  for (const timeStamp of timeStamps) {
    generateAudioFile({
      id: timeStamp.id,
      voice,
      balcon,
    });
  }

  // Kill Worker
  process.exit();
};

init();
