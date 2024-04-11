# This deploys to the app directory
# It must be run on the production server in the home directory
# See build-deploy.sh

PROJECT=sogive

cd /home/winterwell

unzip $PROJECT-build.zip

rm -rf $PROJECT
mv $PROJECT-build $PROJECT

# rm $PROJECT-build.zip
