'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*!
 * XmlPrinter
 * Copyright (c) 2016 Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/xml-printer
 * License: MIT
 */

/**
 * typedef {Object} XmlNode
 * @property {string} name - element name (empty for text nodes)
 * @property {string} type - node type ('element' or 'text')
 * @property {string} value - value of a text node
 * @property {XmlNode} parent - reference to parent node or null
 * @property {Object} attributes - map of attributes name => value
 * @property {XmlNode[]} children - array of children nodes
 */

/**
 * Returns true if x is truthy or 0
 * @param  {any} x
 * @return {boolean}
 */
var isSomething = function isSomething(x) {
    return x || x === 0;
};

/**
 * Escapes XML text
 * https://en.wikipedia.org/wiki/CDATA
 * @param  {string} text
 * @return {string}
 */
var escapeXmlText = exports.escapeXmlText = function escapeXmlText(text) {
    if (isSomething(text)) {
        var str = String(text);
        return (/[&<>'"]/.test(str) ? '<![CDATA[' + str.replace(/]]>/, ']]]]><![CDATA[>') + ']]>' : str
        );
    }
    return '';
};

/**
 * Escapes attribute value
 * @param  {string} attribute
 * @return {string}
 */
var escapeXmlAttribute = exports.escapeXmlAttribute = function escapeXmlAttribute(attribute) {
    return String(attribute).replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Serializes an attribute value
 * @param  {string} attributes
 * @return {string}
 */
var serializeAttrs = function serializeAttrs(attributes, escapeValue, quote) {
    var result = '';
    for (var k in attributes) {
        var v = attributes[k];
        result += ' ' + k + '=' + quote + (isSomething(v) ? escapeValue ? escapeXmlAttribute(v) : v : '') + quote;
    }
    return result;
};

/**
 * @param  {XmlNode|XmlNode[]} ast
 * @return {string}
 */
var print = function print(ast) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$escapeAttrib = options.escapeAttributes,
        escapeAttributes = _options$escapeAttrib === undefined ? true : _options$escapeAttrib,
        _options$escapeText = options.escapeText,
        escapeText = _options$escapeText === undefined ? true : _options$escapeText,
        _options$selfClose = options.selfClose,
        selfClose = _options$selfClose === undefined ? true : _options$selfClose,
        _options$indent = options.indent,
        indent = _options$indent === undefined ? 0 : _options$indent,
        _options$currentInden = options.currentIndent,
        currentIndent = _options$currentInden === undefined ? indent : _options$currentInden,
        _options$quote = options.quote,
        quote = _options$quote === undefined ? '"' : _options$quote;

    if (Array.isArray(ast)) {
        if (indent) {
            var allElements = ast.every(function (node) {
                return node.type === 'element';
            });
            var whiteSpace = new Array(currentIndent + 1).join(' ');
            if (allElements) {
                return ast.map(function (ast) {
                    return '\n' + whiteSpace + print(ast, _extends({}, options, { currentIndent: indent + currentIndent }));
                }).join('') + '\n';
            }
        }
        return ast.map(function (ast) {
            return print(ast, options);
        }).join('');
    }
    if (ast.type === 'text') {
        return '' + (escapeText ? escapeXmlText(ast.value) : ast.value);
    }
    var attributes = serializeAttrs(ast.attributes, escapeAttributes, quote);
    return ast.children.length || !selfClose ? '<' + ast.name + attributes + '>' + print(ast.children, options) + '</' + ast.name + '>' : '<' + ast.name + attributes + '/>';
};

exports.default = print;