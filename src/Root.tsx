import React from "react";
import { Composition } from "remotion";
import { MotionShowcase } from "./Composition";
import { W, H, FPS, TOTAL_FRAMES, SCENES } from "./lib";
import { FontLoader } from "./components/FontLoader";
import { Scene1Brutalist } from "./scenes/Scene1Brutalist";
import { Scene2Kinetic } from "./scenes/Scene2Kinetic";
import { Scene3SpotifyUI } from "./scenes/Scene3SpotifyUI";
import { Scene4Explainer } from "./scenes/Scene4Explainer";
import { StoryTactileCard, StoryTactileCardProps } from "./scenes/StoryTactileCard";
import { HorrorStory } from "./HorrorStory";
import { STORY } from "./storyTimeline";

const WithFonts = (Comp: React.FC): React.FC => () => (
  <>
    <FontLoader />
    <Comp />
  </>
);

const StoryCardWithFonts: React.FC<StoryTactileCardProps & { durationSec?: number }> = (props) => (
  <>
    <FontLoader />
    <StoryTactileCard {...props} />
  </>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HorrorStory"
        component={HorrorStory}
        durationInFrames={Math.ceil(STORY.total * STORY.fps)}
        fps={STORY.fps}
        width={W}
        height={H}
      />
      <Composition
        id="MotionShowcase"
        component={MotionShowcase}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene1Brutalist"
        component={WithFonts(Scene1Brutalist)}
        durationInFrames={Math.round(SCENES.scene1.duration * FPS)}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene2Kinetic"
        component={WithFonts(Scene2Kinetic)}
        durationInFrames={Math.round(SCENES.scene2.duration * FPS)}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene3SpotifyUI"
        component={WithFonts(Scene3SpotifyUI)}
        durationInFrames={Math.round(SCENES.scene3.duration * FPS)}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene4Explainer"
        component={WithFonts(Scene4Explainer)}
        durationInFrames={Math.round(SCENES.scene4.duration * FPS)}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="StoryCard16x9"
        component={StoryCardWithFonts}
        durationInFrames={180}
        fps={FPS}
        width={1920}
        height={1080}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(30, Math.round(((props as { durationSec?: number }).durationSec || 4.5) * FPS)),
        })}
        defaultProps={{ durationSec: 4.5 }}
      />
      <Composition
        id="StoryCard9x16"
        component={StoryCardWithFonts}
        durationInFrames={180}
        fps={FPS}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(30, Math.round(((props as { durationSec?: number }).durationSec || 4.5) * FPS)),
        })}
        defaultProps={{ durationSec: 4.5 }}
      />
    </>
  );
};
