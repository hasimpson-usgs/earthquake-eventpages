/* global define */
define([
	'base/EventModule'
], function (
	EventModule
) {
	'use strict';
	
	var ScientificSummaryModule = function (options) {
		EventModule.call(this, options);
	};
	ScientificSummaryModule.prototype = Object.create(EventModule.prototype);

	

	return ScientificSummaryModule;
});