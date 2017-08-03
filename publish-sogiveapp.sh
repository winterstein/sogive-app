#!/bin/bash

#Publish-SoGive-App


USER=`whoami`

if [[ -z $1 ]]; then
	echo "usage: publish-portal.sh test|production";
	exit -1;   
fi

##Is this a production pushout or a test pushout?
PRODUCTIONSERVERS=(heppner.soda.sh)
TESTSERVERS=(hugh.soda.sh)

TYPEOFPUSHOUT=$1
CLEANPUBLISH=$2

case $1 in
	production)
	echo "this is a PRODUCTION pushout"
	TARGET=$PRODUCTIONSERVERS
	;;
	PRODUCTION)
	echo "this is a PRODUCTION pushout"
	TARGET=$PRODUCTIONSERVERS
	;;
	test)
	echo "this is a TEST pushout"
	TARGET=$TESTSERVERS
	;;
	TEST)
	echo "this is a TEST pushout"
	TARGET=$TESTSERVERS
	;;
	*)
	echo "The script couldn't discern if this was a production or a test pushout.  EXITING..."
	exit 1
	;;
esac

case $2 in
	clean)
	echo "this publishing process is going to clear out the target server's directories before syncing"
	CLEANPUBLISH='true'
	;;
	CLEAN)
	echo "this publishing process is going to clear out the target server's directories before syncing"
	CLEANPUBLISH='true'
	;;
	*)
	echo "this publishing process will only overwrite old files with new versions, all other files will not be changed"
	CLEANPUBLISH='false'
	;;
esac



# Convert Less into CSS
echo "converting less files into CSS..."
for file in /home/$USER/winterwell/sogive-app/web/style/*.less; do
	if [ -e "$file" ]; then
		lessc "$file" "${file%.less}.css"
	else
		echo "no less files found"
		exit 0
	fi
done


echo ""
echo "Beginning publishing process..."
for server in ${TARGET[*]}; do
	echo -e "Stopping sogiveapp service on $server"
	ssh winterwell@$server 'service sogiveapp stop'
		if [[ $CLEANPUBLISH = 'true' ]]; then
			echo "clearing out the old Jars..."
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/lib/*.jar'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/bin/*'
			echo "getting rid of old files..."
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/config/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/data/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/server/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/src/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/test/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/web/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/package.json'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/webpack*'
		fi
	echo "syncing the new Jars..."
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/tmp-lib/*.jar winterwell@$server:/home/winterwell/sogive-app/lib/
#	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/bin/* winterwell@$server:/home/winterwell/sogive-app/bin/
	echo "syncing everything..."
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/config/* winterwell@$server:/home/winterwell/sogive-app/config/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/data/* winterwell@$server:/home/winterwell/sogive-app/data/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/server/* winterwell@$server:/home/winterwell/sogive-app/server/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/src/* winterwell@$server:/home/winterwell/sogive-app/src/
#	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/test/* winterwell@$server:/home/winterwell/sogive-app/test/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/web/* winterwell@$server:/home/winterwell/sogive-app/web/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/package.json winterwell@$server:/home/winterwell/sogive-app/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/webpack* winterwell@$server:/home/winterwell/sogive-app/
# @DA could you doc this line - thanks ^DW
	rsync -hPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/.babelrc winterwell@$server:/home/winterwell/sogive-app/web/build/js/
	echo "done syncing"
	echo ""
	echo "satisfying NPM dependencies..."
	ssh winterwell@$server 'cd /home/winterwell/sogive-app && npm i'
	echo ""
	echo "webpacking..."
	ssh winterwell@$server 'cd /home/winterwell/sogive-app && webpack -p'
	echo ""
	echo "Processing bundle.js file for ES5 compatibility"
	ssh winterwell@$server 'mv /home/winterwell/sogive-app/web/build/js/bundle.js /home/winterwell/sogive-app/web/build/js/original.bundle.js'
	ssh winterwell@$server 'cd /home/winterwell/sogive-app/web/build/js/ && babel original.bundle.js --out-file bundle.js'
	echo "done converting bundle.js for ES5 compatibility"
	echo ""
	echo "starting the sogiveapp process on $server"
	ssh winterwell@$server 'service sogiveapp start'
	echo ""
	echo "$server updated"
done

echo "Publishing process completed"
