// Library Imports
import React from 'react';
import { Card, Form, ButtonGroup, Button, InputGroup, FormControl } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';
import QRInput from './QRInput';

// Config Imports
import MakeModelOptions from './MakeModelOptions';

class EditCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      staleRev: false,
    };
  }

  actuallyUpdate = () => {
    // Update
    if (this.props.db[this.props.active]) {
      this.setState({
        active: this.props.active,
        data: {
          _id: this.props.active,
          label: '',
          labelPrinted: false,
          location: '',
          containerMakeModel: 'Unknown',
          comment: '',
          ...this.props.db[this.props.active]
        },
        staleRev: false,
        submitted: false,
      });
    } else {
      this.setState({
        active: this.props.active,
        data: {
          _id: this.props.active,
          label: '',
          labelPrinted: false,
          location: '',
          containerMakeModel: 'Unknown',
          comment: '',
        },
        staleRev: false,
        submitted: false,
      });
    }
  }

  update() {
    if (this.props.active === this.state.active && !this.props.submitted) {
      // Check for stale

      if (!this.state.staleRev && this.state.data && this.props.db && this.props.db[this.props.active])
        if (this.state.data._rev !== this.props.db[this.props.active]._rev)
          if (this.state.submitted) {
            this.actuallyUpdate();
          } else {
            console.log('Stale!');
            this.setState({
              staleRev: true,
            })
          }

      return;
    }

    this.actuallyUpdate();
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  // https://reactjs.org/docs/forms.html#handling-multiple-inputs
  handleChange = (e) => {
    const {target} = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const {name} = target;

    //this.setState({[name]: value});
    this.setState({
      data: Object.assign({}, this.state.data, {
        [name]: value,
      })
    });
  }

  updateKey = (name, value) => {
    this.setState({
      data: Object.assign({}, this.state.data, {
        [name]: value,
      })
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.handleSubmit([
      this.state.data,
    ])
    this.setState({
      submitted: true,
    });
  }

  render() {
    if (!this.state.active)
      return <>
        <Card>
          <Card.Header>Editor</Card.Header>
          <Card.Body>
            <Card.Text>Please scan a QR code or select a label from the search tab to get started!</Card.Text>
          </Card.Body>
        </Card>
      </>;

    if (!this.state.data)
      return null;

    return (
      <Card>
        <Card.Header>Editing <b>{codenamize({seed: this.props.active, adjectiveCount: 2, maxItemChars: 4})}</b> ({this.props.active})</Card.Header>
        <Card.Body>
          <Card.Text>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId='label'>
                <Form.Label>Label</Form.Label>
                <Form.Control name='label' value={this.state.data.label} onChange={this.handleChange} />
              </Form.Group>

              <Form.Group controlId='labelPrinted'>
                <Form.Check name='labelPrinted' label='Label Printed' checked={this.state.data.labelPrinted} onChange={this.handleChange} />
              </Form.Group>

              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Location</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl name='location' value={this.state.data.location} onChange={this.handleChange} />
                <InputGroup.Append>
                  <QRInput value={this.state.data.location} onChange={uuid => this.updateKey('location', uuid)} />
                </InputGroup.Append>
              </InputGroup>

              <Form.Group controlId='containerMakeModel'>
                <Form.Label>Model</Form.Label>
                <Form.Control name='containerMakeModel' value={this.state.data.containerMakeModel} as='select' onChange={this.handleChange} >
                  {
                    MakeModelOptions.map(option => <option>{option}</option>)
                  }
                </Form.Control>
              </Form.Group>

              <Form.Group controlId='comment'>
                <Form.Label>Notes</Form.Label>
                <Form.Control name='comment' as='textarea' rows={5} value={this.state.data.comment} onChange={this.handleChange} />
              </Form.Group>
              
              <ButtonGroup>
                {
                  (this.state.staleRev || this.state.submitted) ? 
                    <Button variant='danger'>Refresh</Button> :
                    <Button variant='primary' type='submit'>Submit</Button>
                }
              </ButtonGroup>
            </Form>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

export default EditCard;
