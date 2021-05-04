import React from 'react';
import { connect } from 'react-redux';

import { Navbar, Card, Container, Row, Form, Button, ButtonGroup, Table } from 'react-bootstrap';
import CSVReader from 'react-csv-reader';
import CsvDownloader from 'react-csv-downloader';
import codenamize from '@codenamize/codenamize';
import QRCodeReader from './QRCodeReader';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const QRReaderCard = (props) => <>
  <Card>
    <Card.Header>Cam View</Card.Header>
    <Card.Body>
      <Card.Text>
        <QRCodeReader callback={props.callback} />
      </Card.Text>
    </Card.Body>
  </Card>
</>

const ContainerList = ({rows, handleClick}) => <div>
  <Table>
    <thead>
      <tr>
        <th>UUID</th>
        <th>Friendly</th>
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

const QueueCard = ({db, queue, handleClear, handleCommitQueue, select}) => (
  <Card>
    <Card.Header>UUID Queue</Card.Header>
    <Card.Body>
      <Card.Text>
        <Table>
          <tbody>
            {
              Object.keys(queue).map((key) => (
                <tr onClick={() => select(key)}>
                  <td>{key}</td>
                  <td>{codenamize({seed: key, adjectiveCount: 2, maxItemChars: 4})}</td>
                  <td>{(db[key]) ? 'Yes' : 'No'}</td>
                </tr>
              ))
            }
          </tbody>
        </Table>

        <ButtonGroup>
          <Button variant='outline-primary' onClick={handleCommitQueue}>Commit Queue</Button>
          <Button variant='outline-danger' onClick={handleClear}>Clear Queue</Button>
        </ButtonGroup>
      </Card.Text>
    </Card.Body>
  </Card>
);

const ContainerEntry = ({row, handleClick}) => {
  if (!row)
    return null;

  if (!row._id)
    return null;

  return <tr onClick={() => handleClick(row._id)}>
    <td>{row._id.substring(0,4) + '-' + row._id.substring(4,13)}</td>
    <td>{codenamize(row._id)}</td>
    <td>{row.label}</td>
    <td>{(row.labelPrinted) ? 'Yes' : 'No'}</td>
    <td>{row.location}</td>
    <td>{row.containerMakeModel}</td>
  </tr>;
}

const DBEntryHeader = () => (
  <tr>
    <td>Friendly Name</td>
    <td>Label</td>
    <td>Location</td>
    <td>Container Make/Model</td>
  </tr>
);

const DBEntry = ({entry, handleClick}) => (
  <tr onClick={handleClick}>
    <td>{codenamize({seed: entry._id, adjectiveCount: 2, maxItemChars: 4})}</td>
    <td>{entry.label}</td>
    <td>{entry.location}</td>
    <td>{entry.containerMakeModel}</td>
  </tr>
);

const formatDateTime = () => {
  function pad(number, length) {
      var str = '' + number;
      while (str.length < length) {
          str = '0' + str;
      }
      return str;
  }

  const d = new Date();

  var yyyy = d.getFullYear().toString();
  var MM = pad(d.getMonth() + 1,2);
  var dd = pad(d.getDate(), 2);
  var hh = pad(d.getHours(), 2);
  var mm = pad(d.getMinutes(), 2)
  var ss = pad(d.getSeconds(), 2)

  return yyyy + MM + dd + '_' + hh + mm + ss;
}

const CSVUpload = ({handleSubmit}) => (
  <CSVReader onFileLoaded={(data, fileinfo) => {
    const msg = data.slice(1).map(entry => {

      let result = {
        _id: entry[0],
      };

      if (entry[1] !== '')
        result['label'] = entry[1];
      if (entry[2] !== '')
        result['labelPrinted'] = entry[2];
      if (entry[3] !== '')
        result['location'] = entry[3];
      if (entry[4] !== '')
        result['containerMakeModel'] = entry[4];
      if (entry[5] !== '')
        result['comments'] = entry[5];
      if (entry[6] !== '')
        result['_rev'] = entry[6];

      return result;
    });

    handleSubmit(msg)
  }} />
)

const DBDumper = ({db, handleClick}) => (
  <Card className='hideOnMobile'>
    <Card.Header>Database Dump</Card.Header>
    <Card.Body>
      <Card.Text>
        <CsvDownloader
          filename={'inventoryDump_'+formatDateTime()}
          datas={Object.keys(db).map(uuid => db[uuid])}
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
          separator='|'
        />
        <Table>
          <thead>
            <DBEntryHeader />
          </thead>
          <tbody>
            {
              Object.keys(db).map(key => <DBEntry entry={db[key]} handleClick={() => handleClick(key)} />)
            }
          </tbody>
        </Table>
      </Card.Text>
    </Card.Body>
  </Card>
);

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
      return null;

    if (!this.state.data)
      return null;

    console.log(this.state.data);

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
                <Form.Check name='labelPrinted' label='Label Printed' value={this.state.data.labelPrinted} onChange={this.handleChange} />
              </Form.Group>

              <Form.Group controlId='location'>
                <Form.Label>Location</Form.Label>
                <Form.Control name='location' value={this.state.data.location} onChange={this.handleChange} />
              </Form.Group>

              <Form.Group controlId='containerMakeModel'>
                <Form.Label>Model</Form.Label>
                <Form.Control name='containerMakeModel' value={this.state.data.containerMakeModel} as='select' onChange={this.handleChange} >
                  {
                    MakeModelOptions.map(option => <option>{option}</option>)
                  }
                </Form.Control>
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

