#!/bin/bash

#compile/transpile/translate the source JS' for screenshots (from es2016 to es2015)

ALL_SOURCES=$(cd src/ && find -iname "*.js")

for js_file in ${ALL_SOURCES[*]}; do
	printf "\n"
	printf "\nBabeling $js_file ..."
	babel src/$js_file --out-file $js_file
	printf "\n"
done