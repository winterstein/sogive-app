#!/bin/bash

##############
## Production Build Launcher
##############

PROJECT_NAME='sogive'
TMUX_ID="production-build-$PROJECT_NAME"
SPECIFIED_BRANCH=$1
PRODUCTION_PROJECT_BUILDER_SCRIPT_PATH='/home/winterwell/production.sogive.builder.sh'
ALTERNATIVE_WWAPPBASEJS_BRANCH=$2

function pre_run_interactive_warning {
    printf "\n\e[34;107mAre you absolutely certain that you want to build and release $PROJECT_NAME on this Production Server\033[0m\n\e[34;107mBased on your specified branch of $1 ?\033[0m yes/no\n"
    read answer
    ANSWER=$answer
    case $ANSWER in
        yes|YES)
            printf "\n\n\t\tContinuing Production Build\n\n"
        ;;
        no|NO)
            printf "\n\n\t\tAborting Operation\n\n"
            exit 0
        ;;
        *)
            printf "\n\n\t\tAnswer not understood.  Aborting Operation\n\n"
            exit 0
        ;;
    esac
}


function create_tmux_session {
    printf "\nEnsuring there are no other concurrent tmux sessions for building $PROJECT_NAME right now.\n"
    tmux kill-session -t $TMUX_ID
    printf "\nCreating a fresh tmux session for building $PROJECT_NAME .\n"
    tmux new-session -d -s $TMUX_ID -n panel01
    printf "\n\n\t\tAll Subsequent Build Steps Will take Place in a tmux session\n\n\t\tYou will be automatically connected to it:\n\n\t\t\n\n\t\tIf you become disconnected, use this command to reconnect:\n\n\t\ttmux attach-session -t $TMUX_ID\n\n"
}

function connect_to_tmux_session {
    tmux attach-session -t $TMUX_ID
}

function build_production_project_in_tmux {
    tmux send-keys -t $TMUX_ID "bash $PRODUCTION_PROJECT_BUILDER_SCRIPT_PATH $1 $2" C-m
}

pre_run_interactive_warning
create_tmux_session
connect_to_tmux_session
build_production_project_in_tmux
