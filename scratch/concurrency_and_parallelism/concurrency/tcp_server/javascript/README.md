# Javascript Concurrency

JavaScript is based upon a single event loop which handles one event at a time. 

In Node.js the default is that everything runs in parallel, except CPU intensive operations. This means is that all I/O code in Node.js is non-blocking, while all non-I/O code in Node.js is blocking.  This means that CPU heavy tasks will block other tasks from being executed. If you want to know how the single event loop works in Node.js, please look at the following videos:

[![Morning Keynote - Everything you need to know about Node.js Event Loop - Bert Belder - IBM](http://img.youtube.com/vi/PNa9OMajw9w/0.jpg)](http://www.youtube.com/watch?v=PNa9OMajw9w "Morning Keynote - Everything you need to know about Node.js Event Loop - Bert Belder - IBM")

[![Phillip Roberts: What the heck is Event Loop anyway? JSConf EU](http://img.youtube.com/vi/8aGhZQkoFbQ/0.jpg)](http://www.youtube.com/watch?v=8aGhZQkoFbQ "Phillip Roberts: What the heck is Event Loop anyway? JSConf EU")


## Problem

* In browser environment, the browser will not react to user events like a mouse click while executing a CPU intensive task - the browser "freezes". 
* In Node.js server, the server will not respond to any new request while executing a single, heavy request.  This is certainly not a desirable. Therefore, CPU intensive tasks should be offloaded from the main event loop onto dedicated workers. 

## Solution

* In a browser environment, Web Workers can be used. 
* In Node.js, child processes are available. An application is split into  separate, decoupled parts, which can run independent of each other in a separate processes. Effectively, this results in an architecture that achieves concurrency by means of isolated processes and message passing.
