// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Button } from 'react-bootstrap';

// Component Imports
import MakeModelOptions from './MakeModelOptions';

class BulkMakeModel extends React.Component {
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
        'containertype': this.state.containertype,
      }
    });

    this.props.dispatch({
      type: 'POST_TAGS_REQUESTED',
      data: result,
    });
  }

  render() {
    return <Card>
      <Card.Header>Bulk Make/Model</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit} >
            <Form.Group controlId='containertype'>
              <Form.Label>Make and Model</Form.Label>
                <Form.Control name='containertype' as='select' onChange={e => this.setState({containertype: e.target.value})}>
                {
                  MakeModelOptions.map(option => <option>{option}</option>)
                }
              </Form.Control>
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
)(BulkMakeModel);
