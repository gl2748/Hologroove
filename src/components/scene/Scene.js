import { h, Component } from 'preact';
import * as THREE from 'three';
import style from './style';

// COLORS.
const color1 = 0xafb8e3; // Text and text shadow.
const color2 = 0x101111; // Background.
const color3 = 0xff0000; // Hover.

class Scene extends Component {

	determineIntersects(mouse, sceneObject, camera) {
		this.raycaster.setFromCamera( mouse, camera );
		const intersects = this.raycaster.intersectObject(sceneObject);
		return intersects.length > 0;
	}

	handleClick() {
		this.hasIntersect && this.setState({ diskRotating: !this.state.diskRotating });
		// Set a timeout, that adds an 'disk slow down' attribute to state, when the disk rotating
		// Goes from on to off. 
		// While the 'disk slow down' is true. Apply an slowing rotation to the disk rotation.
		// Vice Versa for disk going from not rotating to rotating.
		this.setState({
			transition: true,
			rad2Add: 0
		});
		setTimeout(() => {
			this.setState({
				transition: false,
				rad2Add: 0
			});
		}, 3000);
	}

	//@debounce
	update() {
		let { mouseX, mouseY, timer } = this.props;
		this.button = this.scene.children[1];
		this.mouse = new THREE.Vector2(mouseX, mouseY);
		this.hasIntersect = this.determineIntersects(this.mouse, this.button, this.camera);
		if (this.hasIntersect) {
			this.onHover(this.button);
		} else {
			this.offHover(this.button);
		}
		if (this.state.diskRotating) {
			const currentRotation = this.object.rotation.z;
			// in the next line - 0.01 unit is radians
			const incrementedRotation = currentRotation + 0.125663706;
			this.object.rotation.z = incrementedRotation;
			/*
			if (this.state.transition) {
				let r2a = this.state.rad2Add + 0.04188790204;
				this.setState({
					rad2Add: r2a
				});
				this.object.rotation.z = r2a;

				// t0 = 1.4
				// rot = 0
				// t1 = 2.4
				// rot = 0.26

				// use the timer to accelerate the disk.
				// Transition is in state for 3s.
				// Therefore timer at transition start 
				// plus 3 seconds will reflect the change in time

				// per second is currentRotation + 0.01*25 = 0.25 rads

				// Therfore must accelerate from 0rad/p/s to 0.25rad/p/s
				// over 3 seconds.

				// acc = 0.25/3 = 0.083 rad/s^2

				// the time elapsed between each update is 0.04 of a second

				//therefore incrementally the change in angular velocity, each update is
				// 0.083 * 0.04 = 0.00332 rad/s.

				// We have subsequently updated the target to PI rad /s.
				// change in v = PI.
				// change in t = 3 seconds.
				// acceleration = PI/3
				// = 1.0471975512
				// 1.0471975512 * 0.04 = 0.04188790204
			}
			*/
		}
		this.rerender();
	}

	setupThree() {
		let { width, height } = this.base.getBoundingClientRect();

		let counter = 0;
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(width*2, height*2);
		this.base.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( color2 );

		this.camera = new THREE.OrthographicCamera(
			window.innerWidth/-50,
			window.innerWidth/50,
			window.innerHeight/50,
			window.innerHeight/-50,
			10,
			1000
		);

		this.camera.position.set(2, 20, 12);
		this.camera.lookAt(this.scene.position);

		this.raycaster = new THREE.Raycaster();
		this.renderDisk();
		this.renderButton();
		this.renderArrow();
		this.renderLighting();
		this.rerender();
	}

	rerender() {
		this.renderer.render(this.scene, this.camera);
	}

	onHover (sceneObject) {
		sceneObject.material.color.set( color3 );
		document.body.classList.add('hoverElement');
	}

	offHover (sceneObject) {
		sceneObject.material.color.set( color1 );
		document.body.classList.remove('hoverElement');
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
		const message = 'Take your release to the next level.';
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

	componentWillReceiveProps(nextProps) {
		if (this.base) this.update();
		if (nextProps.mouseDownX !== this.props.mouseDownX) this.handleClick();
	}

	shouldComponentUpdate() {
		return false;
	}

	renderText() {
		const loader = new THREE.FontLoader();
		loader.load( '../../assets/fonts/helvetiker_regular.typeface.json', font => {
			const loadedFont = this.fontLoaderCallback(font)
			this.scene.add(loadedFont.text);
			this.scene.add(loadedFont.textShadow);
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
		const textMaterial = new THREE.LineBasicMaterial({ color: color1 });

		const H = new THREE.Geometry();
		H.vertices.push(new THREE.Vector3(0, 0, 0));
		H.vertices.push(new THREE.Vector3(0, 0, 1));
		H.vertices.push(new THREE.Vector3(0, 0, 0.5));
		H.vertices.push(new THREE.Vector3(0.5, 0, 0.5));
		H.vertices.push(new THREE.Vector3(0.5, 0, 1));
		H.vertices.push(new THREE.Vector3(0.5, 0, 0));
		const letterH = new THREE.Line(H, textMaterial);
		letterH.position.set( -4.5, 0, -8 );

		const O = new THREE.Geometry();

		O.vertices.push(new THREE.Vector3(0, 0, 0));
		O.vertices.push(new THREE.Vector3(-0.4, 0, 0.5));
		O.vertices.push(new THREE.Vector3(0, 0, 1));
		O.vertices.push(new THREE.Vector3(0.4, 0, 0.5));
		O.vertices.push(new THREE.Vector3(0, 0, 0));

		const letterO = new THREE.Line(O, textMaterial);
		const letterO2 = new THREE.Line(O, textMaterial);
		const letterO3 = new THREE.Line(O, textMaterial);
		const letterO4 = new THREE.Line(O, textMaterial);

		letterO.position.set( -3.5, 0, -8 );
		letterO2.position.set( -1.5, 0, -8 );
		letterO3.position.set( 2, 0, -8 );
		letterO4.position.set( 3, 0, -8 );

		const L = new THREE.Geometry();
		L.vertices.push(new THREE.Vector3(0, 0, 0));
		L.vertices.push(new THREE.Vector3(0, 0, 1));
		L.vertices.push(new THREE.Vector3(0.5, 0, 1));		
		const letterL = new THREE.Line(L, textMaterial);
		letterL.position.set( -2.5, 0, -8 );

		const G = new THREE.Geometry();
		G.vertices.push(new THREE.Vector3(0, 0, 0));
		G.vertices.push(new THREE.Vector3(-0.4, 0, 0.5));
		G.vertices.push(new THREE.Vector3(0, 0, 1));
		G.vertices.push(new THREE.Vector3(0.4, 0, 0.5));
		G.vertices.push(new THREE.Vector3(0, 0, 0.5));
		G.vertices.push(new THREE.Vector3(0, 0, 1));
		

		const letterG = new THREE.Line(G, textMaterial);
		letterG.position.set( 0, 0, -8 );
		
		const R = new THREE.Geometry();
		R.vertices.push(new THREE.Vector3(0, 0, 0));
		R.vertices.push(new THREE.Vector3(0, 0, 1));
		R.vertices.push(new THREE.Vector3(0, 0, 0));
		R.vertices.push(new THREE.Vector3(0.4, 0, 0.5));
		R.vertices.push(new THREE.Vector3(0, 0, 0.7));
		R.vertices.push(new THREE.Vector3(0, 0, 0.35));
		R.vertices.push(new THREE.Vector3(0.5, 0, 1.01));
		const letterR = new THREE.Line(R, textMaterial);
		letterR.position.set( 1, 0, -8 );

		const V = new THREE.Geometry();
		V.vertices.push(new THREE.Vector3(0, 0, 0));
		V.vertices.push(new THREE.Vector3(0.4, 0, 1));
		V.vertices.push(new THREE.Vector3(0.8, 0, 0));

		const letterV = new THREE.Line(V, textMaterial);
		letterV.position.set( 4, 0, -8 );

		const E = new THREE.Geometry();
		E.vertices.push(new THREE.Vector3(0, 0, 0));
		E.vertices.push(new THREE.Vector3(0, 0, 1));
		E.vertices.push(new THREE.Vector3(0.5, 0, 1));
		E.vertices.push(new THREE.Vector3(0, 0, 1));
		E.vertices.push(new THREE.Vector3(0, 0, 0.5));
		E.vertices.push(new THREE.Vector3(0.5, 0, 0.5));
		E.vertices.push(new THREE.Vector3(0, 0, 0.5));
		E.vertices.push(new THREE.Vector3(0, 0, 0));
		E.vertices.push(new THREE.Vector3(0.5, 0, 0));

		const letterE = new THREE.Line(E, textMaterial);
		letterE.position.set( 5, 0, -8 );

		this.scene.add( letterH );
		this.scene.add( letterO );
		this.scene.add( letterL );
		this.scene.add( letterO2 );
		this.scene.add( letterG );
		this.scene.add( letterR );
		this.scene.add( letterO3 );
		this.scene.add( letterO4 );
		this.scene.add( letterV );
		this.scene.add( letterE );
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
		// this.object.rotateX(-1.5708);
		this.object.rotation.x = -1.57;
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