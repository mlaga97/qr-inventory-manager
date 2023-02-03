// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Button } from 'react-bootstrap';

class BulkDelete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <Card>
      <Card.Header>Bulk Delete</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={() => {}} >
            <Button variant='danger' type='submit'>Delete</Button>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>;
  }
}

export default connect(
  state => ({
    tags: state.tags,
    queue: state.scannedUUIDqueue,
  }),
  dispatch => ({
    dispatch,
  }),
)(BulkDelete);
