// Library Imports
import React from 'react';
import { Card, Table, ButtonGroup, Button } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';

const QueueCard = ({tags, queue, handleClear, handleSelect}) => {
  if (Object.keys(queue).length <= 0)
    return null;

  return <Card>
    <Card.Header>UUID Queue</Card.Header>
    <Card.Body>
      <Card.Text>
        <Table>
          <tbody>
            {
              Object.keys(queue).map((key) => (
                <tr onClick={() => handleSelect(key)}>
                  <td>{key}</td>
                  <td>{codenamize({seed: key, adjectiveCount: 2, maxItemChars: 4})}</td>
                  <td>{(key in tags) ? 'Yes' : 'No'}</td>
                </tr>
              ))
            }
          </tbody>
        </Table>

        <ButtonGroup>
          <Button variant='outline-danger' onClick={handleClear}>Clear Queue</Button>
        </ButtonGroup>
      </Card.Text>
    </Card.Body>
  </Card>;
}

export default QueueCard;
