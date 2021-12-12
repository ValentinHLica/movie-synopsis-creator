import generateAudio from "./audio/index";
import generateClips from "./video/index";

import { resetTemp } from "./utils/helpers";

const renderVideo = async () => {
  // console.time("Render");

  // Reset temp
  await resetTemp();

  // Generate audio file for each comment
  await generateAudio();

  // Generate Clips
  await generateClips();

  // Reset temp
  // await resetTemp();

  // console.timeEnd("Render");
};

renderVideo();
