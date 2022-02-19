import { execSync } from "child_process";
import { cpus } from "os";
import {
  mkdirSync,
  existsSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  lstatSync,
  readFileSync,
} from "fs";
import { join } from "path";

import { dataPath, renderPath, audioPath, tempPath } from "../config/paths";
import { Arguments, MovieData } from "../interfaces/utils";

/**
 * Create Random String
 */
export const randomString = (size: number) =>
  (Math.random() + 1).toString(36).substring(size || 7);

/**
 * Slugify post title to file
 */
export const slugify = (title: string) => {
  const illegalLetter = [
    "\\",
    "/",
    ":",
    "*",
    "?",
    '"',
    "<",
    ">",
    "|",
    ".",
    ",",
  ];

  for (const letter of illegalLetter) {
    title = title.split(letter).join("");
  }

  return title;
};

/**
 * Delete Folder with its contents
 */
export const deleteFolder = (path: string) => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file: string) => {
      const curPath = join(path, file);
      if (lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
};

/**
 * Reset Temp folder for new process
 */
export const resetTemp = async () => {
  if (!existsSync(tempPath)) {
    mkdirSync(tempPath);
  }

  deleteFolder(renderPath);
  deleteFolder(dataPath);

  mkdirSync(renderPath);
  mkdirSync(dataPath);
};

/**
 * Get Argument value
 */
export const getArgument = (key: Arguments) => {
  let value: string | null = null;

  const args = process.argv
    .filter((arg) => arg.split("=").length > 1)
    .map((arg) => arg.split("="));

  for (const argument of args) {
    if (argument[0] === key) {
      value = argument[1];
      break;
    }
  }

  return value;
};

type GetDuration = (args: {
  id: number | string;
  ffprobe: string | null;
  customAudio: boolean;
}) => number;

/**
 * Get Audio Duration
 */
export const getDuration: GetDuration = ({ id, ffprobe, customAudio }) => {
  const args = `${ffprobe ? `"${ffprobe}"` : "ffprobe"} -i "${audioPath(
    id
  )}" -show_entries format=duration -v quiet -of csv="p=0"`;

  try {
    return (
      Number(execSync(args, { stdio: "pipe" }).toString().trim()) -
      (customAudio ? 0.8 : 0)
    );
  } catch (error) {
    // console.log(error);
  }
};

/**
 * Get Movie data
 */
export const getMovie = (firstLoad?: boolean): MovieData => {
  const data = JSON.parse(
    readFileSync(getArgument("MOVIE")).toString()
  ) as MovieData;

  const newTimeStamps = data.timeStamps
    .filter((e) => !(e.startTime === "" || e.text === ""))
    .map((e, index) => ({ ...e, id: index }));

  if (firstLoad) {
    console.log(`process-count=${newTimeStamps.length * 2 + 4}`);
  }

  return {
    ...data,
    timeStamps: newTimeStamps,
  };
};

/**
 * Spread work count for each cluster
 * @param work Array of any items
 */
export const spreadWork = <T extends unknown>(work: T[]): T[][] => {
  const cpuCount = cpus().length;
  const workPerCpu = Math.floor(work.length / cpuCount);
  let leftWork = work.length % cpuCount;
  const workSpreed: T[][] = [];
  let counter = 0;

  for (let i = 0; i < cpuCount; i++) {
    const increment = i < leftWork ? workPerCpu + 1 : workPerCpu;
    workSpreed[i] = work.slice(counter, counter + increment);
    counter += increment;
  }

  return workSpreed.filter((e) => e.length > 0);
};
