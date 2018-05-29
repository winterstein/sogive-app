# !/bin/bash

########
### Whom shall receive the emails?:: Add new recipients with a comma separating the addresses
########
EMAIL_RECIPIENTS='sysadmin@sodash.com'

bash jest.sh $1


function send_alert {
        TIME=$(date +%Y-%m-%dT%H:%M:%S-%Z)
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