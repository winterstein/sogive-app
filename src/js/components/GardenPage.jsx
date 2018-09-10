import React from 'react';
import { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import _ from 'lodash';
import { XId, encURI } from 'wwutils';

import printer from '../base/utils/printer';
// import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Misc from '../base/components/Misc';
import {LoginLink} from '../base/components/LoginWidget';
import {DropZone, Draggable, dragstate} from '../base/components/DragDrop';
import game from './gardenGame';

// https://www.gamedevmarket.net/asset/animated-insects-6303/
// https://graphicriver.net/item/funny-flying-bugs/13665994?s_rank=4
// https://www.gameartguppy.com/shop/red-ant/

const start = new Date().getTime();
const gameUpdate = () => {
	let tick = new Date().getTime() - start;
	// console.log("update", new Date().getTime() - start);
	DataStore.setValue(['game','tick'], tick);
	// loop over active sprites
	const sprites = getActiveSprites();
	sprites.forEach(s => {
		spriteUpdate(s);
	});
};
const spriteUpdate = (sprite) => {
	if (sprite.x) sprite.x += 1;
};

const gameInit = () => {
	DataStore.setValue(['data', 'Sprite', 'ant'], 
		{id:'ant', img:'/img/garden/ant.jpg'}
	);
	DataStore.setValue(['data', 'Sprite', 'aphid'], {id:'aphid', img:'/img/garden/aphid.png'});
	DataStore.setValue(['data', 'Sprite', 'fossil'], {id:'fossil', img:'/img/foss1.jpg'});
};
gameInit();

setInterval(gameUpdate, 100);

/**
 * @returns {Sprite[]}
 */
const getActiveSprites = () => {
	let spritesm = DataStore.getValue('data', 'Sprite') || {};
	let sprites = Object.values(spritesm).filter(s => s.active);
	return sprites;
};
const getSprite = (id) => DataStore.getValue('data','Sprite',id);

const GardenPage = () => {
	return (
		<div className="page GardenPage">
			<Garden />
			<Hand />
		</div>
	);
}; // ./GardenPage

const Garden = () => {
	let sprites = getActiveSprites();
	return (<div>
		<DropZone id='garden' onDrop={(e,drop) => {
			console.log("dropp",e,drop);
			let s = getSprite(drop.draggable);
			if (s) {
				s.active = true;
				s.x = drop.x; s.y = drop.y;
			}
		}}>
			{sprites.map(s => <Sprite key={s.id} sprite={s}/>)}
		</DropZone>
	</div>);
};

const Sprite = ({sprite}) => {
	let style= {position:'absolute', 
		top:sprite.y+'px', left:sprite.x+'px',
		border:'1px solid red'};
	return (<div key={sprite.id} style={style}>
		{sprite.img? <img src={sprite.img} width='50px' /> : null}
		{JSON.stringify(sprite)}</div>);
};

const Hand = () => {
	const spritesForId = DataStore.getValue('data', 'Sprite');
	const sprites = Object.values(spritesForId).filter(s => ! s.active);
	return (<div className='card'>
		{sprites.map(s => <Draggable key={s.id} id={s.id}><Card sprite={s} /></Draggable>)}
	</div>);
};

const Card = ({sprite}) => {
	return <div className='card'>{sprite.id}</div>;
};

export default GardenPage;
