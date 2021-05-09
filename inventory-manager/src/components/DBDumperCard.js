// Library Imports
import React from 'react';
import { Card, Table, Button, ButtonGroup } from 'react-bootstrap';
import CSVReader from 'react-csv-reader';
import CsvDownloader from 'react-csv-downloader';
import codenamize from '@codenamize/codenamize';
import { formatDateTime, toCSVFile, toJSONFile, fileToRecords } from '../utils';
import { FileDrop } from 'react-file-drop';

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

class FileDropper extends React.Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
  }

  fileInputHandler = (event) => {
    const { files } = event.target;
    fileToRecords(files, console.log);
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

const DBDumperCard = ({db, handleClick, commit}) => {
  const fileInputRef = React.createRef();

  return (
    <Card className='hideOnMobile'>
      <Card.Header>Database Dump</Card.Header>
      <Card.Body>
        <Card.Text>
          <ButtonGroup>
            <Button variant='outline-primary' onClick={() => toCSVFile(db)}>Download CSV</Button>
            <Button variant='outline-primary' onClick={() => toJSONFile(db)}>Download JSON</Button>
          </ButtonGroup>

          <FileDropper />

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
};

export default DBDumperCard;
