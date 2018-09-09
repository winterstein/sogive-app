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
import {getActiveSprites, getSprite} from './gardenGame';

// https://www.gamedevmarket.net/asset/animated-insects-6303/
// https://graphicriver.net/item/funny-flying-bugs/13665994?s_rank=4
// https://www.gameartguppy.com/shop/red-ant/


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
			if ( ! drop.draggable) return;
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
	return (<div className='Sprite' key={sprite.id} style={style}>
		{sprite.img? <img src={sprite.img} /> : sprite.id}
	</div>);
};

const Hand = () => {
	const spritesForId = DataStore.getValue('data', 'Sprite');
	const sprites = Object.values(spritesForId).filter(s => ! s.active);
	return (<div className='card'>
		<div className='row'>
		{sprites.map(s => <Draggable className='col-sm-3' key={s.id} id={s.id}><Card sprite={s} /></Draggable>)}
		</div>
	</div>);
};

const Card = ({sprite}) => {
	return (<div className='SpriteCard card'>
		{sprite.img? <img src={sprite.img} /> : null}
		<p>{sprite.id}</p>
	</div>);
};

export default GardenPage;
