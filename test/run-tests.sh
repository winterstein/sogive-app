# !/bin/bash

########
### Whom shall receive the emails?:: Add new recipients with a comma separating the addresses
########
EMAIL_RECIPIENTS='sysadmin@sodash.com'


########
### Check to see if you have mutt an msmtp installed so that you can send emails
########
if [[ $(which mutt) = '' ]]; then
        printf "\nYou must first install mutt before running this script\nInstall mutt with\n\tsudo apt-get install mutt\n"
        exit 0
fi
if [[ $(which msmtp) = '' ]]; then
        printf "\nYou must first install msmtp before running this script\nInstall msmtp with\n\tsudo apt-get install msmtp\n"
        exit 0
fi


########
### Check to see if .msmtprc and .muttrc are in place
########
if [ ! -f ~/.msmtprc ]; then
        printf "\nPlacing the .msmtprc file in your home directory so that I can send emails\n"
        cp ~/winterwell/logins/.msmtprc ~/
        chmod 600 ~/.msmtprc
fi
if [ ! -d ~/msmtp ]; then
        printf "\nCreating a directory for the msmpt logs to live in\n"
        mkdir -p ~/msmtp
        touch ~/msmtp/msmtp.log
        chmod 777 ~/msmtp/msmtp.log
fi
if [ ! -f ~/.muttrc ]; then
        printf "\nPlacing the .muttrc file in your home directory so that I can send emails\n"
        cp ~/winterwell/logins/.muttrc ~/
        printf "\nYou must now run mutt for the first time in order to create a maildir\nRun mutt with \n\t$ mutt\n"
        exit 0
fi


bash jest.sh $1


function send_alert {
        TIME=$(date +%Y%m%d-%H:%M:%S-%Z)
	message="Jest Detected Failure for -- $1 --sogive tests"
	body="Hi,\nThe sogive-app jest/puppeteer script threw out a FAIL notice at $TIME:\n\n$line\n"
	title="[$HOSTNAME] $message"
	printf "$body" | mutt -s "$title" ${ATTACHMENTS[@]} -- $EMAIL_RECIPIENTS
}

ATTACHMENTS=()

NEW_FAIL_LOGS=$(find test-results/Logs\(failure\)/ -type f -iname "*.txt" -amin +0 -amin -2)

if [[ $NEW_FAIL_LOGS = '' ]]; then
        printf "\nNo Failures Detected\n"
else
        printf "\nFailures Detected:\n"
        for log_file in ${NEW_FAIL_LOGS[@]}; do
                ATTACHMENTS+=("-a $log_file")
                printf "\n$log_file"
        done
        printf "\n\nSending out Email with New Log Files Attached...\n"
        send_alert
        printf "\nDone\n"
fi