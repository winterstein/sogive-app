#!/bin/bash

# Thinking that we can insert beforeAll() afterAll() code
# into each of the test files from here. Saves difficulty of
# working with setup()/teardown() without putting onus on tester
# to remember to include these things. Might just work.

#compile/transpile/translate the source JS' for screenshots (from es2016 to es2015)
#Can't get jest-babel to work. Going to try babelling files manually
#Does it make sense to maintain previous setup of sending everything to sewer_outlet?
#Need to babel setup files as well as tests. Doubt that they'll work either

# SOGIVE_SCRIPTS=$(cd sogive-scripts/ && find -iname "*.js")
# RES=$(cd res/ && find -iname "*.js")
# RUN_SCRIPTS=$(find -iname "*.js")

# for js_file in ${SOGIVE_SCRIPTS[*]}; do
# 	printf "\n"
# 	printf "\nBabeling $js_file ..."
# 	babel sogive-scripts/$js_file --out-file sewer_outlet/sogive-scripts/$js_file
# 	printf "\n"
# done

# for js_file in ${RES[*]}; do
# 	printf "\n"
# 	printf "\nBabeling $js_file ..."
# 	babel res/$js_file --out-file sewer_outlet/res/$js_file
# 	printf "\n"
# done

# for js_file in ${RUN_SCRIPTS[*]}; do
# 	printf "\n"
# 	printf "\nBabeling $js_file ..."
# 	babel $js_file --out-file sewer_outlet/$js_file
# 	printf "\n"
# done

RES=$(cd res/ && find -iname "*.js")

for js_file in ${RES[*]}; do
	babel res/$js_file --out-file babeled-res/$js_file
done

# babel ./res/puppeteer_environment.js --out-file ./res/puppeteer_environment_babel.js
# babel ./res/setup.js --out-file ./res/setup_babel.js
# babel ./res/teardown.js --out-file ./res/teardown_babel.js
# babel ./res/custom-reporter.js --out-file ./res/custom-reporter_babel.js
