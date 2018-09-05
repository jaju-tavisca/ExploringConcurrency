const http = require('http');
const request = require('sync-request');
const fs = require('fs');
const pid = process.pid;

const port = 8080;
const url = 'https://national-stock-service.herokuapp.com/stocks/AAPL';
let requestCount = 1;

function makeNetworkCallSync(req, res) {
	const requestTag = `Request#${requestCount}`;
	console.log(`${requestTag} being handled by server[${pid}]\n`);
	res.write(`${requestTag} being handled by server[${pid}]\n`);
	console.time(requestTag);
	let response = request('GET', url, {
	  headers: {
        'User-Agent': 'request'
	  },
	});
	if (response.statusCode >= 300) {
      console.timeEnd(requestTag);
	  let errorMessage = response.statusCode + " " + response.body.toString('utf-8');
      res.end(`Failed handling ${requestTag} by server[${pid}], Error = ${errorMessage}\n`);
	} else {
      console.timeEnd(requestTag);
  	  let body = response.body;
      console.log(`${requestTag} Got Response ${body}\n`);
      res.end(`${requestTag} Handled by server[${pid}]\n`);
	}
}

const server = http.createServer((req, res) => {
	makeNetworkCallSync(req, res);
	requestCount++;
});


server.listen(port, () => {
  console.log(`Started Server on port: ${port} and processId [${pid}]\n`);
});


// After running the simple server-io-sequential.js code above,
// run this 'ab' command (Don't forget the path slash '/' at the
// end of the URL!):
// 
// => ab -c1 -n1 http://localhost:8080/
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
// Document Length:        76 bytes
//
// Concurrency Level:      1
// Time taken for tests:   1.617 seconds
// Complete requests:      1
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      151 bytes
// HTML transferred:       76 bytes
// Requests per second:    0.62 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       1617.110 [ms] (mean)
// Time per request:       1617.110 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.09 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  1617 1617   0.0   1617    1617
// Waiting:     1615 1615   0.0   1615    1615
// Total:       1617 1617   0.0   1617    1617
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
// Document Length:        76 bytes
//
// Concurrency Level:      1
// Time taken for tests:   10.293 seconds
// Complete requests:      5
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      755 bytes
// HTML transferred:       380 bytes
// Requests per second:    0.49 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       2058.604 [ms] (mean)
// Time per request:       2058.604 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.07 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  1843 2058 426.0   1887    2819
// Waiting:     1843 2058 425.2   1886    2817
// Total:       1844 2059 426.0   1887    2819
//
// Percentage of the requests served within a certain time (ms)
//   50%   1864
//   66%   1910
//   75%   1910
//   80%   2819
//   90%   2819
//   95%   2819
//   98%   2819
//   99%   2819
//  100%   2819 (longest request)
//  
// =================================================================
//
// Now running all the 5 requests concurrently:
//
//  => ab -c5 -n5 http://localhost:8080/
//
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
// Document Length:        78 bytes
//
// Concurrency Level:      5
// Time taken for tests:   6.400 seconds
// Complete requests:      5
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      765 bytes
// HTML transferred:       390 bytes
// Requests per second:    0.78 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       6399.512 [ms] (mean)
// Time per request:       1279.902 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.12 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.1      0       0
// Processing:  6398 6399   0.2   6399    6399
// Waiting:     1280 4002 2047.0   4811    6398
// Total:       6399 6399   0.1   6399    6399
//
// Percentage of the requests served within a certain time (ms)
//   50%   6399
//   66%   6399
//   75%   6399
//   80%   6399
//   90%   6399
//   95%   6399
//   98%   6399
//   99%   6399
//  100%   6399 (longest request)
//
// =================================================================
