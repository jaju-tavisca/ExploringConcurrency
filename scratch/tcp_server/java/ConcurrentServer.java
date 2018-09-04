import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.concurrent.CompletableFuture;

public class ConcurrentServer implements AutoCloseable {
	private final ServerSocket server;

	public ConcurrentServer(String host, int port, int backlogConnectionQueueLength)
			throws UnknownHostException, IOException {
		server = new ServerSocket(port, backlogConnectionQueueLength, InetAddress.getByName(host));
		System.out.println(Thread.currentThread() + " Created ConcurrentServer");
	}

	public void start() throws IOException {
		System.out.println(Thread.currentThread() + " Server Ready: " + server);
		while (true) {
			System.out.println("Waiting for Incoming connections...");
			Socket clientSocket = server.accept();
			CompletableFuture.runAsync(() -> {
				try {
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
				} catch (IOException e) {
					e.printStackTrace();
				}
			});
		}
	}

	public void close() throws IOException {
		server.close();
	}

	public static void main(String[] args) {
		try (ConcurrentServer server = new ConcurrentServer("localhost", 8080, 50)) {
			server.start();
		} catch (IOException e) {
			System.out.println(e);
		}
	}
}
