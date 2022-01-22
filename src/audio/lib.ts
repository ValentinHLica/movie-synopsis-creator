import { execSync } from "child_process";
import { join } from "path";

import { renderPath, audioPath, textPath } from "../config/paths";

import { getMovie } from "../utils/helpers";

/**
 * Get Voice
 */
export const getVoice = () => {
  const {
    cli: { balcon },
    voice,
  } = getMovie();

  if (voice) return voice;

  // Fails safe
  const voices = execSync(`${balcon ?? "balcon"} -l`).toString();

  const listOfVoice = voices
    .trim()
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v !== "SAPI 5:");

  return listOfVoice[0];
};

type AudioGenerator = (args: {
  id: number | string;
  voice: string;
  balcon: string | null;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({ id, voice, balcon }) => {
  let selectedVoice = voice ?? getVoice();

  const args = `-f "${textPath(id)}" -w "${audioPath(
    id
  )}" -n ${selectedVoice} --silence-end 200`;

  try {
    execSync(`${balcon ?? "balcon"} ${args}`);
  } catch (error) {
    console.log(error);
  }

  console.log("audio-generated");
};
