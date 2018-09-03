import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.*;

public class ConcurrentServer {
	public static void main(String[] args) throws IOException {
		ServerSocket server = null;
		int port = 8080;
		try {
			server = new ServerSocket(port, 50, InetAddress.getByName("localhost"));
			System.out.println("Thread = " + Thread.currentThread());
		} catch (IOException e) {
			System.out.println(e);
		}
		System.out.println("Server Ready: " + server);
		// Create a socket object from the ServerSocket to listen and accept
		// connections.
		// Open input and output streams
		while (true) {
			System.out.println("Waiting for Incoming connections...");
			Socket clientSocket = server.accept();
			CompletableFuture.runAsync(() -> {
				System.out.println(Thread.currentThread() + " Received Connection from " + clientSocket);
				try {
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
					System.out.println("Server Closing Connection by Sending => Ok");
					os.println("Ok");
					os.flush();
					is.close();
					os.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			});
		}
	}
}
