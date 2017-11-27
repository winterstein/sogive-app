# !/bin/env bash

WATCH=$1
USER=`whoami`
GOTINOTIFYTOOLS=`which inotifywait`
WEB=/home/$USER/winterwell/sogive-app/web

# the TOPLESS files are the top level files referenced in index.html
TOPLESS[0]=$WEB/style/main.less;
TOPLESS[1]=$WEB/style/print.less;

# run through files
for file in "${TOPLESS[@]}"; do
		if [ -e "$file" ]; then
			echo -e "converting $file"
			lessc "$file" "${file%.less}.css"
		else
			echo "less file not found: $file"				
		fi
done

# watch?
if [[ $WATCH == 'watch' ]]; then
	if [ "$GOTINOTIFYTOOLS" = "" ]; then
    	echo "In order to watch and continuously convert less files, you will first need to install inotify-tools on this system"
    	echo ""
    	echo "run sudo apt-get install inotify-tools in order to install"
    	exit 0
	else
	while true
	do
		inotifywait -r -e modify,attrib,close_write,move,create,delete $WEB/style && \
		for file in "${TOPLESS[@]}"; do
			if [ -e "$file" ]; then
				echo -e "converting $file"
				lessc "$file" "${file%.less}.css"
			else
				echo "less file not found: $file"
			fi
		done
	done
	fi
fi
