// SoGive
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import PropControls from './base/components/propcontrols/PropControls';

import Misc from './base/components/Misc';
import MainDiv from './components/MainDiv';
import ServerIO from './plumbing/ServerIO'; // import to set api endpoints

let dummy1 = ServerIO;

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
import '../style/print.less';

let dummy = PropControls; // protect the unused PropControls import

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;

// global jquery for You-Again
window.$ = $;

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
	);
