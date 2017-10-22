import { h, Component } from 'preact';
import * as THREE from 'three';
import style from './style';

const TOUCH = typeof window !== "undefined" && 'Touch' in window && navigator.maxTouchPoints>1;
const coords = e => ((e = e.touches && e.touches[0] || e), ({ x:e.pageX, y:e.pageY }));

export default class SceneContainer extends Component {
	mouseDown(e) {
		let { rotateX=0, rotateY=0 } = this.state;
		this.downState = { rotateX, rotateY }
		this.down = coords(e);
		e.preventDefault();
	}
	
	mouseMove(e) {
		if (!this.down) return;
		let p = coords(e),
			x = p.x - this.down.x,
			y = p.y - this.down.y,
			{ rotateX, rotateY } = this.downState;
		rotateX += x/innerWidth - .5;
		rotateY += y/innerHeight - .5;
		this.setState({ rotateX, rotateY });
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
			zoom: 1
		};
	}

	render({}, { zoom=1, rotateX=0, rotateY=0 }) {
		return (
			<div class={style.scene}>
				<div class={style.main} {...this.events}>
					<Scene {...{ zoom, rotateX, rotateY }} />
				</div>
			</div>
		);
	}
}

class Scene extends Component {
	//@debounce
	update() {
		let { zoom, rotateX, rotateY } = this.props;
		this.object.rotation.y = rotateX * Math.PI;
		this.object.rotation.z = - rotateY * Math.PI;
		this.scene.scale.addScalar( zoom - this.scene.scale.x );
		this.rerender();
	}

	setup() {
		let { width, height } = this.base.getBoundingClientRect();
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(width*2, height*2);
		this.base.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera(
			35,         // FOV
			800 / 640,  // Aspect
			0.1,        // Near
			10000       // Far
		);
		this.camera.position.set(-15, 10, 15);
		this.camera.lookAt(this.scene.position);
		
		this.renderObject();
		this.renderLighting();
		this.rerender();
	}

	rerender() {
		this.renderer.render(this.scene, this.camera);
	}

	componentDidMount() {
		setTimeout( () => this.setup(), 1);
	}

	componentWillReceiveProps() {
		if (this.base) this.update();
	}

	shouldComponentUpdate() {
		return false;
	}

	renderObject() {
		this.object = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({ color: 0xFF0000 })
		);
		this.scene.add(this.object);
	}
	
	renderLighting() {
		let light = new THREE.PointLight(0xFF0000, 1, 100);
		light.position.set( 10, 0, 10 );
		this.scene.add(light);

		light = new THREE.PointLight(0xFF0000, 1, 50);
		light.position.set( -20, 15, 10 );
		this.scene.add(light);

		this.renderer.setClearColor(0x222222, 1);
	}

	render() {
		return <div class={style.scene} />;
	}
}
