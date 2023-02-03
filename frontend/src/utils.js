// Library Imports
import fileDownload from 'js-file-download';
import csvStringify from 'csv-stringify';
import csvParse from 'csv-parse';

export const formatDateTime = () => {
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

// TODO: Unit tests?
export const toDBFormat = (item) => {
  let result = {};

  console.log({
    'before': item,
    'after': result,
  })
}

export const fromDBFormat = (item) => {
}

export const normalizeCard = (item) => {
  let result = {}

  Object.keys(item).forEach((key) => {
    // Ignore empty fields
    if (item[key] !== '') {
      result[key] = item[key];
    }

    // Fix FALSE
    if (result && result.labelPrinted && result.labelPrinted === 'FALSE') {
      result[key] = false;
    }
  });

  return result;
}

export const normalizeCards = (items) => {
  let result = {}

  Object.keys(items).forEach((key) => {
    result[key] = normalizeCard(items[key])
  })

  return result;
}

export const toJSONFile = (items) => fileDownload(JSON.stringify(normalizeCards(items), null, 2), 'dbDump_' + formatDateTime() + '.json');

export const toCSVFile = (items) => {
  const normalized = normalizeCards(items);

  csvStringify(Object.keys(normalized).map(uuid => normalized[uuid]), {
    header: true,
    quoted: true,
    quoted_empty: false,
    columns: [
      {key: '_id', header: 'UUID'},
      {key: 'label', header: 'Label'},
      {key: 'labelPrinted', header: 'Printed'},
      {key: 'location', header: 'Location'},
      {key: 'containerMakeModel', header: 'Make/Model'},
      {key: 'comments', header: 'Comments'},
      {key: '_rev', header: 'Revision'},
    ],
  }, (err, output) => fileDownload(output, 'dbDump_' + formatDateTime() + '.csv'))
};

// TODO: Handle Multiple Files?
export const fileToRecords = (files, callback) => {
  const loader = new FileReader();

  loader.onload = (e) => {
    const extension = files[0].name.substr(-4);
    const content = e.target.result;

    if (extension === '.csv' || extension === '.CSV') {
      csvParse(content, {
        objname: '_id',
        from_line: 2, // Ignore header
        columns: [
          '_id',
          'label',
          'labelPrinted',
          'location',
          'containerMakeModel',
          'comments',
          '_rev',
        ],
      }, (err, output) => {
        callback(normalizeCards(output));
      })
    }

    if (extension === 'json' || extension === 'JSON') {
      callback(normalizeCards(JSON.parse(content)));
    }
  };

  loader.readAsText(files[0]);
};

// Source: https://stackoverflow.com/a/8212878
// License: CC BY-SA 3.0
export const humanizeDuration = (milliseconds) => {
  // TIP: to find current time in milliseconds, use:
  // var  current_time_milliseconds = new Date().getTime();

  function numberEnding (number) {
    return (number > 1) ? 's' : '';
  }

  var temp = Math.floor(milliseconds / 1000);
  var years = Math.floor(temp / 31536000);

  if (years)
    return years + ' year' + numberEnding(years);

  //TODO: Months! Maybe weeks?
  var days = Math.floor((temp %= 31536000) / 86400);
  if (days)
    return days + ' day' + numberEnding(days);

  var hours = Math.floor((temp %= 86400) / 3600);
  if (hours)
    return hours + ' hour' + numberEnding(hours);

  var minutes = Math.floor((temp %= 3600) / 60);
  if (minutes)
    return minutes + ' minute' + numberEnding(minutes);

  var seconds = temp % 60;
  if (seconds)
    return seconds + ' second' + numberEnding(seconds);

  return 'just now'; //'less than a second' //or other string you like;
}
