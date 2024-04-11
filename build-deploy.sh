# Copy the files needed to a build directory and zip it up
# Send it to the production server

PROJECT=sogive
BD=$PROJECT-build

cd /home/winterwell/$PROJECT

echo "Java"
mvn-all.sh
mvn package -DskipTests

echo "JS"
npm i
npm run compile

./gitstamp.sh

./build-deploy2.sh $PROJECT
