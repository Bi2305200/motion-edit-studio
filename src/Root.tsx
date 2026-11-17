import React from "react";
import { Composition } from "remotion";
import { MotionShowcase } from "./Composition";
import { W, H, FPS, TOTAL_FRAMES, SCENES } from "./lib";
import { FontLoader } from "./components/FontLoader";
import { Scene1Brutalist } from "./scenes/Scene1Brutalist";
import { Scene2Kinetic } from "./scenes/Scene2Kinetic";
import { Scene3SpotifyUI } from "./scenes/Scene3SpotifyUI";
import { Scene4Explainer } from "./scenes/Scene4Explainer";

const WithFonts = (Comp: React.FC): React.FC => () => (
  <>
    <FontLoader />
    <Comp />
  </>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
