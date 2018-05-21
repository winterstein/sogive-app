case $1 in
	test) 
		ENDPOINT=https://test.sogive.org 
		;;
	local) 
		ENDPOINT=http://local.sogive.org 
		;;
	production) 
		ENDPOINT=https://app.sogive.org 
		;;
	*) 
		ENDPOINT=https://test.sogive.org 
		;;
esac


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
npm run jest -- --config ./jest.config.json --testURL $ENDPOINT
