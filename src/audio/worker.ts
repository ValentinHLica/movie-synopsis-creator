import { readFileSync } from "fs";

import { TimeStamp } from "../interfaces/utils";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const { jobs, voice, bal4web, balcon, customAudio } = JSON.parse(
    readFileSync(args[0]).toString()
  ) as {
    jobs: TimeStamp[];
    voice: string;
    balcon: string | null;
    bal4web: string | null;
    customAudio: boolean;
  };

  for (const timeStamp of jobs) {
    generateAudioFile({
      id: timeStamp.id,
      voice,
      balcon,
      bal4web,
      customAudio,
    });
  }

  // Kill Worker
  process.exit();
};

init();
