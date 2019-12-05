#!/bin/bash

TARGET_SERVER='hugh.soda.sh'
TARGET_DIR='/home/winterwell/sogive-app/'
SYNC_LIST=("server" "src" "web" "package.json" "webpack.config.js")

for sync_item in ${SYNC_LIST(@)}; do
	rsync -rLhP $sync_item winterwell@$TARGET_SERVER:$TARGET_DIR
done

ssh winterwell@$TARGET_SERVER "cd $TARGET_DIR && npm i"
ssh winterwell@$TARGET_SERVER "cd $TARGET_DIR && npm run compile"
ssh winterwell@$TARGET_SERVER "cd $TARGET_DIR && bash ./convert.less.sh"
