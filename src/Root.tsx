import { Composition } from "remotion";
import { CricketVideo } from "./CricketVideo";

// Try styled.json first (AI-enriched), fall back to daily.json
let contentData: any;
try {
  contentData = require("../content/styled.json");
} catch {
  contentData = require("../content/daily.json");
}

const FPS = 60;
const SECONDS_PER_FACT = 5;
const HOOK_SECONDS = 3;
const OUTRO_SECONDS = 3;

const totalDuration =
  HOOK_SECONDS +
  contentData.facts.length * SECONDS_PER_FACT +
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
          content: contentData,
          fps: FPS,
          secondsPerFact: SECONDS_PER_FACT,
          hookSeconds: HOOK_SECONDS,
          outroSeconds: OUTRO_SECONDS,
        }}
      />
    </>
  );
};
