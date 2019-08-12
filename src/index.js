import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./index.css";

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const bagcanvas = this.canvasRef.current.getContext("2d");
    bagcanvas.clearRect(0, 0, bagcanvas.canvas.width, bagcanvas.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    bagcanvas.font = font;
    bagcanvas.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      bagcanvas.strokeStyle = "#000000";
      bagcanvas.lineWidth = 4;
      bagcanvas.strokeRect(x, y, width, height);
      // Draw the label background.
      bagcanvas.fillStyle = "#000000";
      const textWidth = bagcanvas.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      bagcanvas.fillRect(x, y, textWidth + 4, textHeight + 4);
    });
    
     predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      bagcanvas.fillStyle = "#FFFFFF";
      bagcanvas.fillText(prediction.class, x, y);
    });
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="600"
          height="500"
        />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
