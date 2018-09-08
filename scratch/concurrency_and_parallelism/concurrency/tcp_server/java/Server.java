import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;

public class Server implements AutoCloseable {
	private final ServerSocket server; 
	
	public Server(String host, int port, int backlogConnectionQueueLength) throws UnknownHostException, IOException {
		server = new ServerSocket(port, backlogConnectionQueueLength, InetAddress.getByName(host));
		System.out.println(Thread.currentThread() + " Created Server");
	}
	
	public void start() {
		System.out.println(Thread.currentThread() + " Server Ready: " + server);
		// Create a socket object from the ServerSocket to listen and accept
		// connections.
		// Open input and output streams
		while (true) {
			acceptAndHandleClient(server);
		}
	}

	static void acceptAndHandleClient(ServerSocket server) {
		System.out.println(Thread.currentThread() + " Waiting for Incoming connections...");
		try (Socket clientSocket = server.accept()) {
			handleClient(clientSocket);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	static void handleClient(Socket clientSocket) throws IOException {
		System.out.println(Thread.currentThread() + " Received Connection from " + clientSocket);
		BufferedReader is = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
		PrintStream os = new PrintStream(clientSocket.getOutputStream());
		// As long as we receive data, echo that data back to the client.
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
