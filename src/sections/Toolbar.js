import React from "react";
import { ToolbarCard, Arrows, Circle, Rectan, Texts } from "../Toolbar/index";

const Toolbar = (props) => {
  return (
    <>
      <ToolbarCard />
      <Circle
        ellipseName={props.ellipseName}
        appendToEllipses={props.appendToEllipses}
      />
      <Rectan
        rectName={props.rectName}
        appendToRectangles={props.appendToRectangles}
      />
      <Texts textName={props.textName} appendToTexts={props.appendToTexts} />
      <Arrows layer={props.layer} newArrowOnDragEnd={props.newArrowOnDragEnd} />
    </>
  );
};

export default Toolbar;
