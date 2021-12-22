import { join } from "path";
import { execFileSync } from "child_process";

import { assetsPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";
import { Font } from "../interfaces/video";

import { getArgument } from "../utils/helpers";

type CutMovieClip = (args: {
  timeStamp: TimeStamp;
  duration: string;
  moviePath: string;
  exportPath: string;
}) => void;

export const cutClip: CutMovieClip = ({
  timeStamp,
  duration,
  moviePath,
  exportPath,
}) => {
  // Cut Video
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const { startTime, text } = timeStamp;

  const args = [
    "-ss",
    startTime,
    "-i",
    moviePath,
    "-c",
    "copy",
    "-t",
    duration,
    join(exportPath, "clipVideo.mp4"),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }

  // Add Subtitles
  const font: Font = {
    text: `'${timeStamp.text}'`,
    x: "(w-text_w)/2",
    y: "(h-text_h - 20)",
    fontfile: join(assetsPath, "font", "Helvetica.ttf"),
    fontsize: 24,
    fontcolor: "0xF1BE71",
  };

  // text='hrllo world':x=640:y=360:fontsize=24:fontcolor=white

  const drawtext = Object.keys(font)
    .map((key) => `${key}=${font[key]}`)
    .join(":");

  const subArgs = [
    "-i",
    join(exportPath, "clipVideo.mp4"),
    "-vf",
    `drawtext=${drawtext}`,
    "-c:a",
    "copy",
    join(exportPath, "clip.mp4"),
  ];

  console.log(1);
  console.log(subArgs.join(" "));
  console.log(2);

  try {
    execFileSync(ffmpeg, subArgs, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

type CommentaryAudio = (args: {
  clipPath: string;
  audioPath: string;
  exportPath: string;
}) => void;

export const addCommentaryAudio: CommentaryAudio = ({
  clipPath,
  audioPath,
  exportPath,
}) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
    "-i",
    clipPath,
    "-i",
    audioPath,
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-c:v",
    "copy",
    // "-shortest",
    join(exportPath, "video.mp4"),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
};

type MergeVideos = (args: {
  listPath: string;
  exportPath: string;
  title?: string;
}) => void;

/**
 * Merge Videos together
 */
export const mergeVideos: MergeVideos = ({ listPath, exportPath, title }) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
    "-safe",
    "0",
    "-f",
    "concat",
    "-i",
    listPath,
    "-c",
    "copy",
    join(exportPath, `${title ?? "movie"}.mp4`),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    console.log(error);

    // console.log(error);
  }
};
