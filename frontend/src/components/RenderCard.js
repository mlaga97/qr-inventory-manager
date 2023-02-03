// Library Imports
import React from 'react';
import { Card, Form, ButtonGroup, Button, InputGroup, FormControl } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';
import QRInput from './QRInput';

// Config Imports
// TODO: Load this from DB
import MakeModelOptions from './MakeModelOptions';

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const RenderCardPlaceholder = () => <Card>
  <Card.Header>Editor</Card.Header>
  <Card.Body>
    <Card.Text>Please scan a QR code or select a label from the search tab to get started!</Card.Text>
  </Card.Body>
</Card>;

const RenderCardLoading = () => <Card>
  <Card.Header>Editor</Card.Header>
  <Card.Body>
    <Card.Text>Please scan a QR code or select a label from the search tab to get started!</Card.Text>
  </Card.Body>
</Card>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const InputHelper = () => <></>

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// TODO: Detect and handle stale records / updates
//       Working copy, Working copy base, Most recently cached copy
class RenderCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  updateOld() {
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


  actuallyUpdate() {
    this.setState({
      active: this.props.active,
      staleRev: false,
      submitted: false,
    });

    if (this.props.active in this.props.tags) {
      this.setState({
        data: this.props.tags[this.props.active],
      });
    } else {
      this.setState({
        data: {
          'containertype': '',
          'label': '',
          'parent': '',
          'comment': '',
          'labelprinted': false,
        },
      });
    }
  }

  update() {
    if (this.props.active === this.state.active && !this.props.submitted) {
      // TODO: Handle potentially stale data
      // TODO: How?
    } else {
      this.actuallyUpdate();
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const msg = {
      [this.state.active]: this.state.data,
    };

    this.props.handleSubmit(msg);

    // TODO: Re-enable
    //this.setState({
    //  submitted: true,
    //});
  }

  render() {
    let { active, tags } = this.props;

    if (!this.state.active)
      return <RenderCardPlaceholder />

    if (!this.state.data)
      return <RenderCardLoading />

    return <Card>
      <Card.Header>Editing <b>{codenamize({seed: this.props.active, adjectiveCount: 2, maxItemChars: 4})}</b> ({this.props.active})</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit}>
            {/***** Label *****/}
            <Form.Group controlId='label'>
              <Form.Label>Label</Form.Label>
              <Form.Control name='label' value={this.state.data.label} onChange={this.handleChange} />
            </Form.Group>

            {/***** Label Printed *****/}
            <Form.Group controlId='labelprinted'>
              <Form.Check name='labelprinted' label='Label Printed' checked={this.state.data.labelprinted} onChange={this.handleChange} />
            </Form.Group>

            {/***** Location / Parent Container *****/}
            <InputGroup className='mb-3'>
              <InputGroup.Prepend>
                <InputGroup.Text>Location</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl name='parent' value={this.state.data.parent} onChange={this.handleChange} />
              <InputGroup.Append>
                <QRInput value={this.state.data.parent} onChange={uuid => this.updateKey('parent', uuid)} />
              </InputGroup.Append>
            </InputGroup>

            {/***** Container *****/}
            <Form.Group controlId='containertype'>
              <Form.Label>Model</Form.Label>
              <Form.Control name='containertype' value={this.state.data.containertype} as='select' onChange={this.handleChange} >
                {
                  MakeModelOptions.map(option => <option>{option}</option>)
                }
              </Form.Control>
            </Form.Group>

            {/***** Comment *****/}
            <Form.Group controlId='comment'>
              <Form.Label>Notes</Form.Label>
              <Form.Control name='comment' as='textarea' rows={5} value={this.state.data.comment} onChange={this.handleChange} />
            </Form.Group>

            {/* Last Scanned */}
            {/* Last Updated */}
            
            {/***** Submit *****/}
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
}

export default RenderCard;
