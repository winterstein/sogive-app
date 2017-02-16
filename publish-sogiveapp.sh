#!/bin/bash

#Publish-SoGive-App

TARGETSERVERS=(heppner)


# Are you sure that you want to do this?
echo -e "\e[31;107m ARE YOU SURE THAT YOU WANT TO PUBLISH/UPDATE THE SOGIVE-APP TO THE FOLLOWING SERVER(S)? ($TARGETSERVERS) TO CANCEL PRESS \033[0m \e[30;107m ctl + c \033[0m \e[31;107m TO CONTINUE PRESS \033[0m \e[30;107m return \033[0m"
read VAR
if [[ -z $VAR ]]; then
	echo -e "Proceeding..."
fi

for server in ${TARGETSERVERS[*]}; do
	ssh winterwell@$server.soda.sh 'git --git-dir=/home/winterwell/sogive-app/.git/ --work-tree=/home/winterwell/sogive-app gc --prune=now'
	ssh winterwell@$server.soda.sh 'git --git-dir=/home/winterwell/sogive-app/.git/ --work-tree=/home/winterwell/sogive-app pull origin master'
	ssh winterwell@$server.soda.sh 'git --git-dir=/home/winterwell/sogive-app/.git/ --work-tree=/home/winterwell/sogive-app reset --hard FETCH_HEAD'
	ssh winterwell@$server.soda.sh 'cd /home/winterwell/sogive-app && npm i'
	ssh winterwell@$server.soda.sh 'cd /home/winterwell/sogive-app && npm run compile'
	echo -e "$server updated"
done
echo -e "server(s) $TARGETSERVERS updated"