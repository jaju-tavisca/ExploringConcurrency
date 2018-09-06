echo "***************************************"
echo "Cleaning"
echo "***************************************"
rm -rfv *.class

echo "***************************************"
echo "Compiling..."
echo "***************************************"
javac -cp .:./lib/json-20180130.jar `find . -type f -name "*.java"`

echo "***************************************"
echo "Running..."
echo "***************************************"
java -cp .:./lib/json-20180130.jar Portfolio

# java -cp .:./lib/json-20180130.jar -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=<Port> Portfolio
