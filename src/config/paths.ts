import { tmpdir } from "os";
import { join } from "path";

export const tempPath = join(tmpdir(), "movie-synopsis-creator");
export const renderPath = join(tempPath, "render");
export const dataPath = join(tempPath, "data");
export const assetsPath = join(__dirname, "..", "assets");
