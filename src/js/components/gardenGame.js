
import DataStore from '../base/plumbing/DataStore';
import {defineType} from '../base/data/DataClass';

DataStore.update({game: {}});
const game = DataStore.getValue('game');
window.game = game;

const start = new Date().getTime();
const gameUpdate = () => {
	let tick = new Date().getTime() - start;	
	// loop over active sprites
	const sprites = getActiveSprites();
	sprites.forEach(s => {
		spriteUpdate(s);
	});
	// trigger an update
	DataStore.setValue(['game','tick'], tick);
};
const spriteUpdate = (sprite) => {
	// turn towards strawberries?
	spriteTurn(sprite);
	// move
	if (sprite.speed) {
		let prev = {x:sprite.x, y:sprite.y};
		sprite.x -= sprite.speed;
		// collisions?
		let hit = testForCollisions(sprite);
		// abort the move
		if (hit) {
			sprite.x = prev.x; sprite.y = prev.y;
		}
	}
};

const spriteTurn = sprite => {

};

const Sprite = defineType('Sprite');

Sprite.testCollision = (a, b) => {
	if (a===b) return false;
	const x = Math.min(a.x, b.x);
	const y = Math.min(a.y, b.y);
	const w = 64; const h=64;
	return x+w > a.x && y+h > a.y 
		&& x+w > b.x && y+h > b.y;
};

const onCollision = (a, b) => {
	console.log("onCollision",a,b);
	if (a.type==='aphid' && b.type==='strawberry') {
		doDamage(b, 1);
	}
};
const onDeath = sprite => {
	sprite.active = false;
	sprite.dead = true;
};

const doDamage = (sprite, d) => {
	sprite.health -= d;
	if (sprite.health === 0) {
		onDeath(sprite);
	}
};

/**
 * @returns {Boolean} true if a collision should stop movement.
 */
const testForCollisions = sprite => {
	let ass = getActiveSprites();
	let hit = false;
	ass.forEach(s => {
		if (Sprite.testCollision(sprite, s)) {
			onCollision(sprite, s);
			onCollision(s, sprite);
			hit = true;
		}
	});
	return hit;
};

const img4type = {
	ant: '/img/garden/ant.jpg',
	aphid: '/img/garden/aphid.png',
	strawberry: '/img/garden/Strawberry-Plant.jpg'
};

const gameInit = () => {
	addSprite({type:'ant', active:false, speed:1});
	addSprite({type:'aphid', active:false, speed:1});
	addSprite({type:'ant', active:false, speed:1});

	addSprite({type:'strawberry', active:true, x:200, y:200, speed:0, health:100});
};

let c = 0;

const addSprite = (s) => {
	let id = s.id || s.type+'_'+c;
	s.id = id;	
	c += 1;
	if ( ! s.img) {
		s.img = img4type[s.type];
	}
	DataStore.setValue(['data', 'Sprite', id], s);
};

/**
 * @returns {Sprite[]}
 */
const getActiveSprites = () => {
	let spritesm = DataStore.getValue('data', 'Sprite') || {};
	let sprites = Object.values(spritesm).filter(s => s.active);
	return sprites;
};
const getSprite = (id) => DataStore.getValue('data','Sprite',id);

gameInit();

setInterval(gameUpdate, 100);

export {
	getSprite, getActiveSprites
};
