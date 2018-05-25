JestOptionsBlob=""
ENDPOINT=http://local.sogive.org 
for var in $@
do
	if [ $var = "test" ]
	then
		ENDPOINT=https://test.sogive.org 		
	elif [ $var = "local" ]
	then
		ENDPOINT=http://local.sogive.org 		
	elif [ $var = "production" ]
	then
		ENDPOINT=https://app.sogive.org 		
	else
		JestOptionsBlob="$JestOptionsBlob $var"
	fi
done

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
