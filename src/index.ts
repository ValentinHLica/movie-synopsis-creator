import generateAudio from "./audio/index";
import { resetTemp } from "./utils/helpers";

const renderVideo = async () => {
  // console.time("Render");

  // Reset temp
  await resetTemp();

  // Generate audio file for each comment
  await generateAudio();

  // Generate video
  //   await generateVideo(measureText);

  // Reset temp
  // await resetTemp();

  // console.timeEnd("Render");
};

renderVideo();
