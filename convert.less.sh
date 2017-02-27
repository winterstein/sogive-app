# !/bin/bash

for file in /home/winterwell/sogive-app/web/style/*.less; do
	if [ -e "$file" ]; then
		lessc "$file" "${file%.less}.css"
	else
		echo "no less files found"
		exit 0
	fi
done