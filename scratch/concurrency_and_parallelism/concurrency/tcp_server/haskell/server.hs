-- Okay, let's get started. 
-- So first we need to include the necessary functions and data constructors 
-- from Haskell libraries. This particular TCP server will use the Network library 
-- to listen on a port and accept connections, System library to get 
-- command line arguments, System.IO library to change socket handle's buffering mode, 
-- to read and write it, and Control.Concurrent library to spawn new Haskell threads.
-- So let's import the necessary stuff,

import Network (listenOn, withSocketsDo, accept, PortID(..), Socket)
import System (getArgs)
import System.IO (hSetBuffering, hGetLine, hPutStrLn, BufferMode(..), Handle)
import Control.Concurrent (forkIO)

-- Every Haskell program begins with the main function, so let's write one. Our main function will parse the port command line argument, start the server on the port, and then call sockHandler function that will accept connections and put them in a new thread,

main :: IO ()
main = withSocketsDo $ do
    args <- getArgs
    let port = fromIntegral (read $ head args :: Int)
    sock <- listenOn $ PortNumber port
    putStrLn $ "Listening on " ++ (head args)
    sockHandler sock
-- The withSocketsDo function is only necessary for Windows and it initializes the Windows winsock stuff.

-- The getArgs function returns a list of arguments that were passed on command line. For example, if we run the program as server.exe 5555, then args gets assigned a list ["5555"].

-- The next line converts the first element in the argument list to an Integer.

-- Next we start listening on the port by using listenOn. The code listenOn $ PortNumber port is just short for listenOn (PortNumber port). The dollar sign function $ allows to avoid using parenthesis.

-- Then we simply print a string to console which port we're listening by using putStrLn from Prelude Haskell library, which is almost always implicitly imported.

-- Next we call sockHandler function and pass it the sock that was returned from the listenOn function.

-- Now let's take a look at sockHandler function. This function takes a Socket and returns "nothing", so its type signature is sockHandler :: Socket -> IO (),

sockHandler :: Socket -> IO ()
sockHandler sock = do
    (handle, _, _) <- accept sock
    hSetBuffering handle NoBuffering
    forkIO $ commandProcessor handle
    sockHandler sock
-- If we look at accept function's documentation, we find that it returns a tuple of 3 elements (Handle, HostName, PortNumber). In this tutorial we are not interested in the connecting party's hostname or port, so we use _ to discard last two args. accept is a blocking call, so it will return the handle only when a new connection comes in.

-- Next we use hSetBuffering to change buffering mode for the client's socket handle to NoBuffering, so we didn't have buffering surprises.

-- Then we use forkIO to call commandProcessor function in a new Haskell thread. We do this so that we could handle more than one client connection. We'll write commandProcessor soon.

-- Finally we recurse and call the same sockHandler function again to handle more incoming connections. Haskell optimizes for tail recursion, so we never get stack overflows in long run.

-- Now let's write commandProcessor. It takes a Handle and returns IO () so its type is commandProcessor :: Handle -> IO ()

commandProcessor :: Handle -> IO ()
commandProcessor handle = do
    line <- hGetLine handle
    let cmd = words line
    case (head cmd) of
        ("echo") -> echoCommand handle cmd
        ("add") -> addCommand handle cmd
        _ -> do hPutStrLn handle "Unknown command"
    commandProcessor handle
-- Here we use hGetLine to get a line of text from handle, then we use the words from Prelude to split the line into words, and then we use the case statement on head of the command to find out which command was sent to the server, and call the right command function.

-- For example, if you send echo hello world to the server, line gets set to the string "echo hello world", then words function splits it into a list of words, ["echo", "hello", "world"], and head ["echo", "hello", "world"] is just "echo", so the echoCommand executes. Same for addCommand.

-- If it's an unknown command, we send the string "Unknown command" back to the client by using hPutStrLn function that writes the given string followed by a new line to the given handle.

-- Finally we recurse on commandProcessor so that we could execute several commands over the same connection.

-- Here is the echoCommand. It sends everything it receives back to the client. This function's type is Handle -> [String] -> IO (), because it takes the client socket handle, the list of command words, which are string, and returns nothing, so

echoCommand :: Handle -> [String] -> IO ()
echoCommand handle cmd = do
    hPutStrLn handle (unwords $ tail cmd)

-- Here hPutStrLn sends the given string to the given handle. The string in this case is unwords $ tail cmd, which is basically everything but the first word. So for example, if cmd was ["echo", "hello", "world"], then tail cmd is ["hello", "world"] and unwords ["hello", "world"] is the string "hello world".

-- The other command is addCommand, it takes the two numbers the client sends to it, adds them together and sends back,

addCommand :: Handle -> [String] -> IO ()
addCommand handle cmd = do
    hPutStrLn handle $ show $ (read $ cmd !! 1) + (read $ cmd !! 2)

-- Here we first take the second cmd !! 1 and third cmd !! 2 elements from cmd string list, then read it converts it to integers, which get added together, and then show converts the result back to a string, which gets sent back to client.
