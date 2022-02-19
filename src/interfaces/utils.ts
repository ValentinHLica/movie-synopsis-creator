export type Arguments = "MOVIE";

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
  voice: string | null;
  cli: {
    ffprobe: string | null;
    ffmpeg: string | null;
    balcon: string | null;
    bal4web: string | null;
  };
  customAudio: boolean;
  intro: string | null;
  outro: string | null;
  outroImage: string | null;
};