const BulkLabel = ({handleSubmit}) => (
  <Card>
    <Card.Header>Bulk Apply</Card.Header>
    <Card.Body>
      <Card.Text>
        <Form onSubmit={(e) => {e.preventDefault(); console.log(e.target[0]); handleSubmit(e.target[0].name, e.target[0].value);}} >
          <Form.Group controlId='label'>
            <Form.Label>Label</Form.Label>
            <Form.Control name='label' />
          </Form.Group>
          <Button variant='primary' type='submit'>Submit</Button>
        </Form>
      </Card.Text>
    </Card.Body>
  </Card>
);

const BulkLocation = ({handleSubmit}) => (
  <Card>
    <Card.Header>Bulk Apply</Card.Header>
    <Card.Body>
      <Card.Text>
        <Form onSubmit={(e) => {e.preventDefault(); console.log(e.target[0]); handleSubmit(e.target[0].name, e.target[0].value);}} >
          <Form.Group controlId='location'>
            <Form.Label>Location</Form.Label>
            <Form.Control name='location' />
          </Form.Group>
          <Button variant='primary' type='submit'>Submit</Button>
        </Form>
      </Card.Text>
    </Card.Body>
  </Card>
);

const BulkMakeModel = ({handleSubmit}) => (
  <Card>
    <Card.Header>Bulk Apply</Card.Header>
    <Card.Body>
      <Card.Text>
        <Form onSubmit={(e) => {e.preventDefault(); console.log(e.target[0]); handleSubmit(e.target[0].name, e.target[0].value);}} >
          <Form.Group controlId='containerMakeModel'>
            <Form.Label>Make and Model</Form.Label>
            <Form.Control name='containerMakeModel' as='select'>
              {
                MakeModelOptions.map(option => <option>{option}</option>)
              }
            </Form.Control>
          </Form.Group>
          <Button variant='primary' type='submit'>Submit</Button>
        </Form>
      </Card.Text>
    </Card.Body>
  </Card>
);

const MakeModelOptions = [
  'Unknown',
  '6-Quart Shoebox - Sterilite - 18518036',
  'Shipping Tote - Global Industrial - 257814',
  'Shipping Tote, FRC Branded - Orbis - FP243',
  'Tacklebox, Fixed - Darice - 1157-11',
  'Tacklebox, Adjustable - Plano - 3750 (Old)',
  'Tacklebox, Adjustable - Plano - 3750 (New)',
  'Tacklebox, Adjustable - UPC 035061512001',
  'Tacklebox, Small Fixed - Tool Bench Hardware - 206348',
  'Cube Organizer Box - Home Depot 523607',
  '48x18 Wire Shelf - Home Depot 525441',
  '24x48 Project Panel',
]


const buildTree = (location, entries, db) => {
  let output = {}

  entries.map((entry) => {
    if (entry[1] === location)
      output[entry[0]] = {
        contains: buildTree(entry[0], entries, db),
        ...db[entry[0]]
      }
  })

  return output;
}

const HierarchialDumper = ({db, handleClick}) => {
  const entries = Object.keys(db).map(uuid => [uuid, db[uuid].location]);
  const rawLocations = Object.keys(db).map(uuid => db[uuid].location);

  let roots = {}
  rawLocations.map(location => {
    if (!(location in db)) {
      roots[location] = buildTree(location, entries, db);
    }
  });

  console.log(roots);

  return null;
}

const emptyUUID = {
};

class App extends React.Component {
  componentDidMount() {
    this.props.dispatch({type: 'DB_UPDATE_REQUESTED'});
  }

  uuidScanned = (uuid) => this.props.dispatch({type: 'UUID_SCANNED', data: uuid});
  clearQueue = () => this.props.dispatch({type: 'CLEAR_UUID_QUEUE'});
  bulkCommit = () => this.props.dispatch({type: 'COMMIT_UUID_QUEUE'});
  commit = (data) => this.props.dispatch({type: 'COMMIT_UUIDS_REQUESTED', data: data})

  bulkApply = (key, value) => {
    this.commit(Object.keys(this.props.queue).map((a) => {
      return Object.assign({}, this.props.db[a] || emptyUUID, {
        _id: a,
        [key]: value,
      })
    }));
  }

  render() {
    return (
      <div className="App">
        <Navbar bg='dark' variant='dark'>
          <Navbar.Brand>
            <img
              src='/logo.svg'
              width='30'
              height='30'
              alt='Logo'
            />{' '}
            Inventory Manager
          </Navbar.Brand>
        </Navbar>

        <Container>
          <Row>
            <QRReaderCard callback={this.uuidScanned} />
            <EditCard db={this.props.db} active={this.props.lastUUID} handleSubmit={this.commit} />
            <QueueCard db={this.props.db} queue={this.props.queue} handleClear={this.clearQueue} handleCommitQueue={this.bulkCommit} select={this.uuidScanned} />
            <BulkLabel handleSubmit={this.bulkApply} />
            <BulkLocation handleSubmit={this.bulkApply} />
            <BulkMakeModel handleSubmit={this.bulkApply} />
            <CSVUpload handleSubmit={this.commit} />
            <DBDumper db={this.props.db} handleClick={this.uuidScanned} />
            <HierarchialDumper db={this.props.db} handleClick={this.uuidScanned} />
          </Row>
        </Container>
      </div>
    );
  }
}

export default connect(
  state => ({
    lastUUID: state.lastScannedUUID,
    queue: state.scannedUUIDqueue,
    db: state.cachedDBentries,
  }),
  dispatch => ({
    dispatch,
  }),
)(App);
