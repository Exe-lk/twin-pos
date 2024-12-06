import React from 'react';
import { demoPagesMenu, pageLayoutTypesPagesMenu } from '../menu';
import DefaultFooter from '../pages/_layout/_footers/DefaultFooter';

const footers = [
	
	{ path: '/*', element: <DefaultFooter />, exact: true },
];

export default footers;
