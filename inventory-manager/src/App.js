import React from 'react'
import './App.css';

import QRCodeReader from './QRCodeReader'

const ShowData = (props) => {
  const {data} = props;

  return <>{data}</>
}

function App() {
  const [data, setData] = React.useState(0);

  const reset = () => {
    setData(null);
  }

  return (
    <div className="App">
      <QRCodeReader callback={(data) => {console.log(data); setData(data);}} />
      {
        (data) ? <ShowData data={data} /> : 'Nope'
      }
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
