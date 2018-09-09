import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.util.Collections;

public class ConcurrentServer2 implements AutoCloseable {
    private final ServerSocket server;

    public ConcurrentServer2(String host, int port, int backlogConnectionQueueLength)
            throws IOException {
        server = new ServerSocket(port, backlogConnectionQueueLength, InetAddress.getByName(host));
        System.out.println(Thread.currentThread() + " Created ConcurrentServer2");
    }
    public void start() {
      System.out.println(Thread.currentThread() + " Server Ready: " + server);
      while (true) {
        Collections.nCopies(4, server)
          .stream()
          .parallel()
          .forEach(Server::acceptAndHandleClient);
      }
    }
    
    private void handleNewConnection(Socket clientSocket) throws IOException {
  		System.out.println(Thread.currentThread() + " Received Connection from " + clientSocket);
      BufferedReader is = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
  	  PrintStream os = new PrintStream(clientSocket.getOutputStream());
  	  // echo that data back to the client, except for QUIT.
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
        try (ConcurrentServer2 server = new ConcurrentServer2("localhost", 8080, 50)) {
            server.start();
        } catch (IOException e) {
            System.out.println(e);
        }
    }
}
