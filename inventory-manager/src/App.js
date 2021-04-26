import React from 'react'
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

import './App.css';

const ShowUUID = (props) => {
  const {uuid} = props;
  const {data} = uuid;

  return <>{data}</>
}

function App() {
  const webcamRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const [uuid, setUUID] = React.useState(0);

  function drawLine(canvas, begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
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

          if (code) {
            drawLine(context2, code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(context2, code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(context2, code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(context2, code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

            setUUID(code);
          }
        }
      }
    }, 0);
    return () => clearInterval(interval);
  }, []);

  const reset = () => {
    setUUID(null);
  }

  return (
    <div className="App">
      <Webcam ref={webcamRef} />
      <canvas ref={canvasRef} />
      <div>
        {
          (uuid) ? <ShowUUID uuid={uuid} /> : 'Nope'
        }
      </div>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
