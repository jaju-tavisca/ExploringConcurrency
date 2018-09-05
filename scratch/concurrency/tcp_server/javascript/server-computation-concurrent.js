const http = require('http');
const pid = process.pid;
const cluster = require('cluster');
const os = require('os');

// The cluster module gives us the handy Boolean flag isMaster to 
// determine if this cluster.js file is being loaded as a master
// process or not.  The first time we execute this file, we will 
// be executing the master process and that isMaster flag will be
// set to true.
// 
// In this case we can instruct the master process to fork our server
// as many times as we have CPU cores.
// 
if (cluster.isMaster) {
	// We just read the number of CPUs we have using the os module
	const cpus = os.cpus().length;
	console.log(`Machine has ${cpus} CPUs.  Forking for ${cpus} CPUs`);
	console.log(`Master PID[${pid}]`);
	// Then using the for loop we simply create as many workers as 
	// the number of CPUs in the system to take advantage of all the
	// available processing power.
	for (let i = cpus - 1; i >= 0; i--) {
		// When the cluster.fork() is executed from the master process
		// the current file, cluster.js is run again, but this time in
		// worker mode with isMaster flag set to false.  There is
		// actually another flag set to true in this case if you need
		// to use it, which is the isWorker flag.
		cluster.fork();
	}
} else { // Worker
	// When the application runs as a worker, it can start doing the
	// actual work.  This is where we need to define our server logic,
	// which, for this example, we can do by requiring the server.js
	// file that we have already.
	// 
	const port = 8080;
	let requestCount = 1;
	const server = http.createServer((req, res) => {
		const requestTag = `Request#${requestCount}`;
		console.log(`${requestTag} being handled by WORKER server[${pid}]\n`);
		res.write(`${requestTag} being handled by WORKER server[${pid}]\n`);
		new Promise((resolve, reject) => {
			console.time(requestTag);
			setTimeout(() => {
				//Simulate CPU work
				let sum = 0;
				for (let i = 0; i < 100e7; i++) {
					sum += i;
				}  
				console.timeEnd(requestTag);
				resolve(sum);
			}, 0);
		})
		.then(sum => {
			console.log(`${requestTag} handled by WORKER server[${pid}], Calculated Sum ${sum}\n`);
			res.end(`${requestTag} Handled by WORKER server[${pid}], Sum = ${sum}\n`);
		})
		.catch(err => {
			console.log(`Failed handling ${requestTag} by WORKER server[${pid}], Error = ${err.message}\n`);
			res.end(`Failed handling ${requestTag} by WORKER server[${pid}], Error = ${err.message}\n`);
		});
		requestCount++;
	});
	server.listen(port, () => {
	  console.log(`Started WORKER Server on port: ${port} and process Id: ${pid}\n`);
	});
}

// After running the simple server.js code above,
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
// Document Length:        116 bytes
//
// Concurrency Level:      1
// Time taken for tests:   3.584 seconds
// Complete requests:      1
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      191 bytes
// HTML transferred:       116 bytes
// Requests per second:    0.28 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       3583.987 [ms] (mean)
// Time per request:       3583.987 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.05 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  3584 3584   0.0   3584    3584
// Waiting:       25   25   0.0     25      25
// Total:       3584 3584   0.0   3584    3584
//
//======================================================================
// 
// Issue 10 requests non-concurrently
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
// Document Length:        116 bytes
//
// Concurrency Level:      1
// Time taken for tests:   42.936 seconds
// Complete requests:      10
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      1910 bytes
// HTML transferred:       1160 bytes
// Requests per second:    0.23 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       4293.647 [ms] (mean)
// Time per request:       4293.647 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.04 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    0   0.0      0       0
// Processing:  3668 4293 321.1   4427    4525
// Waiting:        1    3   6.1      1      21
// Total:       3668 4294 321.1   4427    4525
//
// Percentage of the requests served within a certain time (ms)
//   50%   4427
//   66%   4449
//   75%   4491
//   80%   4508
//   90%   4525
//   95%   4525
//   98%   4525
//   99%   4525
//  100%   4525 (longest request)
//
// =============================================================================
// 
// Issue 10 concurrent requests
// 
// => ab -c10 -n10 http://localhost:8080/
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
// Document Length:        118 bytes
//
// Concurrency Level:      10
// Time taken for tests:   19.824 seconds
// Complete requests:      10
// Failed requests:        0  <=== ALL REQUESTS WERE SERVED!!! ===
// Total transferred:      1930 bytes
// HTML transferred:       1180 bytes
// Requests per second:    0.50 [#/sec] (mean)  <=== Look at this! ===
// Time per request:       19824.223 [ms] (mean)
// Time per request:       1982.422 [ms] (mean, across all concurrent requests)
// Transfer rate:          0.10 [Kbytes/sec] received
//
// Connection Times (ms)
//               min  mean[+/-sd] median   max
// Connect:        0    1   0.2      1       1
// Processing:  4071 13502 6205.2  11933   19823
// Waiting:        3 6399 4993.0   4107   11934
// Total:       4072 13503 6205.0  11933   19823
//
// Percentage of the requests served within a certain time (ms)
//   50%  11933
//   66%  19794
//   75%  19794
//   80%  19823
//   90%  19823
//   95%  19823
//   98%  19823
//   99%  19823
//  100%  19823 (longest request)
//
// =============================================================================
