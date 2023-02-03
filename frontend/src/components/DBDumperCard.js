// Library Imports
import React from 'react';
import { Card, Table, Button, ButtonGroup } from 'react-bootstrap';
import codenamize from '@codenamize/codenamize';
import { toCSVFile, toJSONFile, fileToRecords, humanizeDuration } from '../utils';
import { FileDrop } from 'react-file-drop';

const DBEntryHeader = () => (
  <tr>
    <td>Friendly Name</td>
    <td>Label</td>
    <td>Location</td>
    <td>Container Make/Model</td>
    <td>Label Printed</td>
    <td>Last Scanned</td>
  </tr>
);

const renderTime = (time) => {
  if (time) {
    const then = (new Date(time)).getTime();
    const now = Date.now() + new Date().getTimezoneOffset()*60*1000;
    const duration = now - then;

    return humanizeDuration(duration) + ' ago';
  }

  return '';
}

const DBEntry = ({id, entry, handleClick}) => (
  <tr onClick={handleClick}>
    <td>{codenamize({seed: id, adjectiveCount: 2, maxItemChars: 4})}</td>
    <td>{entry.label}</td>
    <td>{entry.parent}</td>
    <td>{entry.containertype}</td>
    <td>
      <input type='checkbox' checked={entry.labelprinted} />
        </td>
    <td>{renderTime(entry.lastscanned)}</td>
  </tr>
);

class FileDropper extends React.Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
  }

  fileInputHandler = (event) => {
    const { files } = event.target;
    //fileToRecords(files, console.log);
    fileToRecords(files, this.props.commit);
  }

  render() {
    return (
      <div>
        <FileDrop
          onTargetClick={() => this.fileInputRef.current.click()}
          onDrop={(files, event) => this.fileInputHandler({target: {files}})}
        >Drop Files Here</FileDrop>
        <input hidden={true} onChange={this.fileInputHandler} type='file' ref={this.fileInputRef} />
      </div>
    );
  }
}

const DBDumperCard = ({tags, handleClick, commit}) => (
  <Card className='hideOnMobile'>
    <Card.Header>Database Dump</Card.Header>
    <Card.Body>
      <Card.Text>
        <ButtonGroup>
          {/*<Button variant='outline-primary' onClick={() => toCSVFile(tags)}>Download CSV</Button>*/}
          <Button variant='outline-primary' onClick={() => toJSONFile(tags)}>Download JSON</Button>
        </ButtonGroup>

        <FileDropper commit={commit} />

        <Table>
          <thead>
            <DBEntryHeader />
          </thead>
          <tbody>
            { Object.keys(tags).map(key => <DBEntry id={key} entry={tags[key]} handleClick={() => handleClick(key)} />) }
          </tbody>
        </Table>
      </Card.Text>
    </Card.Body>
  </Card>
);

export default DBDumperCard;
