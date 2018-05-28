# !/bin/bash

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


#### The failure is happening one process deeper than the IFS is reading.


TIME=$(date +%Y%m%d-%H:%M:%S-%Z)

TEST_TYPE=$1
checkforfail() {
        while IFS= read -r line; do
                printf "\n$TIME $line"
                if [[ $line == *"FAIL"* ]]; then
                        numbroken+=1
                        broken+=" $line"
                fi
                if [ ! -z "$broken" ]; then
                        printf "\nFound a failure:\n\t$line"
                        send_alert
                fi
        done
}
bash jest.sh $1 | checkforfail >> run-tests.log


function send_alert {
	message="Jest Detected Failure for $1 --sogive tests"
	body="Hi,\nThe sogive-app jest/puppeteer script threw out a FAIL notice at $TIME:\n\n$line\n"
	title="[$HOSTNAME] $message"
	printf "$body" | mutt -s "$title" sysadmin@sodash.com
}