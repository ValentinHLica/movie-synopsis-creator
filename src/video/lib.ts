import { execFileSync } from "child_process";
import { join } from "path";

import { getArgument } from "../utils/helpers";

type CutMovieClip = (args: {
  startTime: string;
  duration: string;
  moviePath: string;
  exportPath: string;
}) => void;

export const cutClip: CutMovieClip = ({
  startTime,
  duration,
  moviePath,
  exportPath,
}) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
    "-ss",
    startTime,
    "-i",
    moviePath,
    "-c",
    "copy",
    // "-an",
    "-t",
    duration,
    join(exportPath, "clip.mp4"),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
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

  // ,"output.mp4

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

  // const args = [
  //   "-i",
  //   clipPath,
  //   "-i",
  //   audioPath,
  //   "-map",
  //   "0",
  //   "-map",
  //   "1:a",
  //   "-c:v",
  //   "copy",
  //   join(exportPath, "video.mp4"),
  // ];

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
