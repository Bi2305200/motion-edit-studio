import React from "react";
import { AbsoluteFill } from "remotion";
import { FontLoader } from "./components/FontLoader";
import { HC } from "./horror/common";
import { Captions, Cinematic, Hud } from "./horror/overlays";
import {
  SceneHook,
  SceneListing,
  SceneBuilding,
  SceneNights,
  SceneKnock,
  SceneShaft,
  SceneHand,
  SceneMorning,
  SceneEnd,
} from "./horror/scenes";

export const HorrorStory: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: HC.bg, overflow: "hidden" }}>
      <FontLoader />
      <SceneHook />
      <SceneListing />
      <SceneBuilding />
      <SceneNights />
      <SceneKnock />
      <SceneShaft />
      <SceneHand />
      <SceneMorning />
      <SceneEnd />
      <Captions />
      <Cinematic />
      <Hud />
    </AbsoluteFill>
  );
};
