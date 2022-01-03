import React from 'react';
import ReactDOMServer from 'react-dom/server';
import MainDiv from '../js/components/MainDiv';

import templateFn from './template';

export default (req, res) => {
    const html = ReactDOMServer.renderToString(
        <MainDiv />
    );
    const template = templateFn(html);
    res.send(template);
};