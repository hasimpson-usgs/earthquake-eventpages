/* global define */
define([
	'base/EventModulePage',
	'util/Xhr'
], function (
	EventModulePage
) {
	'use strict';
	
	var ScientificSummaryPage = function (options) {
		EventModulePage.call(this, options);
	};

	ScientificSummaryPage.prototype = Object.create(EventModulePage.prototype);

	ScientificSummaryPage.prototype._setContentMarkup = function () {
		var markup = [],
		    generalHeader;

		// DEBUG
		console.log(this._event);

		markup.push(this._getPreferredLocation());

		this._content.innerHTML = markup.join('');

		// Store references to containing elements for faster access
		generalHeader = this._content.querySelector('.summary-general-header');

	};

		ScientificSummaryPage.prototype._getPreferredLocation = function () {
		var origin = this._collectionFromEventFeed()[0];
		//var latitude = this._event.geometry.coordinates[1],
		//    longitude = this._event.geometry.coordinates[0]; 

		summaryPrefferedLocation.push('<div class="summary-preffered-location">');

		return '<div class="summary-preffered-location">' +
				'<dl class="tabular">' +
				'<dt>Parameter</dt>' +
				'<dd>Value</dd>' +
				'<dt>Magnitude</dt>' +
				'<dd> ' + origin.product.eventmagnitude + ' <dd>' +
				'<dt>Location</dt>' +
				'<dd> ' + origin.product.eventlatitude + '&deg' + 'N' +
				origin.product.eventlongitude + '&deg' +'E' + '<dd>' +
				'<dt>Depth</dt>' +
				'<dd> ' + origin.product.properties.depth + ' <dd>' +
				'<dt>Origin Time (UTC)</dt>' +
				'<dd> ' + origin.product.eventtime + ' <dd>' +
				'<dt>Number of Stations Used</dt>' +
				'<dd> ' + origin.product.properties['num-phases-used'] + ' <dd>' +
				'<dt>Number of Phases Used</dt>' +
				'<dd> ' + origin.product.properties['num-phases-used'] + ' <dd>' +
				'<dt>Minimum Distance</dt>' +
				'<dd> ' + origin.product.properties['minimum-distance'] + ' <dd>' +
				'<dt>Travel Time Risidual</dt>' +
				'<dd> ' + origin.product.eventmagnitude + ' <dd>' +
				'<dt>Azimuthal Gap</dt>' +
				'<dd> ' + origin.product.properties['azimuthal-gap'] + ' <dd>' +
				'<dt>Review Status</dt>' +
				'<dd> ' + origin.product.status + ' <dd>' +
				'<dt>Event ID</dt>' +
				'<dd> ' + origin.product.code + ' <dd>' +
				'<dt>Data Source</dt>' +
				'<dd> ' + origin.product.source + ' <dd>' +
				'<dt>Magnitude Source</dt>' +
				'<dd> ' + origin.product.properties['magnitude-source'] + ' <dd>' +
				'</dl>' +
				'</div>';
	};

	ScientificSummaryPage.prototype._collectionFromEventFeed = function () {
		var models = [];
		var origins = this._event.properties.products.origin || [];
		var phases = this._event.properties.products['phase-data'] || [];

		// find a phase product from the same source as origin
		// with an equal or greater update time
		var _getPhaseProduct = function(origin) {
			for (var p=0, len=phases.length; p<len; p++) {
				var phase = phases[p];
				if (
						origin.source.toLowerCase() === phase.source.toLowerCase() &&
						origin.code.toLowerCase() === phase.code.toLowerCase() &&
						origin.updateTime <= phase.updateTime
				) {
					return phase;
				}
			}
			return null;
		};

		// find origin/phase-data products available in feed
		for (var i=0, len=origins.length; i<len; i++) {
			var product = origins[i];
			var phase = _getPhaseProduct(product);
			if (phase !== null) {
				product = phase;
			}
			models.push(new Object({
				'id': product.id,
				'product': product
			}));
		}

		return models;
	};

return ScientificSummaryPage;
});
