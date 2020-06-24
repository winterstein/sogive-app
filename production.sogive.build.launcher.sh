#!/bin/bash

##############
## Production Build Launcher
##############

PROJECT_NAME='sogive'
TMUX_ID="production-build-$PROJECT_NAME"
SPECIFIED_BRANCH=$1
PRODUCTION_PROJECT_BUILDER_SCRIPT_PATH='/home/winterwell/production.sogive.builder.sh'

function create_tmux_session {
    printf "\nEnsuring there are no other concurrent tmux sessions for building $PROJECT_NAME right now.\n"
    tmux kill-session -t $TMUX_ID
    printf "\nCreating a fresh tmux session for building $PROJECT_NAME .\n"
    tmux new-session -d -s $TMUX_ID -n panel01
    printf "\n\n\t\tAll Subsequent Build Steps Will take Place in a tmux session\n\n\t\tYou will be automatically connected to it:\n\n\t\t\n\n\t\tIf you become disconnected, use this command to reconnect:\n\n\t\ttmux attach-session -t $TMUX_ID\n\n"
}

function set_variables_in_tmux {
    tmux send-keys -t $TMUX_ID "export PROJECT_NAME=$PROJECT_NAME" C-m
    tmux send-keys -t $TMUX_ID "export SPECIFIED_BRANCH=$1" C-m
}

function connect_to_tmux_session {
    tmux attach-session -t $TMUX_ID
}

function build_production_project_in_tmux {
    tmux send-keys -t $TMUX_ID "bash $PRODUCTION_PROJECT_BUILDER_SCRIPT_PATH" C-m
}

create_tmux_session
set_variables_in_tmux
connect_to_tmux_session
build_production_project_in_tmux
