
module.exports = request;

var duplexer = require('duplexer');
var hyperquest = require('hyperquest');
var zlib = require('zlib');
var through = require('through2');

var headers = {
  'content-type': 'application/json',
  'accept-encoding': 'gzip,deflate'
};

function request (opts) {
  opts.headers = headers;
  var method = opts.method || 'get';
  var rs = through();
  var ws = hyperquest(opts, function (err, res) {
    if (err)
      dup.emit('error', err);
    var encoding = res.headers['content-encoding'];
    if (encoding === 'gzip')
      this.pipe(zlib.createGunzip()).pipe(rs);
    else if (encoding === 'deflate')
      this.pipe(zlib.createInflate()).pipe(rs);
    else
      this.pipe(rs);
    dup.emit('response', res);
  });
  var dup = (method !== 'get' && method !== 'delete')
      ? duplexer(ws, rs) : rs;
  return dup;
}