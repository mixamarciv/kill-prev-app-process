kill-prev-process-app
============

kills the previous process of this application

## Install

```
git clone https://github.com/mixamarciv/kill-prev-app-process.git
```

## Usage

```js
var prepare_app = require('kill-prev-process-app');
var temp_pids_path = __dirname+'/temp/pid';

prepare_app( temp_pids_path, function () {
  var http = require('http');
  http.createServer().listen(80); 
});

```

```js
var http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});

require('kill-prev-process-app')(function () {
  server.listen(80); 
});
```




## License
MIT
