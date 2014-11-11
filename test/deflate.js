
var test = require('tape');
var request = require('../');
var zlib = require('zlib');
var http = require('http');
var through = require('through2');
var fs = require('fs');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Encoding': 'deflate'});
  req.pipe(zlib.createDeflate()).pipe(res);
});

test('deflate', function (t) {
  t.plan(1);
  server.listen(0, function () {
    var port = server.address().port;
    check(t, port);
  });
  t.on('end', server.close.bind(server));
});

function check (t, port) {
  var r = request({
    uri: 'http://localhost:' + port,
    method: 'post'
  });
  
  fs.createReadStream(__dirname + '/data.txt')
    .pipe(r).pipe(through(write, end));
  
  var data = '';
  function write (row, enc, next) { data += row; next(); }
  function end () {
    t.equal(data, 'beep boop');
  }
}