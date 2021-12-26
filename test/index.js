// const { execFileSync } = require("child_process");
// const { unlinkSync } = require("fs");
// const { join } = require("path");

// const addSubtitle = () => {
//   const exportPath = __dirname;

//   // Add Subtitles
//   const font = {
//     text: `'Hello World'`,
//     x: "(w-text_w)/2",
//     y: "(h-text_h - 20)",
//     // C:\Users\licav\Desktop\Dev\movie-synopsis-creator\test\Helvetica.ttf
//     // C\:\\Windows\\Fonts\\arial.ttf
//     // C\:\\Users\\licav\\Desktop\\Dev\\movie-synopsis-creator\\test\\Helvetica.ttf
//     font: `'${join(__dirname, "Helvetica.ttf")
//       .split("\\")
//       .join("/")
//       .split(":")
//       .join("\\\\:")}'`,
//     fontsize: 24,
//     boxcolor: "0x161616",
//     fontcolor: "0xF1BE71",
//   };

//   // text='hrllo world':x=640:y=360:fontsize=24:fontcolor=white

//   const drawtext = Object.keys(font)
//     .map((key) => `${key}=${font[key]}`)
//     .join(":");

//   console.log(drawtext);

//   //   return;

//   const subArgs = [
//     "-i",
//     join(exportPath, "clipVideo.mp4"),
//     "-vf",
//     `drawtext=${drawtext}`,
//     "-c:a",
//     "copy",
//     join(exportPath, "clip.mp4"),
//   ];

//   try {
//     execFileSync("ffmpeg", subArgs, { stdio: "pipe" });
//   } catch (error) {
//     console.log(error);
//   }
// };

// addSubtitle();
const { join } = require("path");

const Jimp = require("jimp");

const createOutro = async () => {
  const outroPath = __dirname;
  const assetsPath = join(__dirname, "..", "build", "assets");
  const width = 1408;
  const height = 1024;

  const image = new Jimp(width, height, "#eeeeed");
  const logoImage = await Jimp.read(join(assetsPath, "images", "logo.png"));
  const resize = 250;
  const logo = logoImage.resize(resize, resize);
  const font = await Jimp.loadFont(
    join(assetsPath, "font", "outro", "outro.fnt")
  );

  const outroText = `Thank you for watching`;
  const outroTextWidth = Jimp.measureText(font, outroText);
  const outroTextHeight = Jimp.measureTextHeight(
    font,
    outroText,
    outroTextWidth + 100
  );

  const gropWidth = outroTextWidth + resize;

  image.composite(logo, width / 2 - gropWidth / 2, 20);
  image.print(
    font,
    width / 2 - gropWidth / 2 + resize,
    resize / 2 - outroTextHeight / 2 + 10,
    outroText
  );

  const imagePath = join(outroPath, "image.png");
  await image.writeAsync(imagePath);
};

createOutro();
