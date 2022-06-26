import React, { useRef } from "react";
import { Ellipse } from "react-konva";

const Circle = (props) => {
  const setDraggableEllipseRef = useRef(null);

  const ellipseOnDragEndHandler = (e) => {
    let name = "ellipse" + props.ellipseName;
    let toSend = {
      x: e.target.x(),
      y: e.target.y(),
      radiusX: 20,
      radiusY: 20,
      stroke: "gray",
      strokeWidth: 1.5,
      name: name,
      fill: "white",
      ref: name,
      rotation: 0,
    };
    props.appendToEllipses(toSend);
    let ellipse = setDraggableEllipseRef.current;
    ellipse.position({
      x: 1200,
      y: 125,
    });
  };

  return (
    <>
      <Ellipse
        radiusX={20}
        radiusY={20}
        stroke="gray"
        strokeWidth={1.5}
        x={1200}
        y={125}
      />
      <Ellipse
        radiusX={20}
        radiusY={20}
        stroke="gray"
        strokeWidth={1.5}
        x={1200}
        y={125}
        draggable
        ref={setDraggableEllipseRef}
        onDragEnd={ellipseOnDragEndHandler}
      />
    </>
  );
};

export default Circle;
