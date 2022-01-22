import { tmpdir } from "os";
import { join } from "path";

type FileId = (id: string | number) => string;

export const tempPath = join(tmpdir(), "movie-synopsis-creator");
export const renderPath = join(tempPath, "render");
export const dataPath = join(tempPath, "data");
export const assetsPath = join(__dirname, "..", "assets");
export const imagePath: FileId = (id) => join(renderPath, `${id}-image.png`);
export const textPath: FileId = (id) => join(renderPath, `${id}-text.txt`);
export const audioPath: FileId = (id) => join(renderPath, `${id}-text.mp3`);
export const clipPath: FileId = (id) => join(renderPath, `${id}-clip.mp4`);
export const clipVideoPath: FileId = (id) =>
  join(renderPath, `${id}-clip-video.mp4`);
export const videoPath: FileId = (id) => join(renderPath, `${id}-video.mp4`);
