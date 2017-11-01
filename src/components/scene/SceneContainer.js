import { h, Component } from 'preact';
import * as THREE from 'three';
import style from './style';
import Scene from './Scene';

const TOUCH = typeof window !== 'undefined' && 'Touch' in window && navigator.maxTouchPoints>1;
const coords = e => ((e = e.touches && e.touches[0] || e), ({ x: e.pageX, y: e.pageY }));

// COLORS.
const color1 = 0x0; // Text and text shadow.
const color2 = 0xf0f0f0; // Background

let timer = 0.666;

class SceneContainer extends Component {

	timerFunc() {
		setInterval(() => {
			let updatedTimer = this.state.timer + 0.01;
			updatedTimer = updatedTimer >= 1 ? 0 : updatedTimer;
			this.setState({ timer: updatedTimer });
		}, 30);
	}

	mouseDown(e) {
		e.preventDefault();
		let { rotateX=0 } = this.state;
		this.downState = { rotateX };
		this.down = coords(e);
		let p = coords(e),
			mouseDownX = ( p.x / innerWidth ) * 2 - 1,
			mouseDownY = - ( p.y / innerHeight ) * 2 + 1;
		this.setState({ mouseDownX, mouseDownY, mouseDown: true, });
	}
	
	mouseMove(e) {
		if (!this.down) {
			let p = coords(e),
				mouseX = ( p.x / innerWidth ) * 2 - 1,
				mouseY = - ( p.y / innerHeight ) * 2 + 1;
			this.setState({ mouseX, mouseY });
			return;
		}
		let p = coords(e),
			x = p.x - this.down.x,
			y = p.y - this.down.y,
			{ rotateX } = this.downState;
		rotateX += x/innerWidth - .5;
		this.setState({ rotateX });
	}
	
	mouseUp() {
		this.downState = null;
		this.down = null;
	}

	constructor() {
		super();
		this.events = {
			[TOUCH?'onTouchStart':'onMouseDown']: this.mouseDown.bind(this),
			[TOUCH?'onTouchMove':'onMouseMove']: this.mouseMove.bind(this),
			[TOUCH?'onTouchEnd':'onMouseUp']: this.mouseUp.bind(this)
		};
		this.state = {
			zoom: 1,
			timer: 0
		};
	}

	componentDidMount() {
		this.timerFunc();
	}

	render({}, { zoom=1, rotateX=0, mouseX, mouseY, timer }) {
		return (
			<div class={style.scene}>
				<div class={style.main} {...this.events}>
					<Scene {...{ zoom, rotateX, mouseX, mouseY, timer }} />
				</div>
			</div>
		);
	}
}

export default SceneContainer;