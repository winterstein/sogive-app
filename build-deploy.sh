# Copy the files needed to run the AIQA server to a build directory and zip it up
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

echo "Making build directory"
mkdir $BD
mkdir $BD/web
mkdir $BD/target
mkdir $BD/config
cp -r web/* $BD/web
cp target/$PROJECT-0.0.1-SNAPSHOT-jar-with-dependencies.jar $BD/target
cp -r config/* $BD/config
cp run-java.sh $BD
cp $PROJECT.service $BD

echo "Making zip"
zip -r $BD.zip $BD

echo "SCP! to aberdeen"
scp $BD.zip aberdeen:~
scp _deploy-$PROJECT.sh aberdeen:~

echo "Deploy!"
ssh aberdeen "chmod 775 _deploy-$PROJECT.sh"
ssh aberdeen "./_deploy-$PROJECT.sh"

