import { h, Component } from 'preact';
import * as THREE from 'three';
import style from './style';

// COLORS.
const color1 = 0xafb8e3; // Text and text shadow.
const color2 = 0x101111; // Background.
const color3 = 0xff0000; // Hover.

class Scene extends Component {
	constructor() {
		super();
		this.state = {
			diskRotating: false,
			transitionOn: false,
			transitionOff: false,
			incrementedRotation: 0,
		}
	}

	determineIntersects(mouse, sceneObject, camera) {
		this.raycaster.setFromCamera( mouse, camera );
		const intersects = this.raycaster.intersectObject(sceneObject);
		return intersects.length > 0;
	}

	handleClick(clickTime) {
		this.hasIntersect && this.setState({ 
			transitionOn: this.state.diskRotating === false,
			transitionOff: this.state.diskRotating === true,
            diskRotating: !this.state.diskRotating,
            clickTime,
		});
		this.hasIntersect && setTimeout(() => {
			this.setState({
				transitionOn: false,
				transitionOff: false,
                incrementedRotation: 0,
                clickTime,
			});
		}, 3000);
	}

	// Rotation
	rotateDisk(timer) {
        const currentRotation = this.object.rotation.z;
        const radius = this.object.geometry.parameters.radius;
		if (this.state.diskRotating === true) {
            if (this.state.transitionOn === true) {
                const timeChange = timer - this.state.clickTime
                const angularAcc = 3.14;
                const angVel = angularAcc * timeChange
                const angleChange = angVel * timeChange / radius;
                this.object.rotation.z = angleChange;
            } else {
                this.object.rotation.z = currentRotation + 0.125663706;
            }
        }
        if (this.state.diskRotating === false) {
            if ( this.state.transitionOff === true ) {
                const timeChange = timer - this.state.clickTime
                const angularAcc = -3.14;
                const angVel = angularAcc * timeChange
                const angleChange = angVel * timeChange / radius;
                this.object.rotation.z = angleChange;
            }
        }
		this.rerender();
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

	componentDidMount() {
		this.setupThree();
	}

	componentWillReceiveProps(nextProps) {
		if (this.base) this.update();
		// TODO: need a better method to assess click... currently if pointer does not move = no click perhaps time dimension...
		if (nextProps.mouseDownX !== this.props.mouseDownX) this.handleClick(nextProps.timer);
		// Only rotate if record is playing.
		if (nextProps.timer !== this.props.timer) this.rotateDisk(nextProps.timer);
	}

	shouldComponentUpdate() {
		return false;
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