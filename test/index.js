// // const { execFileSync } = require("child_process");
// // const { unlinkSync } = require("fs");
// // const { join } = require("path");

const { execSync } = require("child_process");

// // const addSubtitle = () => {
// //   const exportPath = __dirname;

// //   // Add Subtitles
// //   const font = {
// //     text: `'Hello World'`,
// //     x: "(w-text_w)/2",
// //     y: "(h-text_h - 20)",
// //     // C:\Users\licav\Desktop\Dev\movie-synopsis-creator\test\Helvetica.ttf
// //     // C\:\\Windows\\Fonts\\arial.ttf
// //     // C\:\\Users\\licav\\Desktop\\Dev\\movie-synopsis-creator\\test\\Helvetica.ttf
// //     font: `'${join(__dirname, "Helvetica.ttf")
// //       .split("\\")
// //       .join("/")
// //       .split(":")
// //       .join("\\\\:")}'`,
// //     fontsize: 24,
// //     boxcolor: "0x161616",
// //     fontcolor: "0xF1BE71",
// //   };

// //   // text='hrllo world':x=640:y=360:fontsize=24:fontcolor=white

// //   const drawtext = Object.keys(font)
// //     .map((key) => `${key}=${font[key]}`)
// //     .join(":");

// //   console.log(drawtext);

// //   //   return;

// //   const subArgs = [
// //     "-i",
// //     join(exportPath, "clipVideo.mp4"),
// //     "-vf",
// //     `drawtext=${drawtext}`,
// //     "-c:a",
// //     "copy",
// //     join(exportPath, "clip.mp4"),
// //   ];

// //   try {
// //     execFileSync("ffmpeg", subArgs, { stdio: "pipe" });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // addSubtitle();
// const { join } = require("path");

// const Jimp = require("jimp");

// const createOutro = async () => {
//   const outroPath = __dirname;
//   const assetsPath = join(__dirname, "..", "build", "assets");
//   const width = 1920;
//   const height = 1080;

//   const image = new Jimp(width, height, "#eeeeed");
//   const font = await Jimp.loadFont(
//     join(assetsPath, "font", "outro", "outro.fnt")
//   );
//   const outroText = `Thank you for watching`;
//   const outroTextWidth = Jimp.measureText(font, outroText);

//   image.print(font, width / 2 - outroTextWidth / 2, 150, outroText);

//   const imagePath = join(outroPath, "image.png");
//   await image.writeAsync(imagePath);
// };

// createOutro();

const voices = execSync(`bal4web -s m -m`).toString();

const listOfVoice = voices
  .trim()
  .split("\n")
  .map((v) => v.trim())
  .filter((v) => v !== "* Microsoft Azure *" && v.includes("en-US"))[0]
  .split(" en-US ")[1]
  .slice(1, -1)
  .split(", ");

console.log(listOfVoice);
