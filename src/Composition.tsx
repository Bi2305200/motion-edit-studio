import React from "react";
import { AbsoluteFill, useCurrentFrame, Sequence } from "remotion";
import { FPS, SCENES } from "./lib";
import { FontLoader } from "./components/FontLoader";
import { Grain } from "./components/primitives";
import { Scene1Brutalist } from "./scenes/Scene1Brutalist";
import { Scene2Kinetic } from "./scenes/Scene2Kinetic";
import { Scene3SpotifyUI } from "./scenes/Scene3SpotifyUI";
import { Scene4Explainer } from "./scenes/Scene4Explainer";

export const MotionShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090B" }}>
      <FontLoader />

      {/* Scene 1: 0.0s - 3.6s (108 frames) */}
      <Sequence
        from={Math.round(SCENES.scene1.start * FPS)}
        durationInFrames={Math.round(SCENES.scene1.duration * FPS)}
      >
        <Scene1Brutalist />
      </Sequence>

      {/* Scene 2: 3.6s - 7.4s (114 frames) */}
      <Sequence
        from={Math.round(SCENES.scene2.start * FPS)}
        durationInFrames={Math.round(SCENES.scene2.duration * FPS)}
      >
        <Scene2Kinetic />
      </Sequence>

      {/* Scene 3: 7.4s - 11.4s (120 frames) */}
      <Sequence
        from={Math.round(SCENES.scene3.start * FPS)}
        durationInFrames={Math.round(SCENES.scene3.duration * FPS)}
      >
        <Scene3SpotifyUI />
      </Sequence>

      {/* Scene 4: 11.4s - 15.0s (108 frames) */}
      <Sequence
        from={Math.round(SCENES.scene4.start * FPS)}
        durationInFrames={Math.round(SCENES.scene4.duration * FPS)}
      >
        <Scene4Explainer />
      </Sequence>

      {/* Subtle studio film grain */}
      <Grain frame={frame} opacity={0.04} />
    </AbsoluteFill>
  );
};
