const http = require('http');
const request = require('request');
const pid = process.pid;

const port = 8080;
const url = 'https://national-stock-service.herokuapp.com/stocks/AAPL';
let requestCount = 1;

function makeNetworkCallASync(req, res) {
	const requestTag = `Request#${requestCount}`;
	console.log(`${requestTag} being handled by server[${pid}]\n`);
	res.write(`${requestTag} being handled by server[${pid}]\n`);
	console.time(requestTag);
    let options = {
      url: url,
      headers: { 'User-Agent': 'request' }
    };
    request.get(options, 'utf-8', (err, resp, body) => {
	  if (err) {
        console.timeEnd(requestTag);
        console.log('Error', err);
        res.end(`Failed handling ${requestTag} by server[${pid}], Error = ${err.message}\n`);
	  } else {
   	   console.timeEnd(requestTag);
       console.log(`${requestTag} Got Response ${body}\n`);
   	   res.end(`${requestTag} Handled by server[${pid}], Data = ${body}\n`);
      }
    });
}

const server = http.createServer((req, res) => {
	makeNetworkCallASync(req, res);
	requestCount++;
});


server.listen(port, () => {
  console.log(`Started Server on port: ${port} and processId [${pid}]\n`);
});

// After running the simple server-io-concurrent.js code above,
// run this 'ab' command (Don't forget the path slash '/' at the
// end of the URL!):
// 
// => ab -c1 -n1 http://localhost:8080/
//
// 160 => ab -c1 -n1 http://localhost:8080/
// This is ApacheBench, Version 2.3 <$Revision: 1807734 $>
// Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
// Licensed to The Apache Software Foundation, http://www.apache.org/
//
// Benchmarking localhost (be patient).....done
//
//
// Server Software:
// Server Hostname:        localhost
// Server Port:            8080
//
// Document Path:          /
// Document Length:        199 bytes
//
// Concurrency Level:      1
// Time taken for tests:   1.416 seconds
// Complete requests:      1
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      274 bytes
// HTML transferred:       199 bytes
// Requests per second:    0.71 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       1415.756 [ms] (mean)
// Time per request:       1415.756 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.19 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  1415 1415   0.0   1415    1415
// Waiting:       20   20   0.0     20      20
// Total:       1416 1416   0.0   1416    1416
// =================================================================
// 
// Issuing 5 requests one after another:
// 
// => ab -c1 -n5 http://localhost:8080/
// 
// This is ApacheBench, Version 2.3 <$Revision: 1807734 $>
// Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
// Licensed to The Apache Software Foundation, http://www.apache.org/
//
// Benchmarking localhost (be patient).....done
//
//
// Server Software:
// Server Hostname:        localhost
// Server Port:            8080
//
// Document Path:          /
// Document Length:        201 bytes
//
// Concurrency Level:      1
// Time taken for tests:   8.931 seconds
// Complete requests:      5
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      1380 bytes
// HTML transferred:       1005 bytes
// Requests per second:    0.56 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       1786.243 [ms] (mean)
// Time per request:       1786.243 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.15 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  1544 1786 246.1   1846    2057
// Waiting:        1    2   1.8      2       6
// Total:       1545 1786 246.1   1846    2057
//
// Percentage of the requests served within a certain time (ms)
//   50%   1645
//   66%   2047
//   75%   2047
//   80%   2057
//   90%   2057
//   95%   2057
//   98%   2057
//   99%   2057
//  100%   2057 (longest request)
// 
// =================================================================
// 
// Issuing 5 concurrent requests:
// 
//  166 => ab -c5 -n5 http://localhost:8080/
// This is ApacheBench, Version 2.3 <$Revision: 1807734 $>
// Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
// Licensed to The Apache Software Foundation, http://www.apache.org/
//
// Benchmarking localhost (be patient).....done
//
//
// Server Software:
// Server Hostname:        localhost
// Server Port:            8080
//
// Document Path:          /
// Document Length:        201 bytes
//
// Concurrency Level:      5
// Time taken for tests:   1.995 seconds
// Complete requests:      5
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      1380 bytes
// HTML transferred:       1005 bytes
// Requests per second:    2.51 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       1995.014 [ms] (mean)
// Time per request:       399.003 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.68 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.1      0       1
// Processing:  1985 1992   3.9   1994    1994
// Waiting:       18   18   0.0     18      18
// Total:       1986 1993   3.9   1994    1995
//
// Percentage of the requests served within a certain time (ms)
//   50%   1994
//   66%   1994
//   75%   1994
//   80%   1995
//   90%   1995
//   95%   1995
//   98%   1995
//   99%   1995
//  100%   1995 (longest request)
//
// =================================================================

