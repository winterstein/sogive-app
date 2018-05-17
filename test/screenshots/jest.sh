cd /home/$USER/winterwell/sogive-app/test/screenshots
RES=$(cd res/ && find -iname "*.js")
#Jest will babel any test files itself,
#but anything it sees as "outside of its runtime" (config files)
#need to be babeled by us
printf "\nBabeling config files..."
for js_file in ${RES[*]}; do
	babel res/$js_file --out-file babeled-res/$js_file
done
printf "\nLaunching Jest... \n"
#Runs script as defined in package.json
npm run jest