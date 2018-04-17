#!/bin/bash

#sogive-app uploads directory backup script

#remove older backups:
NUMBACKUPS=$(find /mnt/common-backup/sogive-app-uploads/ -iname "*.7z" | wc | awk '{print $1}')
if [[ $NUMBACKUPS -lt 8 ]]; then
	SKIPREMOVAL='true'
else
	SKIPREMOVAL='false'
fi

if [[ $SKIPREMOVAL='false' ]]; then
	find /mnt/common-backup/sogive-app-uploads/*.7z -mtime +8 -exec rm {} \; >/dev/null 2>&1
fi

#Function to send alert email if something goes wrong
function send_alert {
	message=$1
	time=`date`
	body="Hi,\nThe backup-sogive-uploads script encountered a problem at $time:\n\n$message\n\nLots of love,\n$USER@$HOSTNAME."
	title="[$HOSTNAME] $message"
	echo -e $body | mutt -s "$title" sysadmin@sodash.com
}


# zip the uploads
printf "\nCreating Archive...\n"
7z a -t7z -mmt /mnt/common-backup/sogive-app-uploads/sogive-app-uploads.$(date +%Y-%m-%d).7z /home/winterwell/sogive-app/web/uploads/*
# Test the new zip file and send an alert if something is wrong with it
printf "\nTesting Archive...\n"
7z t /mnt/common-backup/sogive-app-uploads/sogive-app-uploads.$(date +%Y-%m-%d).7z
RETVAL=$?
case $RETVAL in
0)
echo "archive integrity check status: OK"
;;
1)
echo "Warning (Non fatal error(s)). For example, one or more files were locked by some other application, so they were not checked."
send_alert "Warning (Non fatal error(s)). For example, one or more files were locked by some other application, so they were not verified by 7-zip"
exit 1
;;
2)
echo "Fatal Error encountered when testing the zip integrity of the sogive-app-uploads archive"
send_alert "Fatal Error encountered when testing the zipped integrity of the sogive-app-uploads archive"
exit 1
;;
7)
echo "Command Line Error encountered when testing the zip integrity of the sogive-app-uploads archive"
send_alert "Command Line Error encountered when testing the zip integrity of the sogive-app-uploads archive"
exit 1
;;
8)
echo "Server ran out of memory during the integrity check"
send_alert "Server ran out of memory during the integrity check"
exit 1
;;
255)
echo "User has interupted the integrity check"
send_alert "User has interupted the integrity check"
exit 1
esac