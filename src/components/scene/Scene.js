import { h, Component } from 'preact';
import * as THREE from 'three';
import style from './style';

// COLORS.
const color1 = 0xafb8e3; // Text and text shadow.
const color2 = 0x101111; // Background.
const color3 = 0xff0000; // Hover.

class Scene extends Component {
	//@debounce
	update() {
		let { zoom, rotateX, mouseX, mouseY, timer } = this.props;
		const record = this.scene.children[0];
		const button = this.scene.children[1];
		this.object.rotation.z = - rotateX * Math.PI;
		if (this.state.diskRotating) {
			this.object.rotation.z = - timer * Math.PI;
		}
		this.mouse = new THREE.Vector2(mouseX, mouseY);
		this.scene.scale.addScalar( zoom - this.scene.scale.x );
		this.raycaster.setFromCamera( this.mouse, this.camera );
		const intersects = this.raycaster.intersectObject(button);
		if (intersects.length > 0) {
			this.hoverButton(button);
			this.setState({ diskRotating: true });
		} else {
			document.body.classList.remove('hoverElement');
			button.material.color.set( color1 );
			this.setState({ diskRotating: false });
		}
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

		this.camera.position.set(0, 30, 0);
		this.camera.lookAt(this.scene.position);

		this.raycaster = new THREE.Raycaster();
		this.renderText();
		this.renderDisk();
		this.renderButton();
		//this.renderArrow();
		this.renderLighting();
		this.rerender();
		
	}

	rerender() {
		this.renderer.render(this.scene, this.camera);
	}

	hoverButton ( button) {
		button.material.color.set( color3 );
		document.body.classList.add('hoverElement');
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
		//geometry.translate( - center.x, 0, center.z );

		// make shape ( N.B. edge view not visible )
		textShape.fromGeometry( geometry );
		const textShadow = new THREE.Mesh( textShape, matLite );
		const text = new THREE.Mesh( textShape, matDark );

		// TODO: Make this positioning responsive.
		text.position.z = -8;
		textShadow.position.z = -8;
		textShadow.rotateX(-1.5708);
		return { textShadow, text };
	}

	componentDidMount() {
		this.setupThree();
	}

	componentWillReceiveProps() {
		if (this.base) this.update();
	}

	shouldComponentUpdate() {
		return false;
	}

	renderText() {
		const loader = new THREE.FontLoader();
		loader.load( '../../assets/fonts/helvetiker_regular.typeface.json', font => {
			const loadedFont = this.fontLoaderCallback(font)
			// this.scene.add(loadedFont.text);
			// this.scene.add(loadedFont.textShadow);
			this.rerender();
		});
	}

	renderButton() {
		// Button will be a grid of dots that respond to click.
		const buttonGeometry = new THREE.PlaneGeometry( 1, 1, 1 );
		const buttonMaterial = new THREE.MeshBasicMaterial( {
			color: color1,
			side: THREE.DoubleSide,
			wireframe: true,
		} );
		const button = new THREE.Mesh( buttonGeometry, buttonMaterial );
		button.rotation.x = -1.57;
		button.position.set( 7, 0, 0 );
		// Foreach vertex add a point
		button.name = 'button';
		this.scene.add( button );
		this.rerender();
	}

	renderArrow() {
		const arrowMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
		const arrowGeometry = new THREE.Geometry();
		arrowGeometry.vertices.push(new THREE.Vector3(-10, 0, 0));
		arrowGeometry.vertices.push(new THREE.Vector3(0, 10, 0));
		arrowGeometry.vertices.push(new THREE.Vector3(10, 0, 0));
		const arrow = new THREE.Line(arrowGeometry, arrowMaterial);
		this.scene.add( arrow );
		this.rerender();
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
		this.object.name = 'disk';
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

export default Scene;