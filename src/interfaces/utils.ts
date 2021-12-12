export type Arguments = "BALCON" | "FFMPEG" | "MOVIE" | "VOICE";

export type TimeStamp = {
  text: string;
  startTime: string;
  id: number;
};

export type MovieData = {
  moviePath: string;
  timeStamps: TimeStamp[];
  exportPath: string;
};
