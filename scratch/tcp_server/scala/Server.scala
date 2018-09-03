import scala.util._

class Server(port: Int) {
  private var isRunning = false
  private var serverSocket: ServerSocket = null

  def isActive = isRunning

  private def waitForNewConnectionOn(serverSocket: ServerSocket): Try[Socket] = Try {
    val listeningMsg = s"Server Ready! Listening on IP: ${serverSocket.getInetAddress}, Port ${serverSocket.getLocalPort()} for new connections..."
    logInfo(listeningMsg)
    println(listeningMsg)
    serverSocket.accept()
  }

  protected def createServerSocket: Try[ServerSocket] =
    Try {
      val maxClientConnections = 50
      new ServerSocket(port, maxClientConnections)
    }

  def stop = {
    logInfo("Server shutdown requested. Initiating closure.")
    isRunning = false
    serverSocket.close()
  }

  private def processNewConnection(clientSocket: Socket) = {
    val clientIp = clientSocket.getInetAddress
  }

  def start = {
    val startingMsg = s"Starting Server on port ${port}..."
    logInfo(startingMsg)
    println(startingMsg)
    createServerSocket match {
      case scala.util.Failure(t) =>
        val errMsg = s"Cannot Start Server on IP =>  Port => ${port}.  Please Check Your Server IP or Port."
        logError(errMsg)
        println(errMsg)
  
      case scala.util.Success(server) =>
        serverSocket = server
        isRunning = true
        while (isRunning) {
          waitForNewConnectionOn(server) match {
            case scala.util.Success(client) if(isRunning) =>
                processNewConnection(client)

            case scala.util.Failure(t) =>
              val errMsg = s"Cannot accept connection on IP => ${cmdConfig.midasHost}, Port => ${cmdConfig.midasPort}. Server currently closed."
              logError(errMsg)
              println(errMsg)
              stop
          }
        }
    }
  }

}