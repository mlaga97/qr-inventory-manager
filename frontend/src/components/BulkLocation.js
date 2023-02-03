// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, InputGroup, Button } from 'react-bootstrap';

// Component Imports
import QRInput from './QRInput';

class BulkLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '', // TODO: Why needed?
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let result = {};
    Object.keys(this.props.queue).map((key) => {
      result[key] = {
        ...this.props.tags[key],
        'parent': this.state.location,
      }
    });

    this.props.dispatch({
      type: 'POST_TAGS_REQUESTED',
      data: result,
    });
  }

  render() {
    return <Card>
      <Card.Header>Bulk Location</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit} >
            <InputGroup className='mb-3'>
              <InputGroup.Prepend>
                <InputGroup.Text>Location</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control controlId='location' name='location' value={this.state.location} onChange={e => this.setState({location: e.target.value})} />
              <InputGroup.Append>
                <QRInput value={this.state.location} onChange={location => this.setState({location: location})} />
              </InputGroup.Append>
            </InputGroup>
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
)(BulkLocation);
