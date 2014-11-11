
var test = require('tape');
var request = require('../');
var zlib = require('zlib');
var http = require('http');
var through = require('through2');
var fs = require('fs');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Encoding': 'gzip'});
  fs.createReadStream(__dirname + '/data.txt')
    .pipe(zlib.createGzip()).pipe(res);
});

test('gzip', function (t) {
  t.plan(1);
  server.listen(0, function () {
    var port = server.address().port;
    check(t, port);
  });
  t.on('end', server.close.bind(server));
});

function check (t, port) {
  var r = request({
    uri: 'http://localhost:' + port
  });
  r.pipe(through(write, end));
  
  var data = '';
  function write (row, enc, next) { data += row; next(); }
  function end () {
    t.equal(data, 'beep boop');
  }
}