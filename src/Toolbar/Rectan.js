import React, { useRef } from "react";
import { Rect } from "react-konva";

const Rectan = (props) => {

    const setDraggableRectRef = useRef(null);

    const rectOnDragEndHandler = (e) => {
        let name = "rectangle" + props.rectName;
        let toSend = {
          x: e.target.x(),
          y: e.target.y(),
          width: 35,
          height: 35,
          stroke: "gray",
          strokeWidth: 1.5,
          rotation: 0,
          name: name,
          ref: name,
          fill: "white",
          useImage: false,
        };
        props.appendToRectangles(toSend);
        let rect = setDraggableRectRef.current;
        rect.position({
          x: 1185,
          y: 180,
        });
      };

  return (
    <>
      <Rect
        width={35}
        height={35}
        stroke="gray"
        strokeWidth={1.5}
        x={1185}
        y={180}
        fill="white"
      />
      <Rect
        width={35}
        height={35}
        stroke="gray"
        strokeWidth={1.5}
        x={1185}
        y={180}
        draggable
        fill="white"
        ref={setDraggableRectRef}
        onDragEnd={rectOnDragEndHandler}
      />
    </>
  );
};

export default Rectan;
