#!/bin/bash

# Production Server Project Builder Template

#Version 0.1
# Meaning - Script has been written, but not tested

#####  GENERAL SETTINGS
## This section should be the most widely edited part of this script
## Set the Variables according to your project's name, directory path, git-checkout branches, etc.
## Set the preferences according to your project's needs
#####
PROJECT_NAME='sogive' #This name will be used to create/or/refer-to the directory of the project in /home/winterwell/
GIT_REPO_URL='github.com:/winterstein/sogive-app' #
PROJECT_USES_BOB='yes'  #yes or no :: If 'yes', then you must also supply the name of the service which is used to start,stop,or restart the jvm
NAME_OF_SERVICE='sogive' # This can be blank, but if your service uses a JVM, then you must put in the service name which is used to start,stop,or restart the JVM on the server.
PROJECT_USES_NPM='yes' # yes or no
PROJECT_USES_WEBPACK='yes' #yes or no
PROJECT_USES_JERBIL='no' #yes or no
PROJECT_USES_WWAPPBASE_SYMLINK='yes'
PROJECT_USES_SECRET_CONFIG_FILES='yes' # Config files kept in the logins repo


## TODO : use $1 as the branch specification
## TODO : check that branch exists for both the project and the wwappbase.js repo , or , write alternative branch name for wwappbase.js repo
## TODO : use a human interactive "yes" or "FORCE" in order to proceed
## TODO : rename secret config files
## TODO : Use a tmux session to build
## TODO : Backup files function
## TODO : Usage printout


#####  SPECIFIC SETTINGS
## This section should only be selectively edited - based on non-standardized needs
#####
PROJECT_ROOT_ON_SERVER="/home/winterwell/sogive-app"
WWAPPBASE_REPO_PATH_ON_SERVER_DISK="/home/winterwell/wwappbase.js"
LOGINS_REPO_PATH_ON_SERVER_DISK='/home/winterwell/logins'
BACKUP_THESE_PLEASE=("$PROJECT_ROOT_ON_SERVER/web/uploads/")
SECRET_CONFIG_FILES_LOCATION='/home/winterwell/logins/sogive-app'




##### UNDENIABLY ESOTERIC SETTINGS
## This is the space where your project's settings make it completely non-standard
#####
EMAIL_RECIPIENTS=(sysadmin@good-loop.com daniel@good-loop.com roscoe@good-loop.com)
BOB_ARGS='' #you can set bob arguments here, but they will run each and every time that the project is auto-built
BOB_BUILD_PROJECT_NAME='' #If the project name isn't automatically sensed by bob, you can set it explicitly here
NPM_CLEANOUT='no' #yes/no , will nuke the node_modules directory if 'yes', and then get brand-new packages.
RENAME_CONFIG_FILES='yes' # yes/no , will use a function to rename config files that YOU MUST SPECIFY IN THE FUNCTIONS BELOW
NPM_I_LOGFILE="/home/winterwell/.npm/_logs/npm.i.for.$PROJECT_NAME.log"
NPM_RUN_COMPILE_LOGFILE="/home/winterwell/.npm/_logs/npm.run.compile.for.$PROJECT_NAME.log"



##### FUNCTIONS
## Do not edit these unless you know what you are doing
#####
ATTACHMENTS=()
function send_alert_email {
    for email in ${EMAIL_RECIPIENTS[@]}; do
        TIME=$(date +%Y-%m-%dT%H:%M:%S-%Z)
	    message="Production Builder Detected a Failure Building $PROJECT_NAME during $BUILD_PROCESS_NAME"
	    body="Hi,\nThe Production Builder detected a failure when $BUILD_STEP"
	    title="Production Builder on $HOSTNAME $message"
	    printf "$body" | mutt -s "$title" ${ATTACHMENTS[@]} -- $email
    done
}



# First-Run-check for repository : Check if repo exists on the server('s) disk(s)
function check_repo_exists {
    printf "\nChecking if the repo for $PROJECT_NAME exists at $PROJECT_ROOT_ON_SERVER\n"
    if [[ ! -d $PROJECT_ROOT_ON_SERVER ]]; then
        printf "\nCould not find repo for $PROJECT_NAME at $PROJECT_ROOT_ON_SERVER. cloning the repo...\n"
        cd /home/winterwell && git clone git@$GIT_REPO_URL
    fi
}

