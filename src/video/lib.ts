import { join } from "path";
import { execFileSync } from "child_process";

import { assetsPath } from "../config/paths";
import { TimeStamp } from "../interfaces/utils";
import { Font } from "../interfaces/video";

import { getArgument, getDuration, parseTime } from "../utils/helpers";

type ChangeRatio = (args: {
  inputPath: string;
  exportPath: string;
  text?: string;
}) => void;

export const addFilter: ChangeRatio = ({ inputPath, exportPath, text }) => {
  // Cut Video
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  // Add Subtitles
  const font: Font = {
    text: `'${text}'`,
    x: "(w-text_w)/2",
    y: "(h-text_h - 20)",
    // font: `'${join(assetsPath, "font", "Helvetica.ttf")
    //   .split("\\")
    //   .join("/")
    //   .split(":")
    //   .join("\\\\:")}'`,
    font: "Arial",
    fontsize: 24,
    boxcolor: "0x161616",
    fontcolor: "0xF1BE71",
  };

  const drawtext = Object.keys(font)
    .map((key) => `${key}=${font[key]}`)
    .join(": ");

  const args = [
    "-y",
    "-i",
    inputPath,
    "-vf",
    `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black${
      text ? `,drawtext=${drawtext}` : ""
    }`,
    exportPath,
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

type CutMovieClip = (args: {
  timeStamp: TimeStamp;
  moviePath: string;
  exportPath: string;
}) => void;

export const cutClip: CutMovieClip = ({ timeStamp, moviePath, exportPath }) => {
  // Cut Video
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const { startTime } = timeStamp;

  const duration = getDuration(exportPath);

  const args = [
    "-ss",
    startTime,
    "-i",
    moviePath,
    "-t",
    duration,
    "-c:v",
    "copy",
    "-an",
    join(exportPath, "clip.mp4"),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
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
    "-shortest",
    join(exportPath, "video.mp4"),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
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
    "-y",
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
  }
};

export const getVideoRes = (filePath: string) => {
  const ffprobe = getArgument("FFPROBE") ?? "ffprobe";

  const args = [
    "-v",
    "error",
    "-of",
    "flat=s=_",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=height,width",
    filePath,
  ];

  try {
    const outPut = execFileSync(ffprobe, args).toString();
    var width = /width=(\d+)/.exec(outPut);
    var height = /height=(\d+)/.exec(outPut);

    if (!(width && height)) {
      throw new Error("No dimensions found!");
    }

    return {
      width: parseInt(width[1]),
      height: parseInt(height[1]),
    };
  } catch (error) {
    console.log(error);
  }
};

type GenerateVideo = (args: {
  image: string;
  audio?: string;
  duration: string;
  exportPath: string;
  title?: string;
}) => void;

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
export const generateVideo: GenerateVideo = ({
  image,
  audio,
  duration,
  exportPath,
  title,
}) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
    "-loop",
    "1",
    "-framerate",
    "24",
    "-i",
    image,
    "-i",
    audio,
    "-tune",
    "stillimage",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-pix_fmt",
    "yuv420p",
    "-c:v",
    "libx264",
    "-t",
    duration.toString(),
    join(exportPath, `${title ?? "video"}.mp4`),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};
