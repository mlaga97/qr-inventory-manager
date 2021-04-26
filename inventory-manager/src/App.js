import React from 'react'
import './App.css';

import UUIDGrabber from './UUIDGrabber'

const ShowUUID = (props) => {
  const {uuid} = props;
  const {data} = uuid;

  return <>{data}</>
}

function App() {
  const [uuid, setUUID] = React.useState(0);

  const reset = () => {
    setUUID(null);
  }

  return (
    <div className="App">
      <UUIDGrabber callback={(uuid) => setUUID(uuid)} />
      {
        (uuid) ? <ShowUUID uuid={uuid} /> : 'Nope'
      }
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
