echo "***************************************"
echo "Cleaning"
echo "***************************************"
rm *.class

echo "***************************************"
echo "Compiling..."
echo "***************************************"
javac Server.java
javac ConcurrentServer.java
javac Client.java
