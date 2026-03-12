import { Composition } from "remotion";
import { CricketVideo } from "./CricketVideo";

import dailyContent from "../content/daily.json";

const FPS = 30;
const SECONDS_PER_FACT = 5;
const HOOK_SECONDS = 3;
const OUTRO_SECONDS = 3;

const totalDuration =
  HOOK_SECONDS +
  dailyContent.facts.length * SECONDS_PER_FACT +
  OUTRO_SECONDS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CricketShorts"
        component={CricketVideo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          content: dailyContent,
          fps: FPS,
          secondsPerFact: SECONDS_PER_FACT,
          hookSeconds: HOOK_SECONDS,
          outroSeconds: OUTRO_SECONDS,
        }}
      />
    </>
  );
};
