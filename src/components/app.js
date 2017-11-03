import { h, Component } from 'preact';

import { SceneContainer } from './scene';
export default class App extends Component {
	render() {
		return (
			<div id="app">
				<SceneContainer />
			</div>
		);
	}
}
