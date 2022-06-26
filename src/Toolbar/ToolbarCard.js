import React from "react";
import { Rect } from "react-konva";

const ToolbarCard = () => (
  <Rect
    y={60}
    x={1100}
    width={200}
    height={350}
    fill="white"
    shadowBlur={15}
    shadowColor="lightgray"
  />
);

export default ToolbarCard;