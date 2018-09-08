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
