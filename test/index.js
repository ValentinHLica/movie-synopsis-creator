const { execFileSync } = require("child_process");
const { unlinkSync } = require("fs");
const { join } = require("path");

const addSubtitle = () => {
  const exportPath = __dirname;

  // Add Subtitles
  const font = {
    text: `'Hello World'`,
    x: "(w-text_w)/2",
    y: "(h-text_h - 20)",
    // C:\Users\licav\Desktop\Dev\movie-synopsis-creator\test\Helvetica.ttf
    // C\:\\Windows\\Fonts\\arial.ttf
    // C\:\\Users\\licav\\Desktop\\Dev\\movie-synopsis-creator\\test\\Helvetica.ttf
    font: `'${join(__dirname, "Helvetica.ttf")
      .split("\\")
      .join("/")
      .split(":")
      .join("\\\\:")}'`,
    fontsize: 24,
    boxcolor: "0x161616",
    fontcolor: "0xF1BE71",
  };

  // text='hrllo world':x=640:y=360:fontsize=24:fontcolor=white

  const drawtext = Object.keys(font)
    .map((key) => `${key}=${font[key]}`)
    .join(":");

  console.log(drawtext);

  //   return;

  const subArgs = [
    "-i",
    join(exportPath, "clipVideo.mp4"),
    "-vf",
    `drawtext=${drawtext}`,
    "-c:a",
    "copy",
    join(exportPath, "clip.mp4"),
  ];

  try {
    execFileSync("ffmpeg", subArgs, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

addSubtitle();
