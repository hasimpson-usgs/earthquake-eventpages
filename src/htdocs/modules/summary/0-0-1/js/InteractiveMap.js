/* global define */
define([
	'leaflet',

	'map/MouseOverLayer',

	'util/Util',
	'util/Xhr'
], function (
	L,

	MouseOverLayer,

	Util,
	Xhr
) {
	'use strict';

	var DEFAULTS = {

	};

	var InteractiveMap = function (options) {
		options = Util.extend({}, DEFAULTS, options || {});

		this._wrapper = document.createElement('div');
		this._el = document.createElement('div');
		this._citiesEl = options.cities || document.createElement('div');
		this._event = options.eventDetails || null;

		this._wrapper.appendChild(this._el);

		this._initialize();
	};

	InteractiveMap.prototype.show = function (container) {
		var lat, latmin, latmax,
		    lng, lngmin, lngmax;

		container = container || document.body;

		if (container) {
			container.appendChild(this._wrapper);
			this._map.invalidateSize();

			if (this._event) {
				// Show a 10deg map centered on earthquake epicenter)
				lat = this._event.geometry.coordinates[1];
				lng = this._event.geometry.coordinates[0];

				latmin = Math.max(lat - 10.0, -90.0);
				latmax = Math.min(lat + 10.0, 90.0);

				lngmin = lng - 10.0;
				lngmax = lng + 10.0;

				this._map.fitBounds([[latmax, lngmin], [latmin, lngmax]]);
			}
		}
	};

	InteractiveMap.prototype._initialize = function () {
		var _this = this,
		    layerControl = null,
		    baseLayer = null,
		    platesLayer = null,
		    faultsLayer = null,
		    latitude = null,
		    longitude = null;

		Util.addClass(this._wrapper, 'summary-interactive-map-wrapper');
		Util.addClass(this._el, 'summary-interactive-map');
		this._el.innerHTML = '';

		this._map = new L.Map(this._el, {
			center: [0.0, 0.0],
			zoom: 2,
			zoomAnimation: false,
			attributionControl: false
		});

		layerControl = new L.Control.Layers();

		// Basic greyscale map
		baseLayer = new L.TileLayer(
				'http://earthquake.usgs.gov/basemap/tiles/grayscale/{z}/{y}/{x}.jpg');
		this._map.addLayer(baseLayer);
		layerControl.addBaseLayer(baseLayer, 'Grey Scale');

		// Plates
		platesLayer = new L.TileLayer(
				'http://earthquake.usgs.gov/basemap/tiles/plates/{z}/{x}/{y}.png');
		this._map.addLayer(platesLayer);
		layerControl.addOverlay(platesLayer, 'Tectonic Plates');

		if (this._event) {
			// Do some event-specific stuff if the event is defined
			latitude = this._event.geometry.coordinates[1];
			longitude = this._event.geometry.coordinates[0];

			if (latitude >= 24.6 && latitude <= 50.0 && longitude >= -125.0 && longitude <= -65.0) {
				// Add faults layer, this is a US event
				faultsLayer = new L.MouseOverLayer({
					tileUrl: 'http://earthquake.usgs.gov/basemap/tiles/faults/{z}/{x}/{y}.png',
					dataUrl: 'http://earthquake.usgs.gov/basemap/tiles/faults/{z}/{x}/{y}.grid.json?callback={cb}',
					tiptext: '{NAME}'
				});
				this._map.addLayer(faultsLayer);
				layerControl.addOverlay(faultsLayer, 'U.S. Faults');
			}

			// Place a marker at the earthquake location
			this._map.addLayer(new L.Marker([latitude, longitude], {
				icon: new L.Icon({iconUrl: 'images/star.png'}),
				iconSize: [32, 32],
				iconAnchor: [16, 16]
			}));

			if (this._event.properties.products.geoserve) {
				Xhr.ajax({
					url: this._event.properties.products.geoserve[0].contents['geoserve.json'].url,
					success: function (data) {
						var cities = data.cities,
						    numCities = cities.length,
						    i = null,
						    city = null,
						    cityMarker = null,
						    cityDom = null;

						for (i = 0; i < numCities; i++) {
							city = cities[i];
							cityMarker = new L.CircleMarker([city.latitude, city.longitude], {
								stroke: true,
								color: '#333',
								weight: 1,
								opacity: 1.0,
								fill: true,
								fillColor: '#eee',
								fillOpacity: 1.0,
								radius: 5
							});

							cityDom = _this._citiesEl.querySelector(
									'li:nth-child(' + (i+1) + ') ' );
							cityMarker.bindPopup(city.name);
							_this._bindCityEvents(cityMarker, cityDom);
							_this._map.addLayer(cityMarker);
						}
					}
				});
			}
		}

		this._map.addControl(layerControl);
	};

	InteractiveMap.prototype._bindCityEvents = function (marker, element) {

		var citiesEl = this._citiesEl,
		    updateSelected;

		updateSelected = function updateSelected () {
			var elements = citiesEl.querySelectorAll('.selected'),
			    numElements = elements.length,
			    i = null;

			for (i = 0; i < numElements; i++) {
				Util.removeClass(elements.item(i), 'selected');
			}

			Util.addClass(element, 'selected');
		};

		if (element) {
			Util.addEvent(element, 'click', function () {
				updateSelected();
				marker.openPopup();
			});
			marker.on('click', updateSelected);
		}
	};

	return InteractiveMap;
});
