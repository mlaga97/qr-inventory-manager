import React from 'react';
import { connect } from 'react-redux';

import { Tab, Nav, Navbar, Card, Container, Row, Form, Button, ButtonGroup, Table, InputGroup, FormControl } from 'react-bootstrap';
import QRCodeReader from './QRCodeReader';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import codenamize from '@codenamize/codenamize';

// Component Imports
import { EditCard, BulkMakeModel } from './Renderers';
import DBDumperCard from './DBDumperCard';
import QRInput from './QRInput';
import RelabelCard from './RelabelCard';

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

class BulkLocation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      location: '',
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.handleSubmit('location', this.state.location);
  }

  render = () => (
    <Card>
      <Card.Header>Bulk Apply</Card.Header>
      <Card.Body>
        <Card.Text>
          <Form onSubmit={this.handleSubmit} >
            <InputGroup className='mb-3'>
              <InputGroup.Prepend>
                <InputGroup.Text>Location</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl controlId='location' name='location' value={this.state.location} onChange={e => this.setState({location: e.target.value})} />
              <InputGroup.Append>
                <QRInput value={this.state.location} onChange={uuid => this.setState({location: uuid})} />
              </InputGroup.Append>
            </InputGroup>
            <Button variant='primary' type='submit'>Submit</Button>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

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

  return null;
}

const emptyUUID = {
};

const MainPage = ({
  db,
  uuidScanned,
  lastUUID,
  commit,
  queue,
  clearQueue,
  bulkCommit,
  bulkApply,
}) => (
  <>
    <EditCard db={db} active={lastUUID} handleSubmit={commit} />
    <QueueCard db={db} queue={queue} handleClear={clearQueue} handleCommitQueue={bulkCommit} select={uuidScanned} />
    <BulkLabel handleSubmit={bulkApply} />
    <BulkLocation handleSubmit={bulkApply} />
    <BulkMakeModel handleSubmit={bulkApply} />
  </>
)

const BulkDelete = ({db, queue, handleSubmit}) => {
  const test = () => {
    handleSubmit(
      Object.keys(queue).map((uuid) => {
        if (uuid in db) {
          return {_id: uuid, _rev: db[uuid]._rev, _deleted: true};
        } else {
          return null;
        }
      }).filter(a => a)
    )
  }

  return (
    <Card>
      <Card.Header>Bulk Delete</Card.Header>
      <Card.Body>
        <Card.Text>
          <Button onClick={test}>Delete</Button>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect(key) {
    this.setState({
      key: key,
    }) 
  }

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

  logOut = () => {
    localStorage.setItem('dbPass', '');
    this.props.dispatch({type: 'DB_UPDATE_REQUESTED'});
  }

  render() {
    return (
      <div className="App">
        <Tab.Container activeKey={this.state.key} defaultActiveKey='home'>
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
            <Navbar.Collapse>
              <Nav onSelect={this.handleSelect} >
                <Nav.Item>
                  <Nav.Link eventKey='home'>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='relabel'>Relabel</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='lookup'>View All</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='logout' onClick={this.logOut} >Log Out</Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <Container>
            <QRReaderCard callback={this.uuidScanned} />
            <Tab.Content>
              <Tab.Pane eventKey='home'>
                <MainPage
                  db={this.props.db}
                  uuidScanned={this.uuidScanned}
                  lastUUID={this.props.lastUUID}
                  commit={this.commit}
                  queue={this.props.queue}
                  clearQueue={this.clearQueue}
                  bulkCommit={this.bulkCommit}
                  bulkApply={this.bulkApply}
                />
              </Tab.Pane>
              <Tab.Pane eventKey='relabel'>
                <RelabelCard />
                <BulkDelete db={this.props.db} queue={this.props.queue} handleSubmit={this.commit} />
                <Card>
                  <Card.Header>JSON Viewer</Card.Header>
                  <Card.Body>
                    <Card.Text>
                      <code style={{'white-space': 'pre-wrap', 'display': 'block', 'text-align': 'left'}}>{JSON.stringify(this.props.db[this.props.lastUUID], null, 2)}</code>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey='lookup'>
                <DBDumperCard db={this.props.db} handleClick={this.uuidScanned} />
                <HierarchialDumper db={this.props.db} handleClick={this.uuidScanned} commit={this.commit} />
              </Tab.Pane>
              <Tab.Pane eventKey='logout'>
                Logging out...
              </Tab.Pane>
            </Tab.Content>
          </Container>
        </Tab.Container>
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
