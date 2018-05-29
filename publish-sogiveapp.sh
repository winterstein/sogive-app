#!/bin/bash

#Publish-SoGive-App
USAGE="\nusage: publish-sogiveapp.sh test|production\n"

if [[ -z $1 ]]; then
	printf "$USAGE"
	exit 0
fi

##Is this a production pushout or a test pushout?
PRODUCTIONSERVERS=(heppner.soda.sh)
TESTSERVERS=(hugh.soda.sh)

TYPEOFPUSHOUT=$1
CLEANPUBLISH=$2

case $1 in
	production|PRODUCTION)
	printf "\nthis is a PRODUCTION pushout\n"
	TARGET=$PRODUCTIONSERVERS
	PUBLISH_TYPE='production'
	;;
	test|TEST)
	printf "\nthis is a TEST pushout\n"
	TARGET=$TESTSERVERS
	PUBLISH_TYPE='test'
	;;
	*)
	printf "\nThe script couldn't discern if this was a production or a test pushout.\n\n$USAGE\n\nEXITING...\n"
	exit 1
	;;
esac

case $2 in
	clean|CLEAN)
	printf "\nthis publishing process is going to clear out the target server's directories before syncing\n"
	CLEANPUBLISH='true'
	;;
	*)
	printf "\nthis publishing process will only overwrite old files with new versions, all other files will not be changed\n"
	CLEANPUBLISH='false'
	;;
esac



# Convert Less into CSS
printf "\nconverting less files into CSS...\n"
for file in /home/$USER/winterwell/sogive-app/web/style/*.less; do
	if [ -e "$file" ]; then
		lessc "$file" "${file%.less}.css"
	else
		printf "\nno less files found\n"
		exit 0
	fi
done


printf "\n"
printf "\nBeginning publishing process...\n"
for server in ${TARGET[*]}; do
	printf "\nStopping sogiveapp service on $server\n"
	ssh winterwell@$server 'service sogiveapp stop'
		if [[ $CLEANPUBLISH = 'true' ]]; then
			printf "\n\t>clearing out the old Jars...\n"
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/lib/*.jar'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/bin/*'
			printf "\n\t>getting rid of old files...\n"
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/config/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/data/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/server/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/src/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/test/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/web/*'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/package.json'
			ssh winterwell@$server 'rm -rf /home/winterwell/sogive-app/webpack*'
		fi
	printf "\nsyncing the new Jars...\n"
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/tmp-lib/* winterwell@$server:/home/winterwell/sogive-app/lib/
#	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/bin/* winterwell@$server:/home/winterwell/sogive-app/bin/
	printf "\nsyncing everything else...\n"
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/config/* winterwell@$server:/home/winterwell/sogive-app/config/
	if [[ $server = 'hugh.soda.sh' ]]; then
		ssh winterwell@$server 'rm /home/winterwell/sogive-app/config/stripe.properties'
		scp ~/winterwell/logins/sogive-app/test.sogive.properties winterwell@$server:/home/winterwell/sogive-app/config/stripe.properties
	else
		ssh winterwell@$server 'rm /home/winterwell/sogive-app/config/stripe.properties'
		scp ~/winterwell/logins/sogive-app/production.sogive.properties winterwell@$server:/home/winterwell/sogive-app/config/stripe.properties
	fi
	rsync -hPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/logins/sogive-app/email.properties winterwell@$server:/home/winterwell/sogive-app/config/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/data/* winterwell@$server:/home/winterwell/sogive-app/data/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/server/* winterwell@$server:/home/winterwell/sogive-app/server/
	rsync -rhLPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/src/* winterwell@$server:/home/winterwell/sogive-app/src/
#	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/test/* winterwell@$server:/home/winterwell/sogive-app/test/
#	somewhat painful rsync of web, which does not delete files from the uploads directory
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/web/build/* winterwell@$server:/home/winterwell/sogive-app/web/build/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/web/fonts/* winterwell@$server:/home/winterwell/sogive-app/web/fonts/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/web/img/* winterwell@$server:/home/winterwell/sogive-app/web/img/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/web/lib/* winterwell@$server:/home/winterwell/sogive-app/web/lib/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/web/style/* winterwell@$server:/home/winterwell/sogive-app/web/style/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/web/test/* winterwell@$server:/home/winterwell/sogive-app/web/test/
	rsync -hPe 'ssh -i ~/.ssh/winterwell@soda.sh' ~/winterwell/sogive-app/web/* winterwell@$server:/home/winterwell/sogive-app/web/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/package.json winterwell@$server:/home/winterwell/sogive-app/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/webpack* winterwell@$server:/home/winterwell/sogive-app/
	rsync -rhPe 'ssh -i ~/.ssh/winterwell@soda.sh' --delete-before ~/winterwell/sogive-app/.babelrc winterwell@$server:/home/winterwell/sogive-app/
	printf "\ndone syncing\n"
	printf "\n\n"
	printf "\nsatisfying NPM dependencies...\n"
	ssh winterwell@$server 'cd /home/winterwell/sogive-app && npm i'
	printf "\n\n"
	printf "\nwebpacking...\n"
	ssh winterwell@$server 'cd /home/winterwell/sogive-app && webpack -p'
	printf "\n\n"
	printf "\nstarting the sogiveapp process on $server\n"
	ssh winterwell@$server 'service sogiveapp start'
	printf "\n\n"
	printf "\n$server updated\n"
done

printf "\nPublishing process completed\n"

printf "\nGetting Ready to take Screenshots...\n"
TIMEOUT_SECONDS='10'
while [ $TIMEOUT_SECONDS -gt 0 ]; do
	printf "$TIMEOUT_SECONDS\033[0K\r"
	sleep 1
	: $((TIMEOUT_SECONDS--))
done

if [[ $PUBLISH_TYPE = 'test' ]]; then
	cd test && bash run-tests.sh test
	cd ../
else
	cd test && bash run-tests.sh production
	cd ../
fi
