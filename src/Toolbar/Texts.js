import React, { useRef } from "react";
import { Text } from "react-konva";

const Texts = (props) => {

    const setDraggableTextRef = useRef(null);

    const textOnDragEndHandler = (e) => {
        let name = "text" + props.textName;
        let ref = "text" + props.textName;
        let toSend = {
          x: e.target.x(),
          y: e.target.y(),
          fontSize: 25,
          fontFamily: "Belgrano",
          ref: ref,
          name: name,
          text: "",
          fill: "black",
          width: 300,
          height: 25,
          rotation: 0,
          textWidth: setDraggableTextRef.current.textWidth,
          textHeight: setDraggableTextRef.current.textHeight,
        };
        props.appendToTexts(toSend);
        let text = setDraggableTextRef.current;
        text.position({
          x: 1190,
          y: 320,
        });
      };

  return (
    <>
      <Text
        fontSize={40}
        text="T"
        fontFamily="Belgrano"
        x={1190}
        y={320}
        stroke="gray"
        fill="gray"
      />
      <Text
        fontSize={40}
        text="T"
        fontFamily="Belgrano"
        stroke="gray"
        fill="gray"
        x={1190}
        y={320}
        draggable
        ref={setDraggableTextRef}
        onDragEnd={textOnDragEndHandler}
      />
    </>
  );
};

export default Texts;
