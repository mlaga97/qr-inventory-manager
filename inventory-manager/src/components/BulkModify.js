// Library Imports
import React from 'react';
import { Card, Form, Button, InputGroup, FormControl } from 'react-bootstrap';

// Component Imports
import QRInput from './QRInput';

// Config Imports
import MakeModelOptions from './MakeModelOptions';

export const BulkLabel = ({handleSubmit}) => (
  <Card>
    <Card.Header>Bulk Apply</Card.Header>
    <Card.Body>
      <Card.Text>
        <Form onSubmit={(e) => {e.preventDefault(); console.log(e.target[0]); handleSubmit(e.target[0].name, e.target[0].value);}} >
          <Form.Group controlId='label'>
            <Form.Label>Label</Form.Label>
            <Form.Control name='label' />
          </Form.Group>
          <Button variant='primary' type='submit'>Submit</Button>
        </Form>
      </Card.Text>
    </Card.Body>
  </Card>
);

export class BulkLocation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      location: '',
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.handleSubmit('location', this.state.location);
  }

  render = () => (
    <Card>
      <Card.Header>Bulk Apply</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit} >
            <InputGroup className='mb-3'>
              <InputGroup.Prepend>
                <InputGroup.Text>Location</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl controlId='location' name='location' value={this.state.location} onChange={e => this.setState({location: e.target.value})} />
              <InputGroup.Append>
                <QRInput value={this.state.location} onChange={uuid => this.setState({location: uuid})} />
              </InputGroup.Append>
            </InputGroup>
            <Button variant='primary' type='submit'>Submit</Button>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export const BulkMakeModel = ({handleSubmit}) => (
  <Card>
    <Card.Header>Bulk Apply</Card.Header>
    <Card.Body>
      <Card.Text>
        <Form onSubmit={(e) => {e.preventDefault(); console.log(e.target[0]); handleSubmit(e.target[0].name, e.target[0].value);}} >
          <Form.Group controlId='containerMakeModel'>
            <Form.Label>Make and Model</Form.Label>
            <Form.Control name='containerMakeModel' as='select'>
              {
                MakeModelOptions.map(option => <option>{option}</option>)
              }
            </Form.Control>
          </Form.Group>
          <Button variant='primary' type='submit'>Submit</Button>
        </Form>
      </Card.Text>
    </Card.Body>
  </Card>
);

export const BulkDelete = ({db, queue, handleSubmit}) => {
  const test = () => {
    handleSubmit(
      Object.keys(queue).map((uuid) => {
        if (uuid in db) {
          return {_id: uuid, _rev: db[uuid]._rev, _deleted: true};
        } else {
          return null;
        }
      }).filter(a => a)
    )
  }

  return (
    <Card>
      <Card.Header>Bulk Delete</Card.Header>
      <Card.Body>
        <Card.Text>
          <Button onClick={test}>Delete</Button>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};
