
// Locations array
var locations = [
        { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393} },
        { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465} },
        { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759} },
        { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377} },
        { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934} },
        { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237} },
        { title: 'Parsons School of Design', location: { lat: 37.079440, lng: -82.762060} }
    ];

// Global variables
var map;
var markers = [];
var largeInfowindow;
var bounds;
var highlightedIcon;
var defaultIcon;

// Create style array to use as a theme for the map.
var styles = [
        {
            featureType: 'water',
            stylers: [
            { color: '#19a0d8' }
        ]
        }, {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
            { color: '#ffffff' },
            { weight: 6 }
        ]
        }, {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
            { color: '#e85113' }
        ]
        }, {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
            { color: '#efe9e4' },
            { lightness: -40 }
        ]
        }, {
            featureType: 'transit.station',
            stylers: [
            { weight: 9 },
            { hue: '#e85113' }
        ]
        }, {
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
            { visibility: 'off' }
        ]
        }, {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
            { lightness: 100 }
        ]
        }, {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
            { lightness: -100 }
        ]
        }, {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
            { visibility: 'on' },
            { color: '#f0e4d3' }
        ]
        }, {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
            { color: '#efe9e4' },
            { lightness: -25 }
        ]
        }
    ];

// Initialize the map
function initMap() {
    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 12,
        styles: styles,
        mapTypeControl: false
    });


    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // Map customization
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
                'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
                '|40|_|%E2%80%A2',
                new google.maps.Size(91, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34),
                new google.maps.Size(31, 41));
        return markerImage;
    }
    highlightedIcon = makeMarkerIcon('FFFF24');
    defaultIcon = makeMarkerIcon('0091ff');
}

// knockout observable variables for locations
var locationPoint = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}


// knockout ModelView

var ViewModel = function () {
    var self = this;

    self.searchQuery = ko.observable();
    this.locationList = ko.observableArray([]);
    this.locationInformation = ko.observable();


    self.addFilter = function () {
        self.hideListings();
        self.locationList.removeAll();

        // Populate the locations array inside the knockout locations array
        locations.forEach(function (location) {
            
            if (location.title.toLowerCase().indexOf(self.searchQuery()) >= 0 || !self.searchQuery()) {
                var markerLocation = location.location;
                var markerTitle = location.title;
                var marker = new google.maps.Marker({
                    position: markerLocation,
                    title: markerTitle,
                    animation: google.maps.Animation.DROP,
                    map: map
                })
                self.locationList.push(marker);
                marker.setIcon(defaultIcon);

                // Assign even listeners for each marker
                marker.addListener('click', function () {
                    self.populateInfoWindow(this, largeInfowindow);
                });

                marker.addListener('mouseover', function () {
                    this.setIcon(highlightedIcon);
                });
                marker.addListener('mouseout', function () {
                    this.setIcon(defaultIcon);
                });
            }

        })
    }


    // This function will loop through the markers array and display them all.
    self.showListings = function () {

        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].setMap(map);
            bounds.extend(self.locationList()[i].position);
        }
        map.fitBounds(bounds);
    }


    // To hide all visible markers
    self.hideListings = function () {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].setMap(null);
        }

    }

    // To bounce the selected marker
    bounceMarker = function (marker) {
        self.resetAnimation();
        marker.setAnimation(google.maps.Animation.BOUNCE);
        self.populateInfoWindow(this, largeInfowindow);

    }

    // To reset all markers animation
    self.resetAnimation = function () {
        // to reset all markers animation
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].setAnimation(null);
        }
    }


    // Populate markers info window
    // Using 3rd party API ('www.mapquestapi.com')
    self.populateInfoWindow = function (marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            var positionLocation;
            positionLocation = marker.position;
            var locationLat = positionLocation.lat();
            var locationLng = positionLocation.lng();

            var infoWindowContent;
            infoWindowContent = '<div><strong>' + marker.title + '</strong></div><div>' + marker.position + '</div>';


            // run ajax to get more information about the location
            var url = 'http://www.mapquestapi.com/geocoding/v1/reverse?key=uMQJPEA0UdVi6SAAHas6CtCkLvNUfQrI&location='
                                + locationLat + ',' + locationLng + '&includeRoadMetadata=true&includeNearestIntersection=true';
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                success: function (data) {
                    var street = data["results"][0]["locations"][0]["street"];
                    var city = data["results"][0]["locations"][0]["adminArea5"];
                    var state = data["results"][0]["locations"][0]["adminArea3"];
                    var country = data["results"][0]["locations"][0]["adminArea1"];

                    infoWindowContent += '<br><br><div><strong>Street: </strong>' + street + '</div>';
                    infoWindowContent += '<div><strong>City: </strong>' + city + '</div>';
                    infoWindowContent += '<div><strong>State: </strong>' + state + '</div>';
                    infoWindowContent += '<div><strong>Country: </strong>' + country + '</div>';
                    infowindow.setContent(infoWindowContent);
                },
                error: function (error) {
                    console.log(error);

                    // On error friendly message appears
                    infoWindowContent += "<div>Couldn't retreive information!</div>";
                    infowindow.setContent(infoWindowContent);
                }

            });


            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    }

}





$(document).ready(function () {
    // For pressing hamburger button
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });


    ko.applyBindings(new ViewModel());
    // Get the locations when dom is loaded
    $('form').submit();
});