# First-Run-check for bob : Check if any of the target servers already have npm's bob
function check_bob_exists {
    BUILD_PROCESS_NAME='checking for bob'
    BUILD_STEP='checking for a global installation of "bob"'
    if [[ $PROJECT_USES_BOB = 'yes' ]]; then
        if [[ $(which bob) = '' ]]; then
            printf "\nNo global installation of 'bob' was found. Sending Alert Emails and Breaking Operation\n"
            send_alert_email
            exit 0
        fi
    fi
}

# First-Run-check for Jerbil : Check if any of the target servers already have npm's jerbil
function check_jerbil_exists {
    BUILD_PROCESS_NAME='checking for jerbil'
    BUILD_STEP='checking for a global installation of "jerbil"'
    if [[ $PROJECT_USES_JERBIL = 'yes' ]]; then
        if [[ $(which jerbil) = '' ]]; then
            printf "\nNo global installation of 'jerbil' was found. Sending Alert Emails and Breaking Operation\n"
            send_alert_email
            exit 0
        fi
    fi
}

function check_wwappbasejs_exists {
    BUILD_PROCESS_NAME='checking for wwappbase.js'
    BUILD_STEP='checking the path for the wwappbase.js repository on the servers disk'
    if [[ $PROJECT_USES_WWAPPBASE_SYMLINK = 'yes' ]]; then
        if [[ $(ls $WWAPPBASE_REPO_PATH_ON_SERVER_DISK) = "ls: cannot access '$WWAPPBASE_REPO_PATH_ON_SERVER_DISK': No such file or directory" ]]; then
            printf "\nThe Defined Path to wwappbase.js couldn't be validated. Sending Alert Emails and Breaking Operation\n"
            send_alert_email
            exit 0
        fi
    fi
}

function check_logins_exists {
    BUILD_PROCESS_NAME='checking for logins repo'
    BUILD_STEP="checking that the logins repo exists on $HOSTNAME"
    if [[ $PROJECT_USES_SECRET_CONFIG_FILES = 'yes' ]]; then
        if [ ! -d $LOGINS_REPO_PATH_ON_SERVER_DISK ]; then
            printf "\nThe specified path for the logins repo, $LOGINS_REPO_PATH_ON_SERVER_DISK could not be found.  Sending Alert Emails and Breaking Operation\n"
            send_alert_email
            exit 0
        fi
        printf "\nEnsuring that the logins repo is up to date...\n"
        cd $LOGINS_REPO_PATH_ON_SERVER_DISK && git gc --prune=now
        cd $LOGINS_REPO_PATH_ON_SERVER_DISK && git pull origin master
        cd $LOGINS_REPO_PATH_ON_SERVER_DISK && git reset --hard FETCH_HEAD
    fi
}


# Cleanup Git -- Ensure a clean and predictable git repo for building
function cleanup_repo {
    printf "\nCleaning $HOSTNAME 's local repository...\n"
    cd $PROJECT_ROOT_ON_SERVER && git gc --prune=now
    cd $PROJECT_ROOT_ON_SERVER && git pull origin $SPECIFIED_BRANCH
    cd $PROJECT_ROOT_ON_SERVER && git reset --hard FETCH_HEAD
}

# Cleanup wwappbase.js 's repo -- Ensure that this repository is up to date and clean
function cleanup_wwappbasejs_repo {
    if [[ $PROJECT_USES_WWAPPBASE_SYMLINK = 'yes' ]]; then
        printf "\nCleaning $HOSTNAME 's local wwappbase.js repository\n"
        cd $WWAPPBASE_REPO_PATH_ON_SERVER_DISK && git gc --prune=now
        cd $WWAPPBASE_REPO_PATH_ON_SERVER_DISK && git pull origin $SPECIFIED_BRANCH
        cd $WWAPPBASE_REPO_PATH_ON_SERVER_DISK && git reset --hard FETCH_HEAD
    fi
}

# Stopping the JVM Backend (if applicable)
function stop_service {
    if [[ $PROJECT_USES_BOB = 'yes' ]]; then
        printf "\nStopping $NAME_OF_SERVICE on $HOSTNAME...\n"
        sudo service $NAME_OF_SERVICE stop
    fi
}

