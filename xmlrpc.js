(function($, undefined) {

	'use strict';

	var xmlrpc = function (url, successCallback, errorCallback) {

		var
			subTags = {
				params: 'param',
				struct: 'member',
				array: 'data'
			},

			/**
			 * Generate xml for xmlrpc request
			 * @param  {string} method  xmlrpc method name
			 * @param  {array}  params  method parameters
			 * @return {string}         full xmlrpc method xml file
			 */
			xmlRpcCall = function(method, params) {
				var d = xmlBuilder('methodCall');

				// Add method name to document
				d.appendChild(
					d.createElement('methodName', method)
				);

				// append params
				d.appendChild(
					xmlRpcValue(d, params, 'params')
				);

				return d.serialize('<?xml version="1.0"?>');
			},

			/**
			 * Generates parts of the xmlrpc request according to the data types of
			 * the parameters
			 * @param  {xmlBuilder} d      xmlBuilder instance
			 * @param  {*}          value  value of the current argument
			 * @param  {?string}    tag    tag name that encapsules the current value; if omitted
			 *                             the tag name will be either "array" or "struct"
			 * @return {string|boolean}    the xml part for the passed value (or false if the value is invalid)
			 */
			xmlRpcValue = function(d, value, tag) {
				var type = typeof value,
					subTag, subValue,
					parentEl, dataEl, valueEl;

				//
				// Generate xml tags depending on datatype
				//
				if (type == 'number') {
					// Only works in some cases, I know...
					if (value % 1 === 0) {
						return d.createElement('int', value);
					} else {
						return d.createElement('double', value);
					}
				} else if (type == 'boolean' || type == 'string') {
					// Booleans and strings
					return d.createElement(type, value);
				} else if (value instanceof Date) {
					// Dates
					return d.createElement('dateTime.iso8601', formatDate(value));
				} else if (type == 'object') {
					// Treat arrays differently
					if (!tag) {
						tag = ($.isArray(value)) ? 'array' : 'struct';
					}
					subTag = subTags[tag];

					parentEl = d.createElement(tag);

					for (var i in value) {
						if (!value.hasOwnProperty(i)) {
							continue;
						}

						subValue = value[i];

						// Skip undefined values
						if (typeof subValue == 'undefined') {
							continue;
						}

						dataEl = d.createElement(subTag);
						valueEl = d.createElement('value');

						// Create key element for structs
						if (tag == 'struct') {
							dataEl.appendChild(
								d.createElement('name', i)
							);
						}

						// Create value element
						valueEl.appendChild(
							xmlRpcValue(d, subValue)
						);

						dataEl.appendChild(valueEl);
						parentEl.appendChild(dataEl);
					}

					return parentEl;
				}

				return false;
			},

			/**
			 * Formats a date object for xml output
			 * @param  {Date} date  the date object
			 * @return {string}     formatted date
			 */
			formatDate = function(date) {
				var month;

				month = value.getMonth() + 1;
				if (month < 10) {
					month = '0' + month;
				}

				return value.getFullYear() + '-' +
					month + '-' +
					value.getDate() + ' ' +
					value.getHours() + ':' +
					value.getMinutes() + ':' +
					value.getSeconds();
			},

			/**
			 * Helper class to build xml documents
			 * @param  {string} root  name of the xml root element
			 * @return {xmlBuilder}   instance of the xmlBuilder
			 */
			xmlBuilder = function(root) {
				var doc = document.implementation.createDocument(null, root, null);

				root = doc.getElementsByTagName(root)[0];

				return {
					createElement: function (tag, content) {
						var element = doc.createElement(tag),
							item;

						if (typeof content != 'undefined') {
							// Treat everything as an array
							if (!$.isArray(content)) {
								content = [content];
							}

							// Walk through all contents
							for (var i in content) {
								if (!content.hasOwnProperty(i)) {
									continue;
								}

								item = content[i];

								// No node, so create a new text node
								if (!(item instanceof Node)) {
									item = doc.createTextNode(item);
								}

								// Append to element
								element.appendChild(item);
							}
						}

						return element;
					},

					appendChild: function (element) {
						root.appendChild(element);
					},

					serialize: function (prefix) {
						var serializer = new XMLSerializer();

						prefix = prefix || '';

						return prefix + serializer.serializeToString(doc);
					}
				};
			};

		/**
		 * Debug mode
		 * @type {boolean}
		 */
		this.debug = false;

		/**
		 * Initializes the xmlrpc object
		 * @param  {string}   url              url to the xml service
		 * @param  {function} successCallback  success callback function
		 * @param  {function} errorCallback    error callback function
		 * @return {object}                    this
		 */
		this.init = function (url, successCallback, errorCallback) {
			this.url = url;

			this.successCallback = successCallback;
			this.errorCallback = errorCallback;

			return this;
		};

		/**
		 * Sends a request to the xmlrpc service
		 * @param  {string}    method           xmlrpc method name
		 * @param  {array}     params           method parameters
		 * @param  {?function} successCallback  success callback function, overwrites the global
		 *                                      callback if specified
		 * @param  {?function} errorCallback    error callback function, overwrites the global
		 *                                      callback if specified
		 * @return {object}                     this
		 */
		this.fetch = function (method, params, successCallback, errorCallback) {
			successCallback = successCallback || this.successCallback;
			errorCallback = errorCallback || this.errorCallback;

			// Debug output
			if (this.debug) {
				console.log('Request XML', xmlRpcCall(method, params));
			}

			// Make ajax request to xmlrpc service
			$.ajax({
				url: this.url,
				data: xmlRpcCall(method, params),

				type: 'POST',
				dataType: 'xml',

				success: successCallback,
				error: errorCallback
			});

			return this;
		};

		// Call constructor
		this.init(url, successCallback, errorCallback);

	};

	// Initialize module if require or node is present
	// Borrowed from underscore.js source
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = xmlrpc;
		}
		exports.xmlrpc = xmlrpc;
	} else {
		window.xmlrpc = xmlrpc;
	}

})($);