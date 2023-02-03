// Library Imports
import React from 'react';
import { connect } from 'react-redux';
import { Tab, Nav, Navbar, Card, Container, Form, Button, ButtonGroup, Table, InputGroup, FormControl } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';

// Component Imports
import QRCodeReaderCard from './QRCodeReaderCard';
import RenderCard from './RenderCard';
import QueueCard from './QueueCard';
import RelabelCard from './RelabelCard';
import QRInput from './QRInput';
import MakeModelOptions from './MakeModelOptions';
import DBDumperCard from './DBDumperCard';
import BulkLabel from './BulkLabel';
import BulkLocation from './BulkLocation';
import BulkMakeModel from './BulkMakeModel';
import BulkDelete from './BulkDelete';



const emptyUUID = {};

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
    this.requestDBUpdate();
  }

  //bulkCommit = () => this.props.dispatch({type: 'COMMIT_UUID_QUEUE'});

  clearQueue = () => this.props.dispatch({type: 'CLEAR_UUID_QUEUE'});
  requestDBUpdate = () => this.props.dispatch({type: 'GET_TAGS_REQUESTED'});
  uuidScanned = (uuid) => {
    if (uuid != this.props.lastUUID) {
      console.log('Scan!');
      this.props.dispatch({type: 'UUID_SCANNED', data: uuid});
    }
    this.props.dispatch({type: 'UUID_SELECTED', data: uuid});
  };
  uuidSelected = (uuid) => this.props.dispatch({type: 'UUID_SELECTED', data: uuid});
  postTags = (data) => this.props.dispatch({type: 'POST_TAGS_REQUESTED', data: data});

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
    this.requestDBUpdate();
  }

  render() {
    if (!this.props.tags)
      return null;

    let { tags, lastUUID, queue } = this.props;
    //let { uuidScanned, commit, clearQueue, bulkCommit, bulkApply } = this;

    return (
      <div className="App">
        <Tab.Container activeKey={this.state.key} defaultActiveKey='home'>
          <Navbar bg='dark' variant='dark' expand='lg'>
            <Navbar.Brand onClick={() => this.setState({key: 'home'})} >
              <img src='/logo.svg' width='30' height='30' alt='Logo' />{' '} Inventory Manager
            </Navbar.Brand>
            <Navbar.Toggle />
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
                <RenderCard tags={tags} active={lastUUID} handleSubmit={this.postTags} />
                <QueueCard tags={tags} queue={queue} handleClear={this.clearQueue} handleSelect={this.uuidSelected} />
              </Tab.Pane>
              <Tab.Pane eventKey='bulk'>
                <BulkLabel />
                <BulkLocation />
                <BulkMakeModel />
                <BulkDelete />
                <QueueCard tags={tags} queue={queue} handleClear={this.clearQueue} handleSelect={this.uuidSelected} />
              </Tab.Pane>
              <Tab.Pane eventKey='relabel'>
                <RelabelCard />
              </Tab.Pane>
                <Tab.Pane eventKey='lookup'>
                <DBDumperCard tags={tags} handleClick={this.uuidSelected} handleSubmit={this.postTags} />
                <JSONViewerCard data={tags} />
              </Tab.Pane>
              <Tab.Pane eventKey='other'>
                <JSONViewerCard data={tags[lastUUID]} />
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
    tags: state.tags,
    lastUUID: state.lastScannedUUID,
    queue: state.scannedUUIDqueue,
  }),
  dispatch => ({
    dispatch,
  }),
)(App);





/*
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
*/

