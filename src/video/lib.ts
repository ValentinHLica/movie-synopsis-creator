import { join } from "path";
import { execSync } from "child_process";

import {
  audioPath,
  clipPath,
  clipVideoPath,
  imagePath,
  renderPath,
  videoPath,
} from "../config/paths";
import { resolution, fps } from "../config/video";
import { TimeStamp } from "../interfaces/utils";

import { getDuration, getMovie } from "../utils/helpers";

type ChangeRatio = (args: {
  id: number | string;
  ffmpeg: string | null;
}) => void;

export const addFilter: ChangeRatio = ({ id, ffmpeg }) => {
  // Add Subtitles
  // const font: Font = {
  //   text: `'${text}'`,
  //   x: "(w-text_w)/2",
  //   y: "(h-text_h - 20)",
  //   font: "Arial",
  //   fontsize: 24,
  //   boxcolor: "0x161616",
  //   fontcolor: "0xF1BE71",
  // };

  // const drawtext = Object.keys(font)
  //   .map((key) => `${key}=${font[key]}`)
  //   .join(": ");
  // ${
  //   text ? `,drawtext=${drawtext}` : ""
  // }

  const { width, height } = resolution;

  const args = `-y -i ${clipPath(
    id
  )} -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:-1:-1:color=black,fps=${fps}" ${clipVideoPath(
    id
  )}`;

  try {
    execSync(`${ffmpeg ? `"${ffmpeg}"` : "ffmpeg"} ${args}`, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

type CutMovieClip = (args: {
  timeStamp: TimeStamp;
  moviePath: string;
  ffmpeg: string | null;
  ffprobe: string | null;
  audioTrimDuration: number;
}) => void;

export const cutClip: CutMovieClip = ({
  timeStamp,
  moviePath,
  ffmpeg,
  ffprobe,
  audioTrimDuration,
}) => {
  const { startTime, id } = timeStamp;

  const outputPath = join(renderPath, `${id}-clip.mp4`);

  const duration = getDuration({
    ffprobe,
    id,
    audioTrimDuration,
  });

  const args = `-y -ss ${startTime} -i ${moviePath} -t ${duration} -c:v copy -an ${outputPath}`;

  try {
    execSync(`${ffmpeg ? `"${ffmpeg}"` : "ffmpeg"} ${args}`, {
      stdio: "pipe",
    });
  } catch (error) {
    console.log(error);
  }
};

type CommentaryAudio = (args: {
  ffmpeg: string | null;
  id: string | number;
}) => void;

export const addCommentaryAudio: CommentaryAudio = ({ ffmpeg, id }) => {
  const args = `-y -i ${clipVideoPath(id)} -i ${audioPath(
    id
  )} -map 0:v -map 1:a -c:v copy -shortest ${videoPath(id)}`;

  try {
    execSync(`${ffmpeg ? `"${ffmpeg}"` : "ffmpeg"} ${args}`, {
      stdio: "pipe",
    });
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
  const {
    cli: { ffmpeg },
  } = getMovie();

  const outputPath = join(exportPath, `${title ?? "movie"}.mp4`);
  const args = `-y -safe 0 -f concat -i ${listPath} -c copy ${outputPath}`;

  try {
    execSync(`${ffmpeg ? `"${ffmpeg}"` : "ffmpeg"} ${args}`, {
      stdio: "pipe",
    });
  } catch (error) {
    console.log(error);
  }
};

export const getVideoRes = (filePath: string) => {
  const {
    cli: { ffprobe },
  } = getMovie();

  const args = `-y -v error -of flat=s=_ -select_streams v:0 -show_entries stream=height,width ${filePath}`;

  try {
    const outPut = execSync(
      `${ffprobe ? `"${ffprobe}"` : "ffprobe"} ${args}`
    ).toString();
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
  id: string | number;
  ffmpeg: string | null;
}) => void;

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
export const generateVideo: GenerateVideo = ({ id, ffmpeg }) => {
  const args = `-y -loop 1 -framerate ${fps} -i "${imagePath(
    id
  )}" -i "${audioPath(
    id
  )}" -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p -c:v libx264 ${clipPath(
    id
  )}`;

  try {
    execSync(`${ffmpeg ? `"${ffmpeg}"` : "ffmpeg"} ${args}`, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};