# Bob -- Evaluate and Use
function use_bob {
    if [[ $PROJECT_USES_BOB = 'yes' ]]; then
        BUILD_PROCESS_NAME='bob'
        BUILD_STEP='bob was attempting to render jars'
        printf "\ncleaning out old bob.log on $HOSTNAME ...\n"
        rm -rf $PROJECT_ROOT_ON_SERVER/bob.log
        printf "\n$HOSTNAME is updating bob...\n"
        bob -update
        printf "\n$HOSTNAME is building JARs...\n"
        cd $PROJECT_ROOT_ON_SERVER && bob $BOB_ARGS $BOB_BUILD_PROJECT_NAME
        printf "\nchecking bob.log for failures on $HOSTNAME\n"
        if [[ $(grep -i 'Compile task failed' $PROJECT_ROOT_ON_SERVER/bob.log) = '' ]]; then
            printf "\nNo failures recorded in bob.log on $HOSTNAME.  JARs should be fine.\n"
        else
            printf "\nFailure or failures detected in latest bob.log. Sending Alert Emails and Breaking Operation\n"
            send_alert_email
            exit 0
        fi
    fi
}

# NPM -- Evaluate and Use
function use_npm {
    if [[ $PROJECT_USES_NPM = 'yes' ]]; then
        BUILD_PROCESS_NAME='npm'
        BUILD_STEP='npm was downloading packages'
        NPM_LOG_DATE=$(date +%Y-%m-%d)
        if [[ $NPM_CLEANOUT = 'yes' ]]; then
            printf "\nDeleting the existing node_modules...\n"
            rm -rf $PROJECT_ROOT_ON_SERVER/node_modules
        fi
        # Ensuring that there are no residual npm error/debug logs in place
        rm -rf /home/winterwell/.npm/_logs/*.log
        printf "\nEnsuring all NPM Packages are in place on $HOSTNAME for $PROJECT_NAME ...\n"
        cd $PROJECT_ROOT_ON_SERVER && npm i &> $NPM_I_LOGFILE
        printf "\nChecking for errors while npm was attempting to get packages for $PROJECT_NAME ...\n"
        if [[ $(grep -i 'error' $NPM_I_LOGFILE) = '' ]]; then
            printf "\nNo NPM errors detected\n"
        else
            printf "\nNPM encountered one or more errors while attempting to get node packages. Sending Alert Emails, and Breaking Operation\n"
            # Add NPM_I_LOGFILE to the Attachments
            ATTACHMENTS+=("-a $NPM_I_LOGFILE")
            # Send the email
            send_alert_email
            exit 0
        fi
    fi
}

# Webpack -- Evaluate and Use
function use_webpack {
    if [[ $PROJECT_USES_WEBPACK = 'yes' ]]; then
        BUILD_PROCESS_NAME='webpack'
        BUILD_STEP='npm was running a weback process'
        NPM_LOG_DATE=$(date +%Y-%m-%d)
        printf "\nNPM is now running a Webpack process on $HOSTNAME\n"
        cd $PROJECT_ROOT_ON_SERVER && npm run compile &> $NPM_RUN_COMPILE_LOGFILE
        printf "\nChecking for errors that occurred during Webpacking process on $HOSTNAME ...\n"
        if [[ $(cat $NPM_RUN_COMPILE_LOGFILE | grep -i 'error' | grep -iv 'ErrorAlert.jsx') = '' ]]; then
            printf "\nNo Webpacking errors detected on $HOSTNAME for $PROJECT_NAME\n"
        else
            printf "\nOne or more errors were recorded during the webpacking process. Sending Alert Emails, and Breaking Operation\n"
            # Add NPM_RUN_COMPILE_LOGFILE to the Attachments
            ATTACHMENTS+=("-a $NPM_RUN_COMPILE_LOGFILE")
            # Send the email
            send_alert_email
            exit 0
        fi
    fi
}

# Jerbil -- Evaluate and Use
function use_jerbil {
    if [[ $PROJECT_USES_JERBIL = 'yes' ]]; then
        BUILD_PROCESS_NAME='jerbil'
        BUILD_STEP='jerbil was attempting to render markdown to html'
        printf "\n$HOSTNAME is ensuring that jerbil is up to date\n"
        jerbil -update
        printf "\n$HOSTNAME is converting markdown to html..\n"
        cd $PROJECT_ROOT_ON_SERVER && jerbil
        ### Is there a way to check for errors?  I'd like to check to check for errors
    fi
}

# Starting the JVM Backend (if applicable)
function start_service {
    if [[ $PROJECT_USES_BOB = 'yes' ]]; then
        printf "\nStarting $NAME_OF_SERVICE on $HOSTNAME...\n"
        sudo service $NAME_OF_SERVICE start
    fi
}


################
### Run the Functions in Order
################
check_repo_exists
check_bob_exists
check_jerbil_exists
check_wwappbasejs_exists
check_logins_exists
cleanup_repo
cleanup_wwappbasejs_repo
stop_service
use_bob
use_npm
use_webpack
use_jerbil
start_service
use_automated_tests
