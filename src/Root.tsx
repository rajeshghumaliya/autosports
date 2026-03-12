import { Composition } from "remotion";
import { CricketVideo, CricketVideoProps } from "./CricketVideo";

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

// Default calculation for the preview (CLI overrides this via getInputProps / calculateMetadata)
const items = contentData.facts || contentData.segments || [];
const defaultDuration = HOOK_SECONDS + items.length * SECONDS_PER_FACT + OUTRO_SECONDS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CricketShorts"
        component={CricketVideo as any}
        durationInFrames={defaultDuration * FPS}
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
        calculateMetadata={({ props }: { props: any }) => {
          let durationInFrames = defaultDuration * FPS;
          if (props.audioTimings?.totalDuration) {
            durationInFrames = Math.ceil(props.audioTimings.totalDuration + 1) * FPS;
          } else if (props.content) {
            const propItems = props.content.facts || props.content.segments || [];
            durationInFrames = (HOOK_SECONDS + propItems.length * SECONDS_PER_FACT + OUTRO_SECONDS) * FPS;
          }
          return {
            durationInFrames,
            props,
          };
        }}
      />
    </>
  );
};
