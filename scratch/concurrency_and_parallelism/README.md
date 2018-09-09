# Concurrency And Parallelism

Concurrency and Parallelism, these two words have been used quite synonomously and have been easily interchanged with the other.  But many, like Phil Wadler, Simon Marlow have given very precise distinctions between these.  In this melody, we will delineate concurrency and parallelism using two problems.

* _Concurrency_: Creating an Echo TCP-Server
* _Parallelism_: Splitting a Task (I/O or Computational task)

**BRAMHA** Lets tackle Concurrency by looking at this single-threaded Echo TCP-Server in Java.  It waits for connections after creating a ```ServerSocket```.  Once it accepts an incoming socket connection from a client, it goes into an infinite loop, serving that client.  

```java
public class Server implements AutoCloseable {
  private final ServerSocket server; 
	
  public Server(String host, int port, int backlogConnectionQueueLength) throws UnknownHostException, IOException {
	server = new ServerSocket(port, backlogConnectionQueueLength, InetAddress.getByName(host));
	System.out.println(Thread.currentThread() + " Created Server");
  }
  public void start() {
	 System.out.println(Thread.currentThread() + " Server Ready: " + server);
    while (true) {
      acceptAndHandleNewClient(server);
	}
  }

  private void acceptAndHandleNewClient(ServerSocket server) {
    System.out.println(Thread.currentThread() + " Waiting for Incoming connections...");
	try (Socket clientSocket = server.accept()) {
	  handleNewClient(clientSocket);
	} catch (IOException e) {
	  e.printStackTrace();
	}
  }
  
  private void handleNewClient(Socket clientSocket) throws IOException {
    System.out.println(Thread.currentThread() + " Received Connection from " + clientSocket);
    BufferedReader is = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
    PrintStream os = new PrintStream(clientSocket.getOutputStream());
    // Echo data back to the client.
    String line = null;
    while ((line = is.readLine()) != null) {
      System.out.println(Thread.currentThread() + " Server Got => " + line);
      if (line.equalsIgnoreCase("QUIT"))
        break;
      else {
        System.out.println(Thread.currentThread() + " Server echoing line back => " + line);
        os.println(line);
        os.flush();
      }
    }
    System.out.println(Thread.currentThread() + " Server Closing Connection by Sending => Ok");
    os.println("Ok");
    os.flush();
    is.close();
    os.close();
  }
	
  public void close() throws IOException {
    server.close();
  }
	
  public static void main(String[] args) {
    try (Server server = new Server("localhost", 8080, 50)) {
      server.start();
    } catch (IOException e) {
      System.out.println(e);
    }
  }
}
```

**BRAMHA** Let me use ```telnet``` as one of the clients.  As you can see, the ```main thread``` is servicing it and its busy all the while doing that.  

```shell

```

Any other telnet sessions will wait for the connection to be accepted until the earlier client session ```QUIT```s.  I can also do this by running 4 clients who try to connect at the same time.

```java
public class Client implements AutoCloseable {
  private final Socket client;
  private final DataOutputStream os;
  private final BufferedReader is;

  public Client(String host, int port) throws UnknownHostException, IOException {
    client = new Socket(host, port);
    os = new DataOutputStream(client.getOutputStream());
    is = new BufferedReader(new InputStreamReader(client.getInputStream()));
  }

  public void sendReceive(String message) {
    try {
      System.out.println("Thread = " + Thread.currentThread());
      System.out.println("Sending to Server: " + message);
      os.writeBytes(message + "\n");
      os.flush();
      // keep on reading from/to the socket till we receive the "Ok" from Server,
      // once we received that we break.
      String responseLine = is.readLine();
      if (responseLine != null) 
        System.out.println("Server Sent: " + responseLine);
		else
		  System.out.println("Server Sent: No Response");
    } catch (UnknownHostException e) {
      System.err.println("Don't know about host: hostname");
    } catch (IOException e) {
      System.out.println(e);
    }
  }

  public void close() throws IOException {
    sendReceive("QUIT");
    is.close();
    os.close();
  }
  
  public static void main(String[] args) throws UnknownHostException, IOException, InterruptedException {
    int port = 8080;
    String host = "localhost";
    int totalClients = 4;
    Stream.iterate(1, x -> x + 1).limit(totalClients).forEach(id -> {
      new Thread(() -> {
        try (Client client = new Client(host, port)) {
          client.sendReceive("HELO" + id);
          Thread.sleep(2000);
        } catch (InterruptedException e) {
          e.printStackTrace();
        } catch (UnknownHostException e) {
          e.printStackTrace();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }).start();
    });
  }
}
```

