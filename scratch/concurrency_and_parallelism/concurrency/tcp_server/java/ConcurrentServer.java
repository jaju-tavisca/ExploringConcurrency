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
					Server.handleClient(clientSocket);
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
