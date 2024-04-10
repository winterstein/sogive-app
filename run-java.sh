
#!/bin/bash

PROJECT=sogive

echo "run-java.sh $PROJECT called..."

java -ea --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.security=ALL-UNNAMED --add-opens java.base/sun.security.pkcs=ALL-UNNAMED --add-opens java.base/java.lang.ref=ALL-UNNAMED -jar /home/winterwell/$PROJECT/target/$PROJECT-0.0.1-SNAPSHOT-jar-with-dependencies.jar > sogive.run-java.log

