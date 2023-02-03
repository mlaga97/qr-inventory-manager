// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Button } from 'react-bootstrap';

class BulkLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let result = {};
    Object.keys(this.props.queue).map((key) => {
      result[key] = {
        ...this.props.tags[key],
        'label': this.state.label,
      }
    });

    this.props.dispatch({
      type: 'POST_TAGS_REQUESTED',
      data: result,
    });
  }

  render() {
    return <Card>
      <Card.Header>Bulk Label</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit} >
            <Form.Group controlId='label'>
              <Form.Label>Label</Form.Label>
              <Form.Control controlId='label' name='label' value={this.state.label} onChange={e => this.setState({label: e.target.value})} />
            </Form.Group>
            <Button variant='primary' type='submit'>Submit</Button>
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
)(BulkLabel);
