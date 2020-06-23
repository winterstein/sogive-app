#!/bin/bash

################
## A Githook to run headless jest/puppeteer tests discretely on your devbox
################
RECEIVERS=("sysadmin@good-loop.com")
PROJECT_ROOT_ON_DISK="/home/$USER/winterwell/sogive-app"
PROJECT_NAME='sogive-app'
TMUX_ID="automated-tests-for-$PROJECT_NAME"
LOGFILE="$PROJECT_ROOT_ON_DISK/$PROJECT_NAME.automated.tests.output.log"
SUMMARY_LOGFILE="$PROJECT_ROOT_ON_DISK/$PROJECT_NAME.failed.tests.summary.log"

################
## Ensuring that mutt and msmtp are installed and usable
###############
if [[ $(which mutt) = '' ]]; then
	printf "\nPlease install Mutt in order to have automated tests be able to email results\n"
	exit 0
fi
if [[ $(which msmtp) = '' ]]; then
	printf "\nPlease install msmtp in order to have automated tests be able to email results\n"
	exit 0
fi
cp ~/winterwell/logins/.msmtprc ~/.msmtprc
cp ~/winterwell/logins/.muttrc ~/.muttrc
if [ ! -d /tmp/msmtp ]; then
	mkdir -p /tmp/msmtp
fi
if [ ! -d ~/Mail ]; then
	mkdir -p ~/Mail
fi

###############
## Email Function
###############
function send_email {
    printf "\n$EMAIL_BODY\n" | mutt -s "$SUBJECT" $recipients
}


################
## Ensuring that old Logfiles for these automated tests are cleared away
################
if [ -f $LOGFILE ]; then
	rm $LOGFILE
	touch $LOGFILE
else
	touch $LOGFILE
fi

if [ -f $SUMMARY_LOGFILE ]; then
	rm $SUMMARY_LOGFILE
	touch $SUMMARY_LOGFILE
else
	touch $SUMMARY_LOGFILE
fi

################
## Checking if an existing suite of tests are running for this project
## If there is one, kill it.
################

if [[ $(tmux ls | grep "$TMUX_ID") = '' ]]; then
	#Great, no tmux session is already running for this suite of tests. We'll make one after
	# this if/fi eval is finished
	printf "\n"
else
	tmux kill-session -t $TMUX_ID
fi

###############
## Creating new tmux session for the tests
###############
tmux new-session -d -s $TMUX_ID -n panel01
# sleep for a second to ensure that the session was created with ample time
# for the shell to propagate.
sleep 1


###############
## Creating a headless.runtest.js file based on current developer's version of runtest.js
###############
cp $PROJECT_ROOT_ON_DISK/runtest.js $PROJECT_ROOT_ON_DISK/headless.runtest.js
# Edit this file so that the test-target is the 'test' server
sed -i "/site: 'local',/c\        site: 'test'," $PROJECT_ROOT_ON_DISK/headless.runtest.js
# Edit this file so that it is guaranteed to run headlessly
sed -i "/head: false,/c\        head: true," $PROJECT_ROOT_ON_DISK/headless.runtest.js

###############
## Run Tests and Capture Output for error detection and possible Alerting
###############
tmux send-keys -t $TMUX_ID "node $PROJECT_ROOT_ON_DISK/runtest.headless.server.js &> $LOGFILE ; tmux wait-for -S done-testing" C-m
tmux wait-for done-testing
### Parse the output and create a summary
# surface scrape of log for failures
# Count them:
NUM_FAILS=$(grep "FAIL" $LOGFILE | wc -l)

# Get the full stack of the failed test(s):
if [[ $NUM_FAILS -gt '0' ]]; then
    grep -v "PASS" $LOGFILE | grep -v "npm" | grep -v "Test" | grep -v "Snapshots" | grep -v "Time" | grep -v "Ran all test suites" >> $SUMMARY_LOGFILE
fi


# If there are any failures detected, send the alert email
if [[ $NUM_FAILS -gt '0' ]]; then
    for recipients in ${RECEIVERS[@]}; do
        EMAIL_BODY=$(cat $SUMMARY_LOGFILE)
        SUBJECT=$(printf "$HOSTNAME reported $NUM_FAILS test(s) failed for $PROJECT_NAME")
        send_email
    done
fi


