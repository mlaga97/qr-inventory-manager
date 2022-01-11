// Library Imports
import React from 'react';
import { Card } from 'react-bootstrap';

// Component Imports
import QRCodeReader from './QRCodeReader';

const QRCodeReaderCard = (props) => <>
  <Card>
    <Card.Header>Cam View</Card.Header>
    <Card.Body>
      <Card.Text>
        <QRCodeReader callback={props.callback} />
      </Card.Text>
    </Card.Body>
  </Card>
</>

export default QRCodeReaderCard;
