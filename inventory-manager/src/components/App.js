// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Tab, Nav, Navbar, Card, Container, Form, Button, ButtonGroup, Table, InputGroup, FormControl } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';

// Component Imports
import QRCodeReaderCard from './QRCodeReaderCard';
import QueueCard from './QueueCard';
import { BulkLabel, BulkLocation, BulkMakeModel, BulkDelete } from './BulkModify';
import EditCard from './EditCard';
import DBDumperCard from './DBDumperCard';
import QRInput from './QRInput';
import RelabelCard from './RelabelCard';


const buildTree = (location, entries, db) => {
  let output = {}

  entries.forEach((entry) => {
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
  rawLocations.forEach(location => {
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
  </>
)

const JSONViewerCard = ({data}) => <>
  <Card>
    <Card.Header>JSON Viewer</Card.Header>
    <Card.Body>
      <Card.Text>
        <code style={{'white-space': 'pre-wrap', 'display': 'block', 'text-align': 'left'}}>{JSON.stringify(data, null, 2)}</code>
      </Card.Text>
    </Card.Body>
  </Card>
</>;

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
    if (!this.props.db)
      return null;

    let { db, lastUUID, queue } = this.props;
    let { uuidScanned, commit, clearQueue, bulkCommit, bulkApply } = this;

    return (
      <div className="App">
        <Tab.Container activeKey={this.state.key} defaultActiveKey='home'>
          <Navbar bg='dark' variant='dark'>
            <Navbar.Brand>
              <img src='/logo.svg' width='30' height='30' alt='Logo' />{' '} Inventory Manager
            </Navbar.Brand>

            <Navbar.Collapse>
              <Nav onSelect={this.handleSelect} >
                <Nav.Item>
                  <Nav.Link eventKey='home'>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='bulk'>Bulk</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='relabel'>Relabel</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='lookup'>Search</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='other'>Other</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='logout' onClick={this.logOut} >Log Out</Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <Container>
            <QRCodeReaderCard callback={this.uuidScanned} />
            <Tab.Content>
              <Tab.Pane eventKey='home'>
                <EditCard db={db} active={lastUUID} handleSubmit={commit} />
                <QueueCard db={db} queue={queue} handleClear={clearQueue} handleCommitQueue={bulkCommit} select={uuidScanned} />
              </Tab.Pane>
              <Tab.Pane eventKey='bulk'>
                <QueueCard db={db} queue={queue} handleClear={clearQueue} handleCommitQueue={bulkCommit} select={uuidScanned} />
                <BulkLabel handleSubmit={bulkApply} />
                <BulkLocation handleSubmit={bulkApply} />
                <BulkMakeModel handleSubmit={bulkApply} />
                <BulkDelete db={db} queue={queue} handleSubmit={commit} />
              </Tab.Pane>
              <Tab.Pane eventKey='relabel'>
                <RelabelCard />
              </Tab.Pane>
              <Tab.Pane eventKey='lookup'>
                <HierarchialDumper db={this.props.db} handleClick={this.uuidScanned} commit={this.commit} />
                <DBDumperCard db={this.props.db} handleClick={this.uuidScanned} />
              </Tab.Pane>
              <Tab.Pane eventKey='other'>
                <JSONViewerCard data={db[lastUUID]} />
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
