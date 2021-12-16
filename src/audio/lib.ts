import { execFileSync } from "child_process";
import { join } from "path";

import { AudioFileGeneration } from "../interfaces/audio";

import { getArgument } from "../utils/helpers";

/**
 * Get Voice
 */
export const getVoice = () => {
  const balcon = getArgument("BALCON") ?? "balcon";

  const selectedVoice = getArgument("VOICE");

  if (selectedVoice) {
    return selectedVoice;
  }

  const voices = execFileSync(balcon, ["-l"]).toString();

  const listOfVoice = voices
    .trim()
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v !== "SAPI 5:");

  return listOfVoice[0];
};

type AudioGenerator = (args: AudioFileGeneration) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  textFilePath,
  exportPath,
  voice,
}) => {
  let selectedVoice = voice ?? getVoice();

  const balcon = getArgument("BALCON") ?? "balcon";

  const args = [
    "-f",
    textFilePath,
    "-w",
    `${join(exportPath, "audio.mp3")}`,
    "-n",
    selectedVoice,
    "--encoding",
    "utf8",
    "-fr",
    "--silence-end",
    "200",
    "48",
    "--lrc-length",
    "500",
    "--srt-length",
    "500",
    "-srt",
    "--srt-enc",
    "utf8",
    "--srt-fname",
    `${join(exportPath, "subtitle.srt")}`,
    "--ignore-url",
  ];

  try {
    execFileSync(balcon, args);
  } catch (error) {
    // console.log(error);
  }

  console.log("audio-generated");
};
