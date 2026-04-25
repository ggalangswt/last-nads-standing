import React from "react";
import {Composition} from "remotion";
import {LastNadsStandingPromo} from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LastNadsStandingPromo"
        component={LastNadsStandingPromo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
