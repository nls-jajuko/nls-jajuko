window.addEventListener('load', function() {

    mapboxgl.accessToken = 'pk.eyJ1IjoiamFuc2t1IiwiYSI6ImNqMzJvNXRibzAwMDcyeG9jaHhwMnc2d2YifQ.mN0O1o-WgG6wvb9B06ChXw';

    var data = {
            kiinteistotunnus: '?'
        },
        featureData = {
            features: []
        },

        formData = {
            kiinteistotunnus: '',
            nimi: '',
            __buildings: true,
            buildinds_filter: undefined,
            buildings_filters: {
                residential: ["in", "kind_num", 42210, 42211, 42212],
                public: ["in", "kind_num", 42220, 42221, 42222],
                cottage: ["in", "kind_num", 42230, 42231, 42232],
                industrial: ["in", "kind_num", 42240, 42241, 42242],
                churches: ["in", "kind_num", 42250, 42251, 42252, 42270]
            },
            boundaries: true,
            boundaryMarkers: true,

        };

    fetch('map.json').
    then(function(response) {
        return response.json();
    }).then(map).then(ui)



    function map(mapStyle) {

        var map = new mapboxgl.Map({
            container: 'map',
            style: mapStyle,
            zoom: 15,
            pitch: 40,
            bearing: 20,
            center: [24.9108593, 60.1630516]
        });

        map.addControl(new mapboxgl.NavigationControl());

        map.on('mousemove', function(e) {
            var features = map.queryRenderedFeatures(e.point);
            featureData.features = features;
        });

        return map;
    }

    function ui(map) {
        new Vue({
            el: '#features',
            data: featureData
        });


        new Vue({
            el: '#form',
            data: formData,
            computed: {
                buildings_filter: {
                    // setter
                    set: function(newValue) {
                        var clickedLayer = 'buildings',
                            filterValue = newValue ? this.buildings_filters[newValue] : undefined;
                        console.log("SETTING FILTER", map, clickedLayer, newValue, filterValue)
                        map.setFilter(clickedLayer, filterValue);
                    },
                    get: function() {

                    }
                },
                buildings: {
                    get: function() {
                        return this.__buildings;
                    },
                    set: function(newValue) {
                        this.__buildings = newValue;
                        var clickedLayer = 'buildings';
                        if (newValue) {
                            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                        } else {
                            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                        }
                    }
                },
                buildings_residential: {
                    get: function() {
                        return this.buildings && this.buildings_filter === 'residential';
                    }
                },
                buildings_public: {
                    get: function() {
                        return this.buildings && this.buildings_filter === 'public';
                    }
                },
                buildings_cottage: {
                    get: function() {
                        return this.buildings && this.buildings_filter === 'cottage';
                    }
                },
                buildings_industrial: {
                    get: function() {
                        return this.buildings && this.buildings_filter === 'industrial';
                    }
                },
                buildings_churches: {
                    get: function() {
                        return this.buildings && this.buildings_filter === 'churches';
                    }
                }
            },
            methods: {
                info: function() {

                },
                toggle_boundaries: function() {
                    var b = !this.boundaries;
                    this.boundaries = b;
                    var clickedLayer = 'boundaries';
                    map.setLayoutProperty(clickedLayer, 'visibility', b ? 'visible' : 'none');
                },
                show_buildings: function() {
                    this.buildings_filter = undefined;
                    this.buildings = true;
                },
                hide_buildings: function() {
                    this.buildings = false;
                },
                toggle_buildings: function(rel) {
                    this.buildings_filter = rel;
                    this.buildings = true;
                },
                toggle_boundaryMarkers: function() {
                    var b = !this.boundaryMarkers;
                    this.boundaryMarkers = b;
                    var clickedLayer = 'boundary_markers';
                    map.setLayoutProperty(clickedLayer, 'visibility', b ? 'visible' : 'none');
                }
            }
        });
    }
});
