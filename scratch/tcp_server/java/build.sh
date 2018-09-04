echo "***************************************"
echo "Cleaning"
echo "***************************************"
rm -rfv *.class

echo "***************************************"
echo "Compiling..."
echo "***************************************"
javac Server.java
javac ConcurrentServer.java
javac Client.java
