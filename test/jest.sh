#!/bin/bash


JestOptionsBlob=""
ENDPOINT='http://local.sogive.org'


########
### Handling Test Target arguments
########
case $1 in
	test)
	printf "\nGoing to run Jest tests on test.sogive.org\n"
	ENDPOINT='https://test.sogive.org'
	;;
	production)
	printf "\nGoing to run Jest tests on app.sogive.org\n"
	ENDPOINT='https://app.sogive.org'
	;;
	local)
	printf "\nGoing to run Jest tests on local.sogive.org\n"
	ENDPOINT='http://local.sogive.org'
	;;
	*)
	printf "\nGoing to run Jest tests on $1\n"
	JestOptionsBlob="$JestOptionsBlob $1"
esac







# ENDPOINT=http://local.sogive.org 
# for var in $@
# do
# 	if [ $var = "test" ]
# 	then
# 		ENDPOINT=https://test.sogive.org 		
# 	elif [ $var = "local" ]
# 	then
# 		ENDPOINT=http://local.sogive.org 		
# 	elif [ $var = "production" ]
# 	then
# 		ENDPOINT=https://app.sogive.org 		
# 	else
# 		JestOptionsBlob="$JestOptionsBlob $var"
# 	fi
# done


########
### Satisfy NPM contingencies
#######
printf "\nGetting NPM Packages to Run Jest Tests...\n"
npm i


RES=$(cd ~/winterwell/wwappbase.js/test-base/res/ && find -iname "*.js")
#Jest will babel any test files itself,
#but anything it sees as "outside of its runtime" (config files)
#need to be babeled by us
printf "\nBabeling config files..."
for js_file in ${RES[*]}; do
	babel ~/winterwell/wwappbase.js/test-base/res/$js_file --out-file ~/winterwell/wwappbase.js/test-base/babeled-res/$js_file
done

printf "\nLaunching Jest... \n"
cd /home/$USER/winterwell/sogive-app/test/ 
npm run jest -- --config ./jest.config.json --testURL $ENDPOINT $JestOptionsBlob
