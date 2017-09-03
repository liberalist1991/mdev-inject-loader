'use strict';
const loaderUtils = require('loader-utils')
const path = require('path')
const fs = require('fs')

module.exports = function (source) {

    if (this.cacheable) {
        this.cacheable(true)
    }
    const callback = this.async();
    const options = loaderUtils.getOptions(this);

    // /src/module/module-1/module-1.js
    const jsPath = this.resourcePath;

    let result = wrapJs(source, jsPath);

    callback(null, result);
}

function wrapJs (source, jsPath) {

    // /src/module/module-1
    const modulePath = path.dirname(jsPath),
        moduleParent = path.dirname(modulePath),
        moduleName = path.basename(modulePath);
    // 只处理module目录下的
    if ( moduleParent.indexOf('module') < 0) {
        return source;
    }

    let selector = 'div[node-type~="module"].module-' + moduleName;

    source = source.replace(/mdev\.dom\.build(\s\t)*\((\s\t)*([^\)])/ig, ($, $1, $2, $3) => {
        return `mdev.dom.build('${selector}',` + $3
    })

    source = source.replace(/mdev\.dom\.getInstance(\s\t)*\((\s\t)*([^\)])/ig, ($, $1, $2, $3) => {
        return `mdev.dom.getInstance('${selector}',` + $3
    })
    source = source.replace(/mdev\.message\.listen(\s\t)*\(/ig, ($) => {
        return `mdev.message.listen('${moduleName}',`
    })
    // if (mdev && mdev.modules) {
    //     mdev.modules.push(moduleName);
    // }
    return source
};
