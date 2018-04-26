#!/bin/bash

# Take test Screenshots

#First argument is optional,  it is a floating-point or an integer of how many seconds to wait before running this script.  Default value is 0.5
if [[ $1 = '' ]]; then
	sleep 0.5
else
	sleep $1
fi

SOURCE_JS=("/home/$USER/winterwell/sogive-app/test/screenshots/*.app.sogive.org.js")

for js_file in ${SOURCE_JS[*]}; do
	printf "\n"
	printf "Taking $js_file screenshot ..."
	node $js_file
	printf "\n"
done

printf "\nSyncing images to server ..."
rsync -rhP /home/$USER/winterwell/sogive-app/test/screenshots/production/* winterwell@hugh.soda.sh:/home/winterwell/sogive-app-screenshots/production/