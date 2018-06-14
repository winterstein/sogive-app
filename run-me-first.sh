#!/bin/bash

#WWappbase branch helper.
#This script makes sure that your symlinks and wwappbase.js repository are accurate on your machine.

printf "\nChecking for new content in the wwappbase.js repository ...\n"
git --git-dir=/home/$USER/winterwell/wwappbase.js/.git/ --work-tree=/home/$USER/winterwell/wwappbase.js pull origin master

printf "\n\nIf you saw a 'git' error on that last command, then you probably\nhave unstaged changes in your local wwappbase.js repo\n"

printf "\nCreating a proper symlink ...\n"
rm /home/$USER/winterwell/sogive-app/src/base
ln -s /home/$USER/winterwell/wwappbase.js/base /home/$USER/winterwell/sogive-app/src/base

printf "\nOkay, all done.  You should now be ready to properly develop in this branch\n"