(()=>{
    var app = {
        MarkerCounter : -1,
        mapOptions : {disableDefaultUI: true},
        beenThere : [{
            employer    : "Family",
            location    : "Grand Rapids, Mi",
            title       : "Kid",
            description : "Born in GR"
        },
        {
            employer    : "Family",
            location    : "Catania, Sicily",
            title       : "Kid",
            description : "Crazy time for a kid, living on the side of an active volcano"
        },
        {
            employer    : "Family",
            location    : "Pleasonton, CA",
            title       : "Kid",
            description : "Silicon Valley did not really exist yet"
        },
        {
            employer    : "Family",
            location    : "Aiea Heights, Hawaii",
            title       : "Kid",
            description : "You must love the beach and salt water if you want to live here."
        },
        {
            employer    : "Family",
            location    : "Gainsville, Florida",
            title       : "Kid",
            description : "Back to the old Swamp, Go Gators!"
        },
        {
            employer    : "Army",
            location    : "Fort Benning, Georgia",
            title       : "Kid",
            description : "Yep, 17 and active duty, go figure."
        },
        {
            employer    : "Navy",
            location    : "San Diego, CA",
            title       : "E3",
            description : "Navy Boot   :-P."
        },
        {
            employer    : "Navy",
            location    : "Yokosuka, Japan",
            title       : "E3",
            description : "Here's where the fun begins."
        }]
    };

    /*
    initializeMap() is called when page is loaded.
    */
    
    app.initializeMap = function() {
       map = new google.maps.Map(document.querySelector('#map'), app.mapOptions);
        
        // Sets the boundaries of the map based on pin locations
        window.mapBounds = new google.maps.LatLngBounds();
        app.pinPoster(app.beenThere);
    }

    app.createMapMarker = function(placeData) {
    // The next lines save location data from the search result object to local variables
        var lat = placeData.geometry.location.lat();  // latitude from the place service
        var lon = placeData.geometry.location.lng();  // longitude from the place service
        var name = placeData.formatted_address;   // name of the place from the place service
        var bounds = window.mapBounds;            // current boundaries of the map window

        // marker is an object with additional data about the pin for a single location
        var marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: name
        });

        app.MarkerCounter ++;
        var infoWindow = new google.maps.InfoWindow({
        content:name +' : '+ app.beenThere[app.MarkerCounter].description
        });

        google.maps.event.addListener(marker, 'click', ()=>{
        infoWindow.open(map, marker);
        });

        // this is where the pin actually gets added to the map
        //bounds.extend() takes in a map location object
        bounds.extend(new google.maps.LatLng(lat, lon));
        map.fitBounds(bounds);
        map.setCenter(bounds.getCenter());
    }

    app.pinPoster = function(locations) {
        var service = new google.maps.places.PlacesService(map);
        locations.forEach((place)=>{
            var request = {
                query: place.location
            };
        service.textSearch(request, (results, status)=>{
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    app.createMapMarker(results[0]);
                }
            });
        });
    }


    // Calls the initializeMap() function when the page loads
    window.addEventListener('load', app.initializeMap());

    // Vanilla JS way to listen for resizing of the window
    // and adjust map bounds
    //window.addEventListener('resize', function(e) {
    //Make sure the map bounds get updated on page resize
    //  map.fitBounds(mapBounds);
    //});
})();
