<?php

// Start user session
session_start();

$db_password = 'changeme';

// Ensure that the api can be used externally
// TODO: Figure out what the proper thing to do here is, as opposed to just adding things until it works.
if(array_key_exists('HTTP_ORIGIN', $_SERVER)) {
  $http_origin = $_SERVER['HTTP_ORIGIN'];

  // TODO: Whitelist
  //if($http_origin == "http://www.domain1.com" || $http_origin == "http://www.domain2.com") {  
    header("Access-Control-Allow-Origin: $http_origin");
  //}

  header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, api-key');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

if (array_key_exists('HTTP_API_KEY', $_SERVER) && $_SERVER['HTTP_API_KEY'] === 'test') {
} else {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  } else {
    //http_response_code(403);
    //die();
  }
}



require_once($_SERVER['DOCUMENT_ROOT'] . '/lib/AltoRouter/AltoRouter.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/lib/json.php');

$router = new AltoRouter();
$router->setBasePath('/api/v1');

$router->map('OPTIONS', '/', function() {
  jsonResponse([
  ]);
});

$router->map('GET', '/info', function() {
  jsonResponse([
    'revisionDate' => 'hello',
  ]);
});

################################################################################
################################################################################
################################################################################

function scanTag($uuid) {
  global $db_password;
  $db = pg_connect('host=db user=postgres password=' . $db_password);
    
  $result = pg_query_params($db, 'INSERT INTO tagmetadata (uuid, lastscanned) VALUES ($1, NOW()) ON CONFLICT (uuid) DO UPDATE SET lastscanned = NOW()', [$uuid]);

  pg_free_result($result);
  pg_close($db);
}

// For frontend
$router->map('OPTIONS', '/scan/[:uuid]', function() { echo 'test'; });
$router->map('PUT', '/scan/[:uuid]', function($uuid) { scanTag($uuid); });

################################################################################
################################################################################
################################################################################

function parseTagLine($line) {
  $line['labelprinted'] = ($line['labelprinted'] == 't') ? true : false;

  // Set nulls to empty defaults
  if (!$line['containertype'])
    $line['containertype'] = '';
  if (!$line['label'])
    $line['label'] = '';
  if (!$line['parent'])
    $line['parent'] = '';
  if (!$line['comment'])
    $line['comment'] = '';

  return $line;
}

// TODO: Join metadata?
function getTag($id) {
  global $db_password;
  $db = pg_connect('host=db user=postgres password=' . $db_password);

  $result = pg_query_params($db, 'SELECT * FROM tags WHERE uuid = $1', array($id));
  $line = pg_fetch_array($result, null, PGSQL_ASSOC);
  jsonResponse(parseTagLine($line));

  pg_free_result($result);
  pg_close($db);
}

// TODO: Join metadata?
function getAllTags() {
  global $db_password;
  $db = pg_connect('host=db user=postgres password=' . $db_password);

  //$result = pg_query($db, 'SELECT * FROM tags');
  $result = pg_query($db, 'SELECT * FROM tagmetadata FULL OUTER JOIN tags ON (tags.uuid = tagmetadata.uuid)');
  $output = array();
  while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
    $record = parseTagLine($line);
    $uuid = $record['uuid'];
    unset($record['uuid']);

    $output[$uuid] = $record;
  }
  jsonResponse($output);

  pg_free_result($result);
  pg_close($db);
}

// For frontend
$router->map('OPTIONS', '/tags', function() { echo 'test'; });
$router->map('GET', '/tags', function() { getAllTags(); });

// For manual
$router->map('GET', '/tag', function() { getAllTags(); });
$router->map('GET', '/tag/', function() { getAllTags(); });
$router->map('GET', '/tags/', function() { getAllTags(); });
$router->map('GET', '/tag/all', function() { getAllTags(); });
$router->map('GET', '/tag/list', function() { getAllTags(); });
$router->map('GET', '/tag/[:id]', function($id) { getTag($id); });
$router->map('GET', '/tag/[:id]/', function($id) { getTag($id); });

function updateTag($uuid, $data) {
  $record = [];

  $containertype = '';
  if (array_key_exists('containertype', $data))
    $containertype = $data['containertype'];

  $label = '';
  if (array_key_exists('label', $data))
    $label = $data['label'];

  $parent = '';
  if (array_key_exists('parent', $data))
    $parent = $data['parent'];

  $comment = '';
  if (array_key_exists('comment', $data))
    $comment = $data['comment'];

  $labelprinted = 'f';
  if (array_key_exists('labelprinted', $data)) {
    $labelprinted = $data['labelprinted'];

    if ($labelprinted == 1)
      $labelprinted = 't';
    if ($labelprinted == 0)
      $labelprinted = 'f';
  }
  
  $query = 'INSERT INTO tags VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (uuid) DO UPDATE SET containertype=$7, label=$8, parent=$9, comment=$10, labelprinted=$11';

  global $db_password;
  $db = pg_connect('host=db user=postgres password=' . $db_password);

  $result = pg_query_params($db, $query, [$uuid, $containertype, $label, $parent, $comment, $labelprinted, $containertype, $label, $parent, $comment, $labelprinted]);

  #$output = array();
  #while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
  #  array_push($output, parseTagLine($line));
  #}
  #jsonResponse($output);

  pg_free_result($result);
  pg_close($db);
}

function updateTags() {
  $requestData = json_decode(file_get_contents('php://input'), true);

  foreach ($requestData as $uuid => $record) {
    updateTag($uuid, $record);
  }
}
$router->map('PUT', '/tags', function() { updateTags(); });



function replaceTag($old, $new) {
  #$result = pg_query_params($db, $query, [$new, $old, $new, $new, $old]);
  
  $query1 = 'BEGIN;';
  $query2 = 'UPDATE tags SET uuid = $1 WHERE uuid = $2;';
  $query3 = 'DELETE FROM tagmetadata WHERE uuid = $1;';
  $query4 = 'UPDATE tagmetadata SET uuid = $1 WHERE uuid = $2;';
  $query5 = 'COMMIT;';

  global $db_password;
  $db = pg_connect('host=db user=postgres password=' . $db_password);

  pg_query($db, $query1);
  echo pg_last_error($db);
  pg_query_params($db, $query2, [$new, $old]);
  echo pg_last_error($db);
  pg_query_params($db, $query3, [$new]);
  echo pg_last_error($db);
  pg_query_params($db, $query4, [$new, $old]);
  echo pg_last_error($db);
  pg_query($db, $query5);
  echo pg_last_error($db);

  pg_free_result($result);
  pg_close($db);
}

$router->map('OPTIONS', '/replace/[:oldTag]', function($oldTag) {});
$router->map('PUT', '/replace/[:oldTag]', function($oldTag) {
  $newTag = file_get_contents('php://input');
  replaceTag($oldTag, $newTag);
});

################################################################################
################################################################################
################################################################################

$match = $router->match();

// Either call the function (if it exists) or throw a 404 (Not Found) error
if( $match && is_callable($match['target'])) {
  call_user_func_array($match['target'], $match['params']);
} else {
  header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
}

?>
