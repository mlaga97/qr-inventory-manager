import React from 'react';

import {Navbar, Card, Container, Row, Form, Button, ButtonGroup, Table} from 'react-bootstrap';
import PouchDB from 'pouchdb';
import CSVReader from 'react-csv-reader';
import CsvDownloader from 'react-csv-downloader';

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

const FixColumns = (i) => {
  if (!Object.prototype.hasOwnProperty.call(i, 'label'))
    i.label = '';

  if (!Object.prototype.hasOwnProperty.call(i, 'labelPrinted'))
    i.labelPrinted = false;

  if (!Object.prototype.hasOwnProperty.call(i, 'location'))
    i.location = '';

  // TODO: Split in twain
  if (!Object.prototype.hasOwnProperty.call(i, 'containerMakeModel'))
    i.containerMakeModel = 'Unknown';

  if (!Object.prototype.hasOwnProperty.call(i, 'comments'))
    i.comments = 'Unknown';

  return i;
}

class RenderUUID extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  update() {
    console.log([this.props.uuid, this.state._id])
    if (this.props.uuid !== this.state._id) {
      this.props.db.get(this.props.uuid).then((doc) => {
        console.log(doc)
        this.setState(FixColumns(doc))
      }).catch((e) => {
        console.log(e)
        if (e.reason === 'missing') {
          this.setState(FixColumns({
            _id: this.props.uuid,
          }))
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

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
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

    console.log(this.state)

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
    console.log('Test')
    console.log(this.state)
    if (!this.state._id)
      return null;

    console.log('Test2')
    if (this.state.error)
      return this.state.error.reason;

    console.log('Test3')
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

              <Form.Group controlId='location'>
                <Form.Label>Location</Form.Label>
                <Form.Control name='location' value={this.state.location} onChange={this.handleChange} />
              </Form.Group>

              <Form.Group controlId='containerMakeModel'>
                <Form.Label>Model</Form.Label>
                <Form.Control name='containerMakeModel' value={this.state.containerMakeModel} onChange={this.handleChange} as='select'>
                  <option>Unknown</option>
                  <option>6-Quart Shoebox - Sterilite - 18518036</option>
                  <option>Shipping Tote - Global Industrial - 257814</option>
                  <option>Shipping Tote, FRC Branded - Orbis - FP243</option>
                  <option>Tacklebox, Fixed - Darice - 1157-11</option>
                  <option>Tacklebox, Adjustable - Plano - 3750 (Old)</option>
                  <option>Tacklebox, Adjustable - Plano - 3750 (New)</option>
                  <option>Tacklebox, Adjustable - UPC 035061512001</option>
                  <option>Tacklebox, Small Fixed - Tool Bench Hardware - 206348</option>
                </Form.Control>
              </Form.Group>

              <Button variant='primary' type='submit'>Submit</Button>
            </Form>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  }
}

const ContainerEntry = ({row, handleClick}) => {
  if (!row)
    return null;

  if (!row._id)
    return null;

  return <tr onClick={() => handleClick(row._id)}>
    <td>{row._id.substring(0,4) + '-' + row._id.substring(4,13)}</td>
    <td>{row.label}</td>
    <td>{(row.labelPrinted) ? 'Yes' : 'No'}</td>
    <td>{row.location}</td>
    <td>{row.containerMakeModel}</td>
  </tr>;
}

const ContainerList = ({rows, handleClick}) => <div>
  <Table>
    <thead>
      <tr>
        <th>UUID</th>
        <th>Label</th>
        <th>Label Printed</th>
        <th>Location</th>
        <th>Make/Model</th>
      </tr>
    </thead>
    <tbody>
      {
        rows.map((row) => {
          return <ContainerEntry row={row} handleClick={handleClick} />
        })
      }
    </tbody>
  </Table>
  <CsvDownloader
    filename='ahhh'
    datas={rows}
    columns={[
      {id: '_id', displayName: 'UUID'},
      {id: 'label', displayName: 'Label'},
      {id: 'labelPrinted', displayName: 'Printed'},
      {id: 'location', displayName: 'Location'},
      {id: 'containerMakeModel', displayName: 'Make/Model'},
      {id: 'comments', displayName: 'Comments'},
      {id: '_rev', displayName: 'Revision'},
    ]}
    text='DOWNLOAD'
  />
</div>;

class RenderTable extends React.Component {
  update() {
    this.props.db.allDocs({
      include_docs: true,
    }).then((data) => {
      this.setState({
        rows: data.rows.map((e) => e.doc) // Extract just the data itself
      });
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

    return <Card style={{'width': '100%', 'margin': '10px'}} >
      <Card.Header>All Inventory Items</Card.Header>
      <Card.Body>
        <Card.Text>
          <ContainerList rows={this.state.rows} handleClick={this.props.callback} />
        </Card.Text>
      </Card.Body>
    </Card>;
  }
}

class CSVTest extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: [],
    }
  }

  render() {
    return <>
      <Card style={{'width': '100%', 'margin': '10px'}} >
        <Card.Header>All Inventory Items</Card.Header>
        <Card.Body>
          <Card.Text>
            <ContainerList rows={this.state.rows} handleClick={this.props.callback} />
            <CSVReader onFileLoaded={(data, fileInfo) => {
              this.setState({
                rows: data.slice(1).map((e) => ({
                  _id: e[0],
                  label: e[1],
                  labelPrinted: e[2],
                  location: e[3],
                  containerMakeModel: e[4],
                }))
              });
            }} />
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
      'mode': 'default',
    }

    this.db = new PouchDB('https://couchdb.mlaga97.space/uuid-inventory-db');
    this.api = new PouchDB('https://couchdb.mlaga97.space/uuid-inventory-api');
  }

  componentDidMount() {

    // Get all changes from the API
    this.api.changes({
      since: 'now',
      live: true,
      include_docs: true,
    }).on('change', (change) => {
      if (change.deleted) {
        // TODO: Handle
      } else {
        console.log(change.doc)
      }
    }).on('error', (err) => {
      console.log(err);
    });

  }

  setEditing = (uuid) => {
    this.setState({
      mode: 'editing',
      currentUUID: uuid,
    });
  }

  handleScan = (uuid) => {
    if (this.state.mode === 'default')
      this.setEditing(uuid);

    if (this.state.mode === 'bulkScan') {
      console.log(uuid);
      console.log(this.state.bulkScan);
      this.setState({
        bulkScan: {[uuid]: new Date(), ...this.state.bulkScan},
      })
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
              alt='Logo'
            />{' '}
            Inventory Manager
          </Navbar.Brand>
        </Navbar>

        <Container style={{'margin': '40px'}} >
          <Row>
            <QRReaderCard callback={this.handleScan} />
            <ModeSelector mode={this.state.mode} setMode={(e) => this.setState({mode: e})} />

            {(this.state.mode === 'editing') ? <RenderUUID uuid={this.state.currentUUID} callback={this.setEditing} db={this.db} /> : null}

            {/*(this.state.mode === 'bulkScan') ? <BulkEdit uuids={Object.keys(this.state.bulkScan)} db={this.db} /> : null*/}

            <RenderTable callback={this.setEditing} db={this.db} />

            {(this.state.mode === 'csvImport') ? <CSVTest /> : null}
          </Row>
        </Container>
      </div>
    );
  }
}

const ModeSelector = ({mode, setMode}) => <Card style={{'width': '100%', 'margin': '10px'}} >
  <Card.Header>Mode Selection</Card.Header>
  <Card.Body>
    <Card.Text>
      <ButtonGroup>
        {
          [
            {
              text: 'Single Scan',
              mode: 'default',
            },
            {
              text: 'Editing',
              mode: 'editing',
            },
            {
              text: 'Bulk Scan',
              mode: 'bulkScan',
            },
            {
              text: 'CSV Import',
              mode: 'csvImport',
            }
          ].map((val) => <Button variant='outline-primary' active={val.mode === mode} onClick={() => setMode(val.mode)} >{val.text}</Button>)
        }
      </ButtonGroup>
    </Card.Text>
  </Card.Body>
</Card>;

export default App;
