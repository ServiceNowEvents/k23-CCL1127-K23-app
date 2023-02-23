import {createCustomElement} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, {updateState}) => {
	return (
		<div>Hello World!</div>
	);
};

createCustomElement('snc-k23-uic-pb', {
	renderer: {type: snabbdom},
	view,
	styles
});
