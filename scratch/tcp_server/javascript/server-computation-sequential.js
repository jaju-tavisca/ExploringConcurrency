const http = require('http');
const pid = process.pid;

const port = 8080;
let requestCount = 1;
const server = http.createServer((req, res) => {
	const requestTag = `Request#${requestCount}`;
	console.log(`${requestTag} being handled by server[${pid}]\n`);
	res.write(`${requestTag} being handled by server[${pid}]\n`);
	console.time(requestTag);
	//Simulate CPU work
	let sum = 0;
	for (let i = 0; i < 100e7; i++) {
		sum += i;
	}  
	console.timeEnd(requestTag);
	console.log(`${requestTag} Calculated Sum ${sum}\n`);
	res.end(`${requestTag} Handled by server[${pid}], Sum = ${sum}\n`);
	requestCount++;
});


server.listen(port, () => {
  console.log(`Started Server on port: ${port} and processId [${pid}]\n`);
});

// To verify that the balancer we're going to create is going to
// work, We've included the process pid in the HTTP response to 
// identify which instance of the application is actually handling
// a request.
// 
// After running the simple server.js code above,
// run this 'ab' command (Don't forget the path slash '/' at the
// end of the URL!):
// 
// => ab -c1 -n10 http://localhost:8080/
// 
// This command will test-load server with 1 concurrent connection
// using 10 requests.
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
// Document Length:        105 bytes
//
// Concurrency Level:      1
// Time taken for tests:   43.087 seconds
// Complete requests:      10
// Failed requests:        0      <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      1800 bytes
// HTML transferred:       1050 bytes
// Requests per second:    0.23 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       4308.715 [ms] (mean)
// Time per request:       4308.715 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.04 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  3671 4308 392.5   4345    4951
// Waiting:     3669 4308 393.0   4344    4950
// Total:       3671 4309 392.5   4345    4951
//
// Percentage of the requests served within a certain time (ms)
//   50%   4345
//   66%   4445
//   75%   4491
//   80%   4727
//   90%   4951
//   95%   4951
//   98%   4951
//   99%   4951
//  100%   4951 (longest request)
// 
// 
// =================================================================
// 
// Now running with 10 concurrent requests.
// 
// 
// => ab -c10 -n10 http://localhost:8080/
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
// Document Length:        105 bytes
//
// Concurrency Level:      10
// Time taken for tests:   41.805 seconds
// Complete requests:      10
// Failed requests:        0     <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      1800 bytes
// HTML transferred:       1050 bytes
// Requests per second:    0.24 [#/sec] (mean) <=== Look at this! ===
// Time per request:       41805.094 [ms] (mean)
// Time per request:       4180.509 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.04 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        1    1   0.2      1       1
// Processing: 41802 41803   0.4  41803   41803
// Waiting:     3528 22337 12999.0  24379   41801
// Total:      41803 41804   0.2  41804   41804
//
// Percentage of the requests served within a certain time (ms)
//   50%  41804
//   66%  41804
//   75%  41804
//   80%  41804
//   90%  41804
//   95%  41804
//   98%  41804
//   99%  41804
//  100%  41804 (longest request)
// 
// 
