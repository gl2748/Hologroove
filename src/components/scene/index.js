import { h, Component } from 'preact';
import * as THREE from 'three';
import style from './style';

const TOUCH = typeof window !== 'undefined' && 'Touch' in window && navigator.maxTouchPoints>1;
const coords = e => ((e = e.touches && e.touches[0] || e), ({ x: e.pageX, y: e.pageY }));

// COLORS.
const color1 = 0x0; // Text and text shadow.
const color2 = 0xf0f0f0; // Background

export default class SceneContainer extends Component {
	mouseDown(e) {
		let { rotateX=0, rotateY=0 } = this.state;
		this.downState = { rotateX, rotateY };
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
		// this.object.rotation.y = rotateX * Math.PI;
		this.object.rotation.z = - rotateX * Math.PI;
		this.scene.scale.addScalar( zoom - this.scene.scale.x );
		this.rerender();
	}

	setupThree() {
		let { width, height } = this.base.getBoundingClientRect();
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(width*2, height*2);
		this.base.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( color2 );

		this.camera = new THREE.PerspectiveCamera(
			35,         // FOV
			800 / 640,  // Aspect
			0.1,        // Near
			10000       // Far
		);

		this.camera.position.set(10, 20, 30);
		this.camera.lookAt(this.scene.position);
		
		this.renderText();
		// this.renderObject();
		this.renderDisk();
		this.renderLighting();
		this.rerender();
	}

	rerender() {
		this.renderer.render(this.scene, this.camera);
	}

	fontLoaderCallback = ( font ) => {
		const textShape = new THREE.BufferGeometry();
		const color = color1;
		const matDark = new THREE.LineBasicMaterial( {
			color,
			side: THREE.DoubleSide
		} );
		const matLite = new THREE.MeshBasicMaterial( {
			color,
			transparent: true,
			opacity: 0.2,
			side: THREE.DoubleSide
		} );
		const message = 'Holo Groove';
		let shapes = font.generateShapes( message, 1, 5 );
		const geometry = new THREE.ShapeGeometry( shapes );
		geometry.computeBoundingBox();
		// const xMid = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		const center = geometry.boundingBox.getCenter();
		geometry.translate( - center.x, 0, center.z );

		// make shape ( N.B. edge view not visible )
		textShape.fromGeometry( geometry );
		const textShadow = new THREE.Mesh( textShape, matLite );
		const text = new THREE.Mesh( textShape, matDark );
		// TODO: Make this positioning responsive.
		text.position.z = -8;
		textShadow.position.z = -8;
		textShadow.rotateX(-1.5708);


		// make line shape ( N.B. edge view remains visible )
		/*
		const holeShapes = [];
		for ( let i = 0; i < shapes.length; i++ ) {
			const shape = shapes[ i ];
			if ( shape.holes && shape.holes.length > 0 ) {
				for ( let j = 0; j < shape.holes.length; j++ ) {
					const hole = shape.holes[ j ];
					holeShapes.push( hole );
				}
			}
		}
		shapes = [...shapes, ...holeShapes];
		const lineText = new THREE.Object3D();
		for ( let i = 0; i < shapes.length; i++ ) {
			const shape = shapes[ i ];
			const lineGeometry = shape.createPointsGeometry();
			lineGeometry.translate( xMid, 0, 0 );
			const lineMesh = new THREE.Line( lineGeometry, matDark );
			lineText.add( lineMesh );
		}
		*/
		return { /*lineText,*/ textShadow, text };
	}

	componentDidMount() {
		setTimeout( () => this.setupThree(), 3);
	}

	componentWillReceiveProps() {
		if (this.base) this.update();
	}

	shouldComponentUpdate() {
		return false;
	}

	/*
	renderObject() {
		this.object = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({ color: 0xFF0000 })
		);
		this.scene.add(this.object);
	}
	*/

	renderText() {
		const loader = new THREE.FontLoader();
		loader.load( '../../assets/fonts/helvetiker_regular.typeface.json', font => {
			const loadedFont = this.fontLoaderCallback(font)
			//this.scene.add(loadedFont.lineText);
			this.scene.add(loadedFont.text);
			this.scene.add(loadedFont.textShadow);
			this.rerender();
		});
	}

	renderDisk() {
		this.object = new THREE.Mesh(
			new THREE.CircleGeometry( 5, 32 ),
			new THREE.MeshBasicMaterial( {
				color: color1,
				wireframe: true,
				side: THREE.DoubleSide
			} )
		);
		this.object.rotateX(-1.5708);
		this.scene.add(this.object);
		this.rerender();
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
