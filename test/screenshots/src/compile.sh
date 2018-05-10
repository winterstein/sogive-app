#!/bin/bash

#compile/transpile/translate the source JS' for screenshots (from es2016 to es2015)

SOGIVE_SCRIPTS=$(cd sogive-scripts/ && find -iname "*.js")
RES=$(cd res/ && find -iname "*.js")
RUN_SCRIPTS=$(find -iname "*.js")

for js_file in ${SOGIVE_SCRIPTS[*]}; do
	printf "\n"
	printf "\nBabeling $js_file ..."
	babel sogive-scripts/$js_file --out-file sewer_outlet/sogive-scripts/$js_file
	printf "\n"
done

for js_file in ${RES[*]}; do
	printf "\n"
	printf "\nBabeling $js_file ..."
	babel res/$js_file --out-file sewer_outlet/res/$js_file
	printf "\n"
done

for js_file in ${RUN_SCRIPTS[*]}; do
	printf "\n"
	printf "\nBabeling $js_file ..."
	babel $js_file --out-file sewer_outlet/$js_file
	printf "\n"
done