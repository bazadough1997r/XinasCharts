import React, { useRef } from "react";
import { Arrow } from "react-konva";

const Arrows = (props) => {
  const setDraggableArrowRef = useRef(null);

  const arrowOnDragMoveHandler = () => props.layer.draw();

  const arrowOnDragStart = () => {
    setDraggableArrowRef.current.setAttr("fill", "grey");
    setDraggableArrowRef.current.setAttr("stroke", "grey");
  };

  const arrowOnDragEndHandler = () => {
    let pos = props.layer.getStage().getPointerPosition();
    let shape = props.layer.getIntersection(pos);
    if (
      shape &&
      shape.attrs.id === undefined &&
      !shape.attrs.name.includes("arrow")
    ) {
      let toSend = {
        x: pos.x,
        y: pos.y,
        points: [20, 475, 60, 475],
        from: shape,
        stroke: "gray",
        strokeWidth: "1.5",
        fill: "gray",
      };
      props.newArrowOnDragEnd(toSend);
    } else {
      let toSend = {
        x: pos.x,
        y: pos.y,
        points: [20, 475, 60, 475],
        stroke: "gray",
        strokeWidth: "1.5",
        fill: "gray",
      };
      props.newArrowOnDragEnd(toSend);
    }
    let arrow = setDraggableArrowRef.current;
    arrow.position({ x: 0, y: 0 });
    arrow.setAttr("fill", "gray");
    arrow.setAttr("stroke", "gray");
    arrow.draw();
  };

  return (
    <>
      <Arrow points={[1250, 270, 1160, 270]} fill="gray" stroke="gray" />
      <Arrow
        points={[1250, 270, 1160, 270]}
        fill="gray"
        stroke="gray"
        ref={setDraggableArrowRef}
        name="draggableArrow"
        draggable
        onDragStart={arrowOnDragStart}
        onDragMove={arrowOnDragMoveHandler}
        onDragEnd={arrowOnDragEndHandler}
      />
    </>
  );
};

export default Arrows;
