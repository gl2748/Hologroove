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

	// By periodically passing updated time prop to child, we can trigger an update.
	// Increment by 0.04 every 40 ms.
	// Therefore the timer prop on the child component will reflect time passed in seconds
	// and the child component will update 25 times a second.
	timerFunc() {
		setInterval(() => {
			let updatedTimer = this.state.timer + 0.04;
			this.setState({ timer: updatedTimer });
		}, 40);
	}

	mouseDown(e) {
		e.preventDefault();
		let { rotateX=0 } = this.state;
		this.downState = { rotateX };
		this.down = coords(e);
		let p = coords(e),
			mouseDownX = ( p.x / window.innerWidth ) * 2 - 1,
			mouseDownY = - ( p.y / window.innerHeight ) * 2 + 1;
		this.setState({ mouseDownX, mouseDownY, mouseDown: true });
	}
	
	mouseMove(e) {
		if (!this.down) {
			let p = coords(e),
				mouseX = ( p.x / window.innerWidth ) * 2 - 1,
				mouseY = - ( p.y / window.innerHeight ) * 2 + 1;
			this.setState({ mouseX, mouseY });
			return;
		}
		let p = coords(e),
			x = p.x - this.down.x,
			y = p.y - this.down.y,
			{ rotateX } = this.downState;
		rotateX += x/window.innerWidth - .5;
		this.setState({ rotateX });
	}
	
	mouseUp() {
		this.downState = null;
		this.down = null;
		this.setState({ mouseDown: false });
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

	render({}, { zoom=1, rotateX=0, mouseX=0, mouseY=0, timer=0, mouseDown=0, mouseDownX=0, mouseDownY=0 }) {
		return (
			<div class={style.scene}>
				<div class={style.main} {...this.events}>
					<Scene {...{ zoom, rotateX, mouseX, mouseY, timer, mouseDown, mouseDownX, mouseDownY }} />
				</div>
			</div>
		);
	}
}

export default SceneContainer;