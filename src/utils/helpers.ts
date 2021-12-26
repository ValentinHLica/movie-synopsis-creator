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

import { dataPath, renderPath } from "../config/paths";
import { Arguments, MovieData } from "../interfaces/utils";

/**
 * Create Random String
 */
export const createRandomString = (size: number) =>
  (Math.random() + 1).toString(36).substring(size || 7);

/**
 * List all files and folders inside folder
 * @param path Folder path
 * @returns List of files and folders inside folder
 */
export const getFolders = (path: string | null): string[] => {
  const files: string[] = readdirSync(path) ?? [];

  const filesList: string[] = [];

  for (const file of files) {
    const index = parseInt(file.split("-")[0], 10);
    filesList[index] = file;
  }

  return filesList.filter((item) => !item.includes(".json"));
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

/**
 * Get Aspect Ratio for images
 */
export const getAspectRatio = async (width: number, height: number) => {
  return height == 0 ? width : getAspectRatio(height, width % height);
};

/**
 * Convert sentence to time
 */
export const countWords = (sentence: string): number => {
  const words = sentence.split(" ");
  return parseFloat((words.length / 170).toFixed(1).replace(".0", ""));
};

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
 * Parse Time Format 00:01:01 into seconds
 */
export const parseTime = (time: string): number => {
  const timer = time.split(":");
  let timeCount = 0;

  for (let i = 0; i < timer.length; i++) {
    const time = timer[i];

    switch (i) {
      case 0:
        timeCount += Number(time) * 3600; // Hours
        break;

      case 1:
        timeCount += Number(time) * 60; // Minutes
        break;

      case 2:
        timeCount += parseFloat(time.replace(",", ".")); // Seconds
        break;
    }
  }

  return timeCount;
};

/**
 * Get Subtitle duration
 */
export const getDuration = (subtitlePath: string) => {
  const subtitle = readFileSync(join(subtitlePath, "subtitle.srt")).toString();

  const arr = subtitle
    .trim()
    .split("\r\n")
    .filter((e) => e !== "");

  const time = arr[arr.length - 2].split("-->").map((e) => e.trim());

  return time[1].replace(",", ".");
};

/**
 * Get Movie data
 */
export const getMovie = (firstLoad?: boolean) => {
  const { moviePath, timeStamps, exportPath, title, categories } = JSON.parse(
    readFileSync(getArgument("MOVIE")).toString()
  ) as MovieData;

  const newTimeStamps = timeStamps
    .filter((e) => !(e.startTime === "" || e.text === ""))
    .map((e, index) => ({ ...e, id: index }));

  if (firstLoad) {
    console.log(`process-count=${newTimeStamps.length * 2}`);
  }

  return {
    moviePath,
    timeStamps: newTimeStamps,
    exportPath,
    title,
    categories,
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

  return workSpreed;
};