**KRISHNA** Oh, of what use is such a server! 

**BRAMHA** Exactly, so lets make it concurrent, and the way I do it here is wrap the method call ```handleNewConnection(...)``` in a ```CompleteableFuture```.  Using traditional constructs,  a new thread would have been spawned and the server would serve that client in that thread.  But we could do the same using a more modern construct - ```CompleteableFuture```

```java
public class Server implements AutoCloseable {
  private final ServerSocket server;
  ...
  ...  
  public void start() {
    System.out.println(Thread.currentThread() + " Server Ready: " + server);
    while (true) {
      System.out.println(Thread.currentThread() + " Waiting for Incoming connections...");
      try {
        Socket clientSocket = server.accept();
        CompletableFuture.runAsync(() -> {
          try { 
            handleNewConnection(clientSocket);
            clientSocket.close();
          } catch (IOException e) {
            throw new RuntimeException(e);
          } 
        });
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }
  ...
  ...
```

**KRISHNA** So, here each connection gets its own thread and they run oblivious of each other when they get scheduled.  This way no new or existing client is blocked because the server is working with all client(s) at the same time, each in its own thread.

**BRAHMA** So, this is Concurrency.  

**BRAHMA** Let me now show you an example of Parallelism by splitting an I/O task.  Lets say we have ```Porfolio``` comprising of several stocks.  In order to calculate the net worth of a portfolio, it uses a proxy ```NationalStockService``` which reaches out over the network to get price of stocks it holds.  

```
public class Portfolio {
  private Map<String, Integer> stocks = new HashMap<>();
  
  public void add(String ticker, Integer qty) {
    int oldQty = 0;
    if (stocks.containsKey(ticker)) {
      oldQty = stocks.get(ticker);
    }
    stocks.put(ticker, oldQty + qty);
  }
	
  public Double netWorth(StockService stockService) throws Exception {
    System.out.println("Stocks = " + stocks);
    long startTime = System.currentTimeMillis();
    List<Double> prices = stocks.entrySet()
      .stream()
      // comment or uncomment the parallel() call below and see the difference
      .parallel()
      .collect(ArrayList<Double>::new, (acc, entry) -> {
        String ticker = entry.getKey();
        try {
          acc.add(stockService.getPrice(ticker) * entry.getValue());  
        } catch (Exception e) {
          e.printStackTrace();
        }
      }, ArrayList::addAll);
    double worth = prices.stream().reduce(0d, (a, e) -> a + e);
    long timeTaken = System.currentTimeMillis() - startTime;
    System.out.println(String.format("Overall Time %d(ms):", timeTaken));
    return worth;
  }
  
  public static void main(String[] args) throws Exception {
    Portfolio portfolio = new Portfolio();
    portfolio.add("GOOG", 10);
    portfolio.add("AAPL", 20);
    portfolio.add("YHOO", 30);
    portfolio.add("MSFT", 40);
    portfolio.add("ORCL", 40);
    portfolio.add("AMZN", 50);
    portfolio.add("GOOG", 90);
    Thread.sleep(10000);
    double netWorth = portfolio.netWorth(new NationalStockService());
    System.out.println("NetWorth = " + netWorth);
  }
}
```

## Reflections


**BRAHMA** 

**KRISHNA** 

