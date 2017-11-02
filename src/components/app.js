import { h, Component } from 'preact';

import Title from './title';

import { SceneContainer } from './scene';
export default class App extends Component {
	render() {
		return (
			<div id="app">
				<Title />
				<SceneContainer />
			</div>
		);
	}
}
