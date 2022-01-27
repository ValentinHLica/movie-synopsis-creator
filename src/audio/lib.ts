import { execSync } from "child_process";
import { existsSync } from "fs";

import { audioPath, textPath } from "../config/paths";

import { getMovie } from "../utils/helpers";

/**
 * Get Voice
 */
export const getVoice = () => {
  const {
    cli: { balcon, bal4web },
    voice,
    customAudio,
  } = getMovie();

  if (voice) return voice;

  if (!customAudio) {
    const voices = execSync(
      `${existsSync(balcon) ? `"${balcon}"` : "balcon"} -l`
    ).toString();

    const listOfVoice = voices
      .trim()
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v !== "SAPI 5:");

    return listOfVoice[0];
  } else {
    const voices = execSync(
      `${existsSync(bal4web) ? `"${bal4web}"` : "bal4web"} -s m -m`
    ).toString();

    const listOfVoice = voices
      .trim()
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v !== "* Microsoft Azure *" && v.includes("en-US"))[0]
      .split(" en-US ")[1]
      .slice(1, -1)
      .split(", ");

    return listOfVoice[0];
  }
};

type AudioGenerator = (args: {
  id: number | string;
  voice: string;
  balcon?: string | null;
  bal4web?: string | null;
  customAudio: boolean;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  id,
  voice,
  balcon,
  bal4web,
  customAudio,
}) => {
  let selectedCli: string;

  if (!customAudio) {
    selectedCli = existsSync(balcon) ? `"${balcon}"` : "balcon";
  } else {
    selectedCli = existsSync(bal4web) ? `"${bal4web}"` : "bal4web";
  }

  const command = `${selectedCli} -s Microsoft -l en-Us -n ${voice} -f "${textPath(
    id
  )}" -w "${audioPath(id)}"`;

  try {
    execSync(command);
  } catch (error) {
    console.log(error);
  }

  console.log("audio-generated");
};
