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

	setupThree() {
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
		setTimeout( () => this.setupThree(), 1);
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

	renderText() {
		const loader = new THREE.FontLoader();
		loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
			var xMid, text;
			var textShape = new THREE.BufferGeometry();
			var color = 0x006699;
			var matDark = new THREE.LineBasicMaterial( {
				color: color,
				side: THREE.DoubleSide
			} );
			var matLite = new THREE.MeshBasicMaterial( {
				color: color,
				transparent: true,
				opacity: 0.4,
				side: THREE.DoubleSide
			} );
			var message = "   Three.js\nSimple text.";
			var shapes = font.generateShapes( message, 100, 2 );
			var geometry = new THREE.ShapeGeometry( shapes );
			geometry.computeBoundingBox();
			xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
			geometry.translate( xMid, 0, 0 );
			// make shape ( N.B. edge view not visible )
			textShape.fromGeometry( geometry );
			text = new THREE.Mesh( textShape, matLite );
			text.position.z = - 150;
			this.scene.add( text );
			// make line shape ( N.B. edge view remains visible )
			var holeShapes = [];
			for ( var i = 0; i < shapes.length; i ++ ) {
				var shape = shapes[ i ];
				if ( shape.holes && shape.holes.length > 0 ) {
					for ( var j = 0; j < shape.holes.length; j ++ ) {
						var hole = shape.holes[ j ];
						holeShapes.push( hole );
					}
				}
			}
			shapes.push.apply( shapes, holeShapes );
			var lineText = new THREE.Object3D();
			for ( var i = 0; i < shapes.length; i ++ ) {
				var shape = shapes[ i ];
				var lineGeometry = shape.createPointsGeometry();
				lineGeometry.translate( xMid, 0, 0 );
				var lineMesh = new THREE.Line( lineGeometry, matDark );
				lineText.add( lineMesh );
			}
			this.scene.add( lineText );
		});
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
