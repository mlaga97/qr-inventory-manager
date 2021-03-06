import React from 'react';

import {Row, Col} from 'react-bootstrap';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

class QRCodeReader extends React.Component {
  constructor(props) {
    super(props);

    this.webcamRef = React.createRef();
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.tick(this.webcamRef, this.canvasRef);
    }, 0);
  }

  drawLine(canvas, begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }

  tick(webcamRef, canvasRef) {
    if (webcamRef && webcamRef.current) {
      const canvas = webcamRef.current.getCanvas();

      if (canvas) {
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        const canvas2 = canvasRef.current;
        const context2 = canvas2.getContext('2d');

        canvas2.width = canvas.width;
        canvas2.height = canvas.height;

        context2.putImageData(imageData, 0, 0);

        if (code && code.data !== '') {
          this.drawLine(context2, code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
          this.drawLine(context2, code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
          this.drawLine(context2, code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
          this.drawLine(context2, code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');

          this.props.callback(code.data);
        }
      }
    }
  }

  render() {
    return <Row>
      <Col style={{width: '50%'}} >
        <Webcam ref={this.webcamRef} style={{width: '100%'}} audio={false} videoConstraints={{facingMode: 'environment'}} />
      </Col>
      <Col style={{width: '50%'}} >
        <canvas ref={this.canvasRef} style={{width: '100%'}} />
      </Col>
    </Row>
  }
}

export default QRCodeReader;
