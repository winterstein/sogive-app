#!/bin/bash
# Take test Screenshots

DATE=$(date '+%Y-%m-%dT%H:%M:%S')

#First argument is optional,  it can be an integer or floating integer of how many seconds to wait before running this script.  Default value is 0.5
if [[ $1 = '' ]]; then
	sleep 0.5
else
	sleep $1
fi

SOURCE_JS=("/home/$USER/winterwell/sogive-app/test/screenshots/*.test.sogive.org.js")

for js_file in ${SOURCE_JS[*]}; do
	printf "\nChecking screenshot directory"
	printf "\n"
	printf "Taking $js_file screenshot ..."
	node $js_file
	printf "\n"
done

