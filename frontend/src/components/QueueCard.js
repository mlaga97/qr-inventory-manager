// Library Imports
import React from 'react';
import { Card, Table, ButtonGroup, Button } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';

const QueueCard = ({db, queue, handleClear, handleCommitQueue, select}) => <>
  <Card>
    <Card.Header>UUID Queue</Card.Header>
    <Card.Body>
      <Card.Text>
        <Table>
          <tbody>
            {
              Object.keys(queue).map((key) => (
                <tr onClick={() => select(key)}>
                  <td>{key}</td>
                  <td>{codenamize({seed: key, adjectiveCount: 2, maxItemChars: 4})}</td>
                  <td>{(db[key]) ? 'Yes' : 'No'}</td>
                </tr>
              ))
            }
          </tbody>
        </Table>

        <ButtonGroup>
          <Button variant='outline-primary' onClick={handleCommitQueue}>Commit Queue</Button>
          <Button variant='outline-danger' onClick={handleClear}>Clear Queue</Button>
        </ButtonGroup>
      </Card.Text>
    </Card.Body>
  </Card>
</>;

export default QueueCard;
