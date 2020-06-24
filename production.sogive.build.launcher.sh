#!/bin/bash

##############
## Production Build Launcher
##############

#Version 0.5
# Meaning - Script has been written, tested, but never used earnestly

PROJECT_NAME='sogive'
TMUX_ID="production-build-$PROJECT_NAME"
SPECIFIED_BRANCH=$1
PRODUCTION_PROJECT_BUILDER_SCRIPT_PATH='/home/winterwell/production.sogive.builder.sh'
ALTERNATIVE_WWAPPBASEJS_BRANCH=$2

USAGE="\t./production.sogive.build.launcher.sh sogive-release-2020-06-30\n\nOR OPTIONALLY\n\n\t./production.sogive.build.launcher.sh sogive-release-2020-06-30 wwappbase-release-2020-06-15"

function ensure_variables_used {
    if [[ $SPECIFIED_BRANCH = '' ]]; then
        printf "\nYou must specify a git branch for your project, in order to run this script\n\n$USAGE\n"
        exit 0
    fi
}

function pre_run_interactive_warning {
    printf "\n\e[34;107mAre you absolutely certain that you want to build and release $PROJECT_NAME on this Production Server\033[0m\n\e[34;107mBased on your specified branch of $SPECIFIED_BRANCH ?\033[0m yes/no\n"
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

function eval_if_wwwappbasejs_branch_specified {
    if [[ $ALTERNATIVE_WWAPPBASEJS_BRANCH = '' ]]; then
            printf "\nNo specific branch name was parsed for wwappbase.js\nDefaulting to the same branch name as $PROJECT_NAME ,' $SPECIFIED_BRANCH '.\n"
            ALTERNATIVE_WWAPPBASEJS_BRANCH=$SPECIFIED_BRANCH
    fi
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
    tmux send-keys -t $TMUX_ID "bash $PRODUCTION_PROJECT_BUILDER_SCRIPT_PATH $SPECIFIED_BRANCH $ALTERNATIVE_WWAPPBASEJS_BRANCH" C-m
}

ensure_variables_used
pre_run_interactive_warning
eval_if_wwwappbasejs_branch_specified
create_tmux_session
build_production_project_in_tmux
connect_to_tmux_session
