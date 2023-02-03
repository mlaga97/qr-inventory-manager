// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Button, ButtonGroup, InputGroup, FormControl } from 'react-bootstrap';

// Component Imports
import QRInput from './QRInput';

class RelabelCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromUUID: '',
      toUUID: '',
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.state.fromUUID || !this.state.toUUID)
      return;

    if (this.state.fromUUID === '' || this.state.toUUID === '')
      return;

    // Submit
    this.props.dispatch({
      type: 'POST_TAGS_REQUESTED',
      data: {
        [this.state.toUUID]: this.props.tags[this.state.fromUUID],
        [this.state.fromUUID]: {
          'containertype': '',
          'label': '',
          'parent': '',
          'comment': '',
          'labelprinted': false,
        },
      },
    });

    // Submit
    // TODO: This way
    /*
    this.props.dispatch({
      type: 'REPLACE_TAG_REQUESTED',
      data: {
        toUUID: this.state.toUUID,
        fromUUID: this.state.fromUUID,
      },
    })
    */

    this.setState({
      fromUUID: '',
      toUUID: '',
    })
  }

  render() {
    return <Card>
      <Card.Header>Re-Label</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit}>
            <InputGroup className='mb-3'>
              <InputGroup.Prepend>
                <InputGroup.Text>Old</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl name='label' value={this.state.fromUUID} />
              <InputGroup.Append>
                <QRInput value={this.state.fromUUID} onChange={uuid => this.setState({fromUUID: uuid})} />
              </InputGroup.Append>
            </InputGroup>

            <InputGroup className='mb-3'>
              <InputGroup.Prepend>
                <InputGroup.Text>New</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl name='label' value={this.state.toUUID} />
              <InputGroup.Append>
                <QRInput value={this.state.toUUID} onChange={uuid => this.setState({toUUID: uuid})} />
              </InputGroup.Append>
            </InputGroup>

            <ButtonGroup>
              <Button variant='danger' type='submit'>Submit</Button>
            </ButtonGroup>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>;
  }
}

export default connect(
  state => ({
    tags: state.tags,
  }),
  dispatch => ({
    dispatch,
  }),
)(RelabelCard);
