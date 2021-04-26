import React from 'react';

import {Navbar, Card, Container, Row, Col, Form, Button, Table} from 'react-bootstrap';
import PouchDB from 'pouchdb';

import QRCodeReader from './QRCodeReader';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const QRReaderCard = (props) => <>
  <Card style={{'width': '100%', 'margin': '10px'}} >
    <Card.Header>Cam View</Card.Header>
    <Card.Body>
      <Card.Text>
        <QRCodeReader callback={props.callback} />
      </Card.Text>
    </Card.Body>
  </Card>
</>

class RenderUUID extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate() {
    if (this.props.uuid != this.state._id) {
      this.props.db.get(this.props.uuid).then((doc) => {
        this.setState(doc)
      }).catch((e) => {
        if (e.reason == 'missing') {
          this.setState({
            _id: this.props.uuid,
            label: '',
            labelPrinted: false,
          })
        } else {
          console.log(e);
          this.setState({
            _id: this.props.uuid,
            error: e,
          })
        }
      });
    }
  }

  // https://reactjs.org/docs/forms.html#handling-multiple-inputs
  handleChange(e) {
    const {target} = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const {name} = target;

    this.setState({[name]: value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const json = JSON.stringify(this.state);

    this.props.db.put(this.state).then((a) => {
      this.setState({
        _rev: a.rev,
      });
    }).catch((e) => {
      console.log(e);
    });

    this.props.callback(this.props.uuid);
  }

  render() {
    if (!this.state._id)
      return null;

    if (this.state.error)
      return this.state.error.reason;

    return <>
      <Card style={{'width': '100%', 'margin': '10px'}} >
        <Card.Header>Editing {this.props.uuid}</Card.Header>
        <Card.Body>
          <Card.Text>
            <Form onSubmit={this.handleSubmit} >
              <Form.Group controlId='label'>
                <Form.Label>Label</Form.Label>
                <Form.Control name='label' value={this.state.label} onChange={this.handleChange} />
              </Form.Group>
              <Form.Group controlId='labelPrinted'>
                <Form.Check name='labelPrinted' label='Label Printed' value={this.state.labelPrinted} onChange={this.handleChange} />
              </Form.Group>
              <Button variant='primary' type='submit'>Submit</Button>
            </Form>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  }
}

class RenderTable extends React.Component {
  update() {
    this.props.db.allDocs({
      include_docs: true,
    }).then((data) => {
      this.setState(data);
    }).catch((e) => {
      console.log(e);
    });
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  render() {
    if (!this.state)
      return null;

    return <>
      <Card style={{'width': '100%', 'margin': '10px'}} >
        <Card.Header>All Inventory Items</Card.Header>
        <Card.Body>
          <Card.Text>
            <Table>
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>Label</th>
                  <th>Label Printed</th>
                  <th>Content</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Make/Model</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.rows.map((row) => <>
                    <tr onClick={() => this.props.callback(row.doc._id)}>
                      <td>{row.doc._id}</td>
                      <td>{row.doc.label}</td>
                      <td>{(row.doc.labelPrinted) ? 'Yes' : 'No'}</td>
                    </tr>
                  </>)
                }
              </tbody>
            </Table>
          </Card.Text>
        </Card.Body>
      </Card>
    </>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'data': null,
    }

    this.db =  new PouchDB('testDB');
  }

  reset = () => {
    this.update(null);
  }

  update = (uuid) => {
    if (uuid != this.state.uuid) {
      this.setState({'data': uuid});
    }
  }

  render = () => {
    return (
      <div className="App">
        <Navbar bg='dark' variant='dark'>
          <Navbar.Brand>
            <img
              src='/logo192.png'
              width='30'
              height='30'
            />{' '}
            Inventory Manager
          </Navbar.Brand>
        </Navbar>

        <Container style={{'margin': '40px'}} >
          <Row>
            <QRReaderCard callback={this.update} />
            <RenderUUID uuid={this.state.data} callback={this.update} db={this.db} />
            <RenderTable uuid={this.state.data} callback={this.update} db={this.db} />
          </Row>
        </Container>

      </div>
    );
  }
}

export default App;
