// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Button, ButtonGroup } from 'react-bootstrap';

class QRInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listening: false,
      uuid: null,
      lastTimestamp: new Date(),
    };
  }

  startListening = () => {
    this.setState({
      listening: true,
      lastUUID: this.props.uuid,
      lastTimestamp: new Date(),
    });
  }

  stopListening = () => {
    this.setState({
      listening: false,
    });
  }

  reset = () => {
    this.setState({
      listening: false,
      lastUUID: null,
      lastTimestamp: new Date(),
    });
    this.props.onChange('');
  }

  componentDidUpdate() {
    const { listening, lastUUID, lastTimestamp } = this.state;

    let timestamp = (this.props.history && this.props.uuid in this.props.history) ? this.props.history[this.props.uuid] : 0;

    if (listening) {
      if (lastUUID !== this.props.uuid || lastTimestamp < timestamp) {
        if (lastUUID !== this.props.uuid) {
          timestamp = new Date();
        }

        this.setState({
          listening: false,
          lastUUID: this.props.uuid,
          lastTimestamp: timestamp,
        });

        this.props.onChange(this.props.uuid);
      }
    }
  }

  render = () => {
    return (
      <ButtonGroup>
        {
          (this.props.value && this.props.value !== '') ? <Button variant='danger' onClick={this.reset}><b>X</b></Button> : null
        }
        {
          (this.state.listening) ?
            <Button onClick={this.stopListening}>Waiting...</Button>
            :
            <Button onClick={this.startListening}>Select</Button>
        }
      </ButtonGroup>
    );
  }
}

export default connect(
  state => ({
    uuid: state.lastScannedUUID,
    history: state.scannedUUIDqueue,
  }),
  dispatch => ({
    dispatch,
  }),
)(QRInput);
