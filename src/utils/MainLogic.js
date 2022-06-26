import React, { Component } from "react";
import { Stage, Layer, Rect, Ellipse, Text, Arrow } from "react-konva";
import Toolbar from "../sections/Toolbar.js";
import Transformers from "./Transformers.js";

let history = [];
let historyStep = 0;

export default class MainLogic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layerX: 0,
      layerY: 0,
      layerScale: 1,
      selectedShapeName: "",
      rectangles: [],
      ellipses: [],
      texts: [],
      arrows: [],
      currentTextRef: "",
      shouldTextUpdate: true,
      textX: 0,
      textY: 0,
      textEditVisible: false,
      newArrowRef: "",
      isTransforming: false,
      isPasteDisabled: false,
      ellipseDeleteCount: 0,
      arrowDeleteCount: 0,
      textDeleteCount: 0,
      rectDeleteCount: 0,
    };
  }

  setGraphicStageRef = (element) => {
    this.graphicStage = element;
  };

  setTextareaRef = (element) => {
    this.textarea = element;
  };

  setLayerRef = (element) => {
    this.layer = element;
  };

  setLayer2Ref = (element) => {
    this.layer2 = element;
  };

  handleStageClick = () => {
    let pos = this.layer2.getStage().getPointerPosition();
    let shape = this.layer2.getIntersection(pos);
    if (
      shape !== null &&
      shape.name() !== undefined &&
      shape !== undefined &&
      shape.name() !== undefined
    ) {
      this.setState(
        {
          selectedShapeName: shape.name(),
        },
        () => {
          this.graphicStage.draw();
        }
      );
    }
    if (this.state.newArrowRef !== "") {
      if (this.state.previousShape) {
        if (this.state.previousShape.attrs.id !== "ContainerRect") {
          this.state.arrows.map((eachArrow) => {
            if (eachArrow.name === this.state.newArrowRef) {
              eachArrow.to = this.state.previousShape;
            }
          });
        }
      }
      this.state.arrows.map((eachArrow) => {
        if (eachArrow.name === this.state.newArrowRef) {
          eachArrow.fill = "black";
          eachArrow.stroke = "black";
        }
      });
      this.setState({
        arrowDraggable: false,
        newArrowRef: "",
      });
    }
  };

  handleMouseOver = () => {
    let pos = this.graphicStage.getPointerPosition();
    let shape = this.graphicStage.getIntersection(pos);
    if (shape && shape.attrs.link) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
    if (this.state.newArrowRef !== "") {
      let transform = this.layer2.getAbsoluteTransform().copy();
      transform.invert();
      pos = transform.point(pos);
      this.setState({ arrowEndX: pos.x, arrowEndY: pos.y });
      if (shape && shape.attrs && shape.attrs.name !== undefined) {
        if (!shape.attrs.name.includes("arrow")) {
          if (this.state.previousShape)
            if (this.state.previousShape !== shape) {
              if (this.state.previousShape.attrs.id !== "ContainerRect") {
                this.state.arrows.map((eachArrow) => {
                  if (eachArrow.name === this.state.newArrowRef) {
                    eachArrow.fill = "black";
                    eachArrow.stroke = "black";
                  }
                });
                this.forceUpdate();
              } else {
                this.state.arrows.map((eachArrow) => {
                  if (eachArrow.name === this.state.newArrowRef) {
                    eachArrow.fill = "#ccf5ff";
                    eachArrow.stroke = "#ccf5ff";
                  }
                });
                this.forceUpdate();
              }
            }
        }
        if (!shape.attrs.name.includes("arrow")) {
          this.setState({ previousShape: shape });
        }
      }
    }
    let arrows = this.state.arrows;
    arrows.map((eachArrow) => {
      if (eachArrow.name === this.state.newArrowRef) {
        let index = arrows.indexOf(eachArrow);
        let currentArrow = eachArrow;
        currentArrow.points = [
          currentArrow.points[0],
          currentArrow.points[1],
          pos.x,
          pos.y,
        ];
        this.state.arrows[index] = currentArrow;
      }
    });
  };

  handleWheel(event) {
    if (
      this.state.rectangles.length === 0 &&
      this.state.ellipses.length === 0 &&
      this.state.texts.length === 0 &&
      this.state.arrows.length === 0
    ) {
    } else {
      event.evt.preventDefault();
      const scaleBy = 1.2;
      const stage = this.graphicStage;
      const layer = this.layer2;
      const oldScale = layer.scaleX();
      const mousePointTo = {
        x:
          stage.getPointerPosition().x / oldScale -
          this.state.layerX / oldScale,
        y:
          stage.getPointerPosition().y / oldScale -
          this.state.layerY / oldScale,
      };
      const newScale =
        event.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      layer.scale({ x: newScale, y: newScale });
      this.setState({
        layerScale: newScale,
        layerX:
          -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
          newScale,
        layerY:
          -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
          newScale,
      });
    }
  }

  componentDidUpdate(prevState) {
    let prevMainShapes = [
      prevState.rectangles,
      prevState.ellipses,
      prevState.arrows,
      prevState.texts,
    ];
    let currentMainShapes = [
      this.state.rectangles,
      this.state.ellipses,
      this.state.arrows,
      this.state.texts,
    ];
    if (!this.state.redoing && !this.state.isTransforming)
      if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
        if (
          JSON.stringify(prevMainShapes) !== JSON.stringify(currentMainShapes)
        ) {
          if (this.state.shouldTextUpdate) {
            let uh = history;
            history = uh.slice(0, historyStep + 1);
            let toAppend = this.state;
            history = history.concat(toAppend);
            historyStep += 1;
          }
        }
      }
    this.setState.redoing = false;
  }

  handleUndo = () => {
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === 0) {
          return;
        }
        historyStep -= 1;
        this.setState(
          {
            rectangles: history[historyStep].rectangles,
            arrows: history[historyStep].arrows,
            ellipses: history[historyStep].ellipses,
            texts: history[historyStep].texts,
            redoing: true,
            selectedShapeName: this.shapeIsGone(history[historyStep])
              ? ""
              : this.state.selectedShapeName,
          },
          () => {
            this.graphicStage.draw();
          }
        );
      }
    }
  };

  handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    historyStep += 1;
    const next = history[historyStep];
    this.setState(
      {
        rectangles: next.rectangles,
        arrows: next.arrows,
        ellipses: next.ellipses,
        texts: next.texts,
        redoing: true,
        selectedShapeName: this.shapeIsGone(history[historyStep])
          ? ""
          : this.state.selectedShapeName,
      },
      () => {
        this.forceUpdate();
      }
    );
  };

  shapeIsGone = (returnTo) => {
    let toReturn = true;
    let currentShapeName = this.state.selectedShapeName;
    let [rectangles, ellipses, arrows, texts] = [
      returnTo.rectangles,
      returnTo.ellipses,
      returnTo.arrows,
      returnTo.texts,
    ];
    rectangles.map((eachRect) => {
      if (eachRect.name === currentShapeName) {
        toReturn = false;
      }
    });
    ellipses.map((eachEllipse) => {
      if (eachEllipse.name === currentShapeName) {
        toReturn = false;
      }
    });
    arrows.map((eachArrow) => {
      if (eachArrow.name === currentShapeName) {
        toReturn = false;
      }
    });
    texts.map((eachText) => {
      if (eachText.name === currentShapeName) {
        toReturn = false;
      }
    });
    return toReturn;
  };

  async componentDidMount() {
    history.push(this.state);
    this.setState({ selectedShapeName: "" });
  }

  onKeyDownHandler = (event) => {
    const x = 88,
      deleteKey = 46,
      z = 90,
      y = 89;
    if (
      ((event.ctrlKey && event.keyCode === x) || event.keyCode === deleteKey) &&
      !this.state.isPasteDisabled
    ) {
      if (this.state.selectedShapeName !== "") {
        let that = this;
        let name = this.state.selectedShapeName;
        let rects = this.state.rectangles.filter(function(eachRect) {
          if (eachRect.name === name) {
            that.setState({
              rectDeleteCount: that.state.rectDeleteCount + 1,
            });
          }
          return eachRect.name !== name;
        });
        let ellipses = this.state.ellipses.filter(function(eachRect) {
          if (eachRect.name === name) {
            that.setState({
              ellipseDeleteCount: that.state.ellipseDeleteCount + 1,
            });
          }
          return eachRect.name !== name;
        });
        let arrows = this.state.arrows.filter(function(eachRect) {
          if (eachRect.name === name) {
            that.setState({
              arrowDeleteCount: that.state.arrowDeleteCount + 1,
            });
          }
          return eachRect.name !== name;
        });
        let texts = this.state.texts.filter(function(eachRect) {
          if (eachRect.name === name) {
            that.setState({
              textDeleteCount: that.state.textDeleteCount + 1,
            });
          }
          return eachRect.name !== name;
        });
        this.setState({
          rectangles: rects,
          ellipses: ellipses,
          arrows: arrows,
          texts: texts,
          selectedShapeName: "",
        });
      }
    } else if (event.shiftKey && event.ctrlKey && event.keyCode === z) {
      this.handleRedo();
    } else if (event.ctrlKey && event.keyCode === z) {
      this.handleUndo();
    } else if (event.ctrlKey && event.keyCode === y) {
      this.handleRedo();
    }
  };

  onDragEndLayerHandler = () => {
    this.setState({
      layerX: this.layer2.x(),
      layerY: this.layer2.y(),
    });
  };

  rectMapping = () =>
    this.state.rectangles.map((eachRect, i) => {
      return (
        <Rect
          key={i}
          onClick={() => {
            let that = this;
            if (eachRect.link !== undefined && eachRect.link !== "") {
              this.setState(
                {
                  errMsg: "Links will not be opened in create mode",
                },
                () => {
                  setTimeout(function() {
                    that.setState({
                      errMsg: "",
                    });
                  }, 1000);
                }
              );
            }
          }}
          onTransformStart={() => {
            this.setState({
              isTransforming: true,
            });
            let rect = this.refs[eachRect.ref];
            rect.setAttr("lastRotation", rect.rotation());
          }}
          onTransform={() => {
            let rect = this.refs[eachRect.ref];

            rect.setAttr("lastRotation", rect.rotation());
          }}
          onTransformEnd={() => {
            this.setState({
              isTransforming: false,
            });
            let rect = this.refs[eachRect.ref];
            this.setState(
              (prevState) => ({
                errMsg: "",
                rectangles: prevState.rectangles.map((eachRect) =>
                  eachRect.name === rect.attrs.name
                    ? {
                        ...eachRect,
                        width: rect.width() * rect.scaleX(),
                        height: rect.height() * rect.scaleY(),
                        rotation: rect.rotation(),
                        x: rect.x(),
                        y: rect.y(),
                      }
                    : eachRect
                ),
              }),
              () => {
                this.forceUpdate();
              }
            );
            rect.setAttr("scaleX", 1);
            rect.setAttr("scaleY", 1);
          }}
          rotation={eachRect.rotation}
          ref={eachRect.ref}
          fill={eachRect.fill}
          name={eachRect.name}
          x={eachRect.x}
          y={eachRect.y}
          width={eachRect.width}
          height={eachRect.height}
          stroke={eachRect.stroke}
          strokeWidth={eachRect.strokeWidth}
          strokeScaleEnabled={false}
          draggable
          onDragMove={() => {
            this.state.arrows.map((eachArrow) => {
              if (eachArrow.from !== undefined) {
                if (eachRect.name === eachArrow.from.attrs.name) {
                  eachArrow.points = [
                    eachRect.x,
                    eachRect.y,
                    eachArrow.points[2],
                    eachArrow.points[3],
                  ];
                  this.forceUpdate();
                }
              }
              if (eachArrow.to !== undefined) {
                if (eachRect.name === eachArrow.to.attrs.name) {
                  eachArrow.points = [
                    eachArrow.points[0],
                    eachArrow.points[1],
                    eachRect.x,
                    eachRect.y,
                  ];
                  this.forceUpdate();
                }
              }
            });
          }}
          onDragEnd={(event) => {
            let shape = this.refs[eachRect.ref];
            this.setState((prevState) => ({
              rectangles: prevState.rectangles.map((eachRect) =>
                eachRect.name === shape.attrs.name
                  ? {
                      ...eachRect,
                      x: event.target.x(),
                      y: event.target.y(),
                    }
                  : eachRect
              ),
            }));
          }}
        />
      );
    });

  ellipseMapping = () =>
    this.state.ellipses.map((eachEllipse, i) => (
      <Ellipse
        key={i}
        ref={eachEllipse.ref}
        name={eachEllipse.name}
        x={eachEllipse.x}
        y={eachEllipse.y}
        rotation={eachEllipse.rotation}
        radiusX={eachEllipse.radiusX}
        radiusY={eachEllipse.radiusY}
        fill={eachEllipse.fill}
        stroke={eachEllipse.stroke}
        strokeWidth={eachEllipse.strokeWidth}
        strokeScaleEnabled={false}
        onClick={() => {
          let that = this;
          if (eachEllipse.link !== undefined && eachEllipse.link !== "") {
            this.setState(
              {
                errMsg: "Links will not be opened in create mode",
              },
              () => {
                setTimeout(function() {
                  that.setState({
                    errMsg: "",
                  });
                }, 1000);
              }
            );
          }
        }}
        onTransformStart={() => {
          this.setState({ isTransforming: true });
          let ellipse = this.refs[eachEllipse.ref];
          ellipse.setAttr("lastRotation", ellipse.rotation());
        }}
        onTransform={() => {
          let ellipse = this.refs[eachEllipse.ref];
          ellipse.setAttr("lastRotation", ellipse.rotation());
        }}
        onTransformEnd={() => {
          this.setState({ isTransforming: false });
          let ellipse = this.refs[eachEllipse.ref];
          this.setState((prevState) => ({
            errMsg: "",
            ellipses: prevState.ellipses.map((eachEllipse) =>
              eachEllipse.name === ellipse.attrs.name
                ? {
                    ...eachEllipse,

                    radiusX: ellipse.radiusX() * ellipse.scaleX(),
                    radiusY: ellipse.radiusY() * ellipse.scaleY(),
                    rotation: ellipse.rotation(),
                    x: ellipse.x(),
                    y: ellipse.y(),
                  }
                : eachEllipse
            ),
          }));
          ellipse.setAttr("scaleX", 1);
          ellipse.setAttr("scaleY", 1);
          this.forceUpdate();
        }}
        draggable
        onDragMove={() => {
          this.state.arrows.map((eachArrow) => {
            if (eachArrow.from !== undefined) {
              if (eachEllipse.name === eachArrow.from.attrs.name) {
                eachArrow.points = [
                  eachEllipse.x,
                  eachEllipse.y,
                  eachArrow.points[2],
                  eachArrow.points[3],
                ];
                this.forceUpdate();
                this.graphicStage.draw();
              }
            }

            if (eachArrow.to !== undefined) {
              if (eachEllipse.name === eachArrow.to.attrs.name) {
                eachArrow.points = [
                  eachArrow.points[0],
                  eachArrow.points[1],
                  eachEllipse.x,
                  eachEllipse.y,
                ];
                this.forceUpdate();
                this.graphicStage.draw();
              }
            }
          });
        }}
        onDragEnd={(event) => {
          let shape = this.refs[eachEllipse.ref];

          this.setState((prevState) => ({
            ellipses: prevState.ellipses.map((eachEllipse) =>
              eachEllipse.name === shape.attrs.name
                ? {
                    ...eachEllipse,
                    x: event.target.x(),
                    y: event.target.y(),
                  }
                : eachEllipse
            ),
          }));

          this.graphicStage.draw();
        }}
      />
    ));

  textMapping = () =>
    this.state.texts.map((eachText, i) => (
      <Text
        key={i}
        textDecoration={eachText.link ? "underline" : ""}
        onTransformStart={() => {
          let currentText = this.refs[this.state.selectedShapeName];
          currentText.setAttr("lastRotation", currentText.rotation());
        }}
        onTransform={() => {
          let currentText = this.refs[this.state.selectedShapeName];
          currentText.setAttr(
            "width",
            currentText.width() * currentText.scaleX()
          );
          currentText.setAttr("scaleX", 1);
          currentText.draw();
          currentText.setAttr("lastRotation", currentText.rotation());
        }}
        onTransformEnd={() => {
          let currentText = this.refs[this.state.selectedShapeName];
          this.setState((prevState) => ({
            errMsg: "",
            texts: prevState.texts.map((eachText) =>
              eachText.name === this.state.selectedShapeName
                ? {
                    ...eachText,
                    width: currentText.width(),
                    rotation: currentText.rotation(),
                    textWidth: currentText.textWidth,
                    textHeight: currentText.textHeight,
                    x: currentText.x(),
                    y: currentText.y(),
                  }
                : eachText
            ),
          }));
          currentText.setAttr("scaleX", 1);
          currentText.draw();
        }}
        link={eachText.link}
        width={eachText.width}
        fill={eachText.fill}
        name={eachText.name}
        ref={eachText.ref}
        rotation={eachText.rotation}
        fontFamily={eachText.fontFamily}
        fontSize={eachText.fontSize}
        x={eachText.x}
        y={eachText.y}
        text={eachText.text}
        draggable
        onDragMove={() => {
          this.state.arrows.map((eachArrow) => {
            if (eachArrow.from !== undefined) {
              if (eachText.name === eachArrow.from.attrs.name) {
                eachArrow.points = [
                  eachText.x,
                  eachText.y,
                  eachArrow.points[2],
                  eachArrow.points[3],
                ];
                this.forceUpdate();
              }
            }
            if (eachArrow.to !== undefined) {
              if (eachText.name === eachArrow.to.attrs.name) {
                eachArrow.points = [
                  eachArrow.points[0],
                  eachArrow.points[1],
                  eachText.x,
                  eachText.y,
                ];
                this.forceUpdate();
              }
            }
          });
        }}
        onDragEnd={(event) => {
          let shape = this.refs[eachText.ref];
          this.setState((prevState) => ({
            texts: prevState.texts.map((eachtext) =>
              eachtext.name === shape.attrs.name
                ? {
                    ...eachtext,
                    x: event.target.x(),
                    y: event.target.y(),
                  }
                : eachtext
            ),
          }));
        }}
        onClick={() => {
          let that = this;
          if (eachText.link !== undefined && eachText.link !== "") {
            this.setState(
              {
                errMsg: "Links will not be opened in create mode",
              },
              () => {
                setTimeout(function() {
                  that.setState({
                    errMsg: "",
                  });
                }, 1000);
              }
            );
          }
        }}
        onDblClick={() => {
          let stage = this.graphicStage;
          let text = stage.findOne("." + eachText.name);
          this.setState({
            textX: text.absolutePosition().x,
            textY: text.absolutePosition().y,
            textEditVisible: !this.state.textEditVisible,
            text: eachText.text,
            textNode: eachText,
            currentTextRef: eachText.ref,
            textareaWidth: text.textWidth,
            textareaHeight: text.textHeight,
            textareaFill: text.attrs.fill,
            textareaFontFamily: text.attrs.fontFamily,
            textareaFontSize: text.attrs.fontSize,
          });
          let textarea = this.textarea;
          textarea.focus();
          text.hide();
          let transformer = stage.findOne(".transformer");
          transformer.hide();
          this.layer2.draw();
        }}
      />
    ));

  arrowsMapping = () =>
    this.state.arrows.map((eachArrow, i) => {
      if (!eachArrow.from && !eachArrow.to) {
        return (
          <Arrow
            key={i}
            ref={eachArrow.ref}
            name={eachArrow.name}
            points={[
              eachArrow.points[0],
              eachArrow.points[1],
              eachArrow.points[2],
              eachArrow.points[3],
            ]}
            stroke={eachArrow.stroke}
            fill={eachArrow.fill}
            draggable
            onDragEnd={() => {
              let oldPoints = [
                eachArrow.points[0],
                eachArrow.points[1],
                eachArrow.points[2],
                eachArrow.points[3],
              ];
              let shiftX = this.refs[eachArrow.ref].attrs.x;
              let shiftY = this.refs[eachArrow.ref].attrs.y;
              let newPoints = [
                oldPoints[0] + shiftX,
                oldPoints[1] + shiftY,
                oldPoints[2] + shiftX,
                oldPoints[3] + shiftY,
              ];
              this.refs[eachArrow.ref].position({ x: 0, y: 0 });
              this.layer2.draw();
              this.setState((prevState) => ({
                arrows: prevState.arrows.map((eachArr) =>
                  eachArr.name === eachArrow.name
                    ? {
                        ...eachArr,
                        points: newPoints,
                      }
                    : eachArr
                ),
              }));
            }}
          />
        );
      }
    });

  transformers = () =>
    this.state.selectedShapeName.includes("text") ? (
      <Transformers selectedShapeName={this.state.selectedShapeName} />
    ) : (
      <Transformers selectedShapeName={this.state.selectedShapeName} />
    );

  newArrowOnDragEndHandler = (toPush) => {
    if (toPush.from !== undefined) {
      let transform = this.layer2.getAbsoluteTransform().copy();
      transform.invert();
      let uh = transform.point({
        x: toPush.x,
        y: toPush.y,
      });
      toPush.x = uh.x;
      toPush.y = uh.y;
      let newArrow = {
        points: toPush.points,
        ref:
          "arrow" +
          (this.state.arrows.length + 1 + this.state.arrowDeleteCount),
        name:
          "arrow" +
          (this.state.arrows.length + 1 + this.state.arrowDeleteCount),
        from: toPush.from,
        stroke: toPush.stroke,
        strokeWidth: toPush.strokeWidth,
        fill: toPush.fill,
      };

      this.setState((prevState) => ({
        arrows: [...prevState.arrows, newArrow],
        newArrowDropped: true,
        newArrowRef: newArrow.name,
        arrowEndX: toPush.x,
        arrowEndY: toPush.y,
      }));
    } else {
      let transform = this.layer2.getAbsoluteTransform().copy();
      transform.invert();
      let uh = transform.point({
        x: toPush.x,
        y: toPush.y,
      });
      toPush.x = uh.x;
      toPush.y = uh.y;
      let newArrow = {
        points: [toPush.x, toPush.y, toPush.x, toPush.y],
        ref:
          "arrow" +
          (this.state.arrows.length + 1 + this.state.arrowDeleteCount),
        name:
          "arrow" +
          (this.state.arrows.length + 1 + this.state.arrowDeleteCount),
        from: toPush.from,
        stroke: toPush.stroke,
        strokeWidth: toPush.strokeWidth,
        fill: toPush.fill,
      };
      this.setState((prevState) => ({
        arrows: [...prevState.arrows, newArrow],
        newArrowDropped: true,
        newArrowRef: newArrow.name,
        arrowEndX: toPush.x,
        arrowEndY: toPush.y,
      }));
    }
  };

  appendToRectanglesHandler = (stuff) => {
    let layer = this.layer2;
    let toPush = stuff;
    let transform = this.layer2.getAbsoluteTransform().copy();
    transform.invert();
    let pos = transform.point({
      x: toPush.x,
      y: toPush.y,
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState((prevState) => ({
      rectangles: [...prevState.rectangles, toPush],
      selectedShapeName: toPush.name,
    }));
  };

  appendToEllipsesHandler = (stuff) => {
    let layer = this.layer2;
    let toPush = stuff;
    let transform = this.layer2.getAbsoluteTransform().copy();
    transform.invert();
    let pos = transform.point({
      x: toPush.x,
      y: toPush.y,
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState((prevState) => ({
      ellipses: [...prevState.ellipses, toPush],
      selectedShapeName: toPush.name,
    }));
  };

  appendToTextsHandler = (stuff) => {
    let layer = this.layer2;
    let toPush = stuff;
    let transform = this.layer2.getAbsoluteTransform().copy();
    transform.invert();
    let pos = transform.point({
      x: toPush.x,
      y: toPush.y,
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState((prevState) => ({
      texts: [...prevState.texts, toPush],
    }));
    let text = this.refs[toPush.ref];
    text.fire("dblclick");
  };

  textareaOnChangeHandler = (e) => {
    this.setState({
      text: e.target.value,
      shouldTextUpdate: false,
    });
  };

  textareaOnKeyDownHandler = (e) => {
    if (e.keyCode === 13) {
      this.setState({
        textEditVisible: false,
        shouldTextUpdate: true,
      });
      let node = this.refs[this.state.currentTextRef];
      let name = node.attrs.name;
      this.setState(
        (prevState) => ({
          selectedShapeName: name,
          texts: prevState.texts.map((eachText) =>
            eachText.name === name
              ? {
                  ...eachText,
                  text: this.state.text,
                }
              : eachText
          ),
        }),
        () => {
          this.setState((prevState) => ({
            texts: prevState.texts.map((eachText) =>
              eachText.name === name
                ? {
                    ...eachText,
                    textWidth: node.textWidth,
                    textHeight: node.textHeight,
                  }
                : eachText
            ),
          }));
        }
      );
      node.show();
      this.graphicStage.findOne(".transformer").show();
    }
  };

  textareaOnBlurHandler = () => {
    this.setState({
      textEditVisible: false,
      shouldTextUpdate: true,
    });
    let node = this.graphicStage.findOne("." + this.state.currentTextRef);
    let name = node.attrs.name;
    this.setState(
      (prevState) => ({
        selectedShapeName: name,
        texts: prevState.texts.map((eachText) =>
          eachText.name === name
            ? {
                ...eachText,
                text: this.state.text,
              }
            : eachText
        ),
      }),
      () => {
        this.setState((prevState) => ({
          texts: prevState.texts.map((eachText) =>
            eachText.name === name
              ? {
                  ...eachText,
                  textWidth: node.textWidth,
                  textHeight: node.textHeight,
                }
              : eachText
          ),
        }));
      }
    );
    node.show();
    this.graphicStage.findOne(".transformer").show();
    this.graphicStage.draw();
  };

  render() {
    return (
      <>
        <div
          onKeyDown={this.onKeyDownHandler}
          tabIndex="0"
          style={{ outline: "none" }}
        >
          <Stage
            onClick={this.handleStageClick}
            onMouseMove={this.handleMouseOver}
            onWheel={(event) => this.handleWheel(event)}
            height={window.innerHeight}
            width={window.innerWidth}
            ref={this.setGraphicStageRef}
          >
            <Layer
              scaleX={this.state.layerScale}
              scaleY={this.state.layerScale}
              x={this.state.layerX}
              y={this.state.layerY}
              height={window.innerHeight}
              width={window.innerWidth}
              draggable
              onDragEnd={this.onDragEndLayerHandler}
              ref={this.setLayer2Ref}
            >
              <Rect
                x={-5 * window.innerWidth}
                y={-5 * window.innerHeight}
                height={window.innerHeight * 10}
                width={window.innerWidth * 10}
                name=""
                id="ContainerRect"
              />
              <>{this.rectMapping()}</>
              <>{this.ellipseMapping()}</>
              <>{this.textMapping()}</>
              <>{this.arrowsMapping()}</>
              <>{this.transformers()}</>
            </Layer>

            <Layer
              height={window.innerHeight}
              width={window.innerWidth}
              ref={this.setLayerRef}
            >
              <Toolbar
                layer={this.layer2}
                rectName={
                  this.state.rectangles.length + 1 + this.state.rectDeleteCount
                }
                ellipseName={
                  this.state.ellipses.length + 1 + this.state.ellipseDeleteCount
                }
                textName={
                  this.state.texts.length + 1 + this.state.textDeleteCount
                }
                newArrowOnDragEnd={this.newArrowOnDragEndHandler}
                appendToRectangles={this.appendToRectanglesHandler}
                appendToEllipses={this.appendToEllipsesHandler}
                appendToTexts={this.appendToTextsHandler}
              />
            </Layer>
          </Stage>

          <textarea
            ref={this.setTextareaRef}
            id="textarea"
            value={this.state.text}
            onChange={this.textareaOnChangeHandler}
            onKeyDown={this.textareaOnKeyDownHandler}
            onBlur={this.textareaOnBlurHandler}
            style={{
              display: this.state.textEditVisible ? "block" : "none",
              position: "absolute",
              top: "100px",
              left: "800px",
              width: "800px",
              height: "300px",
              overflow: "hidden",
              fontSize: this.state.textareaFontSize,
              fontFamily: this.state.textareaFontFamily,
              color: this.state.textareaFill,
              border: "none",
              padding: "0px",
              margin: "0px",
              outline: "none",
              resize: "none",
              background: "none",
            }}
          />
        </div>
      </>
    );
  }
}
