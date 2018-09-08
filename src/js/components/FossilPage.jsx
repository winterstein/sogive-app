

import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../base/utils/printer.js';
import C from '../C';
import Roles from '../base/Roles';
import DataStore from '../base/plumbing/DataStore';

let hpx = '75px';

const FossilPage = () => {

	let width = 11;
	let height = 9;

	let rows = [];
	for(let i=1; i <= height; i += 1) {
		let cols = [];
		for(let j=1; j <= width; j += 1) {
			cols.push(<td key={'k'+j} style={{width:'9%', height:hpx}}><Rock r={i} c={j} /></td>);
		}
		let rowi = <tr key={'k'+i}>{cols}</tr>;
		rows.push(rowi);
	}

	return (
		<div className='FossilPage'>
			<h2>Fossil Hunter</h2>

			<p>

tap rock image to reveal fossil images
			</p>

			<table className=''>
				<tbody>
					{rows}
				</tbody>
			</table>
		</div>
	);
};

let rockImages = ['/img/rocks.jpg', '/img/rock-monster.png', '/img/jade.jpg'];

let fossilImages = ['/img/fossil-hardshellcrab.jpg', '/img/fish.jpeg',
	'/img/Seymouria_Fossil.jpg', '/img/foss1.jpg', 
	'/img/Dinosaur-coprolite.jpg',
	'/img/Ich-vert.jpg', '/img/trex.jpg',
	'/img/fossil-watch.jpeg',
	'/img/woo-image.jpg',
	'/img/fossil-watch2.gif','/img/Fossil-Starter-Kit.jpg',
	'/img/fossil-commuter-fs5325-multiple-2.jpg'];

let Rock = ({r,c}) => {	
	let wasHit = hits[r+' '+c];
	let isFossil = (r+c) % 2 === 1;
	let rockImage = rockImages[(r+c) % rockImages.length];
	if (wasHit) {
		if (isFossil) {
			let fi = (r+c) % fossilImages.length;
			rockImage = fossilImages[fi];
		} else {
			return <div />;
		}
	}
	return (<div onClick={e => hitRock(r,c)}>
		<img style={{width:'100%', maxHeight:hpx}} src={rockImage} />
	</div>);
};

let hits = {};

let hitRock = (r,c) => {
	hits[r+' '+c] = true;
	DataStore.update();
};

export default FossilPage;
