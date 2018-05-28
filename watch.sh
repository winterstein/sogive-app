#!/bin/bash

cp ../wwappbase.js/project/webpack.config.js webpack.config.js
npm i &
npm update --save &
npm run compile-watch
