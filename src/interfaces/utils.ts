export type Arguments =
  | "BALCON"
  | "FFMPEG"
  | "FFPROBE"
  | "MOVIE"
  | "VOICE"
  | "SUBTITLE";

export type TimeStamp = {
  text: string;
  startTime: string;
  id: number;
};

export type MovieData = {
  moviePath: string;
  timeStamps: TimeStamp[];
  exportPath: string;
  title: string;
  categories: string[];
};
