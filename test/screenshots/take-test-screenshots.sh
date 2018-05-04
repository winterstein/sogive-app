#!/bin/bash
# Take test Screenshots

#First argument is optional,  it can be an integer or floating integer of how many seconds to wait before running this script.  Default value is 0.5
if [[ $1 = '' ]]; then
	sleep 0.5
else
	sleep $1
fi

SOURCE_JS=("/home/$USER/winterwell/sogive-app/test/screenshots/*.test.sogive.org.js")

for js_file in ${SOURCE_JS[*]}; do
	printf "\n"
	printf "Taking $js_file screenshot ..."
	node $js_file
	printf "\n"
done

printf "\nSyncing screenshots to server ...\n"
rsync -rhP /home/$USER/winterwell/sogive-app/test/screenshots/test/* winterwell@hugh.soda.sh:/home/winterwell/sogive-app-screenshots/test/

printf "\nRemoving Screenshot(s) from your local machine\n"
rm /home/$USER/winterwell/sogive-app/test/screenshots/test/*