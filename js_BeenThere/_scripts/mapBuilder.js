(()=>{
    
    var app = {
        MarkerCounter : -1,
        mapOptions : {disableDefaultUI: true},
        staticResults : {},
        infoContent : '',
        offLineMode : true,
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
            location    : "Jacksonville, Florida",
            title       : "Kid",
            description : "Damn the south is hot and muggy"
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
            employer    : "Family",
            location    : "Wyoming, Michigan",
            title       : "Kid",
            description : "Why did we come back to the cold!!!!"
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
        },
        {
            employer    : "Navy",
            location    : "Sapporo, Japan",
            title       : "E3",
            description : "We went to the beer gardens on the northern island."
        },
        {
            employer    : "Navy",
            location    : "Hiroshima, Japan",
            title       : "E3",
            description : "Oh no you didn't. yes, yes we did."
        },
        {
            employer    : "Navy",
            location    : "Tokyo, Japan",
            title       : "E3",
            description : "Why did I get so drunk as I turned 21. - It was legal for me at 17."
        },
        {
            employer    : "Navy",
            location    : "Yokohama, Japan",
            title       : "E3",
            description : "Great little stomping ground. Clubb'n and the like.  :)"
        },
        {
            employer    : "Navy",
            location    : "Cubic Bay, Philipines",
            title       : "E3",
            description : "Whos up to split a trike or Jeepney"
        },
        {
            employer    : "Navy",
            location    : "Hong Kong, China",
            title       : "E3",
            description : "They still owe me three tailored suits!!"
        }]
    };
    
    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
    }

    app.logError = function(error) {
        console.log('Looks like there was a problem: \n', error);
    }

    app.logResult = function(result) {
        console.log(result);
    }
    function validateResponse(response) {
        // TODO 2.3
        if (!response.ok) {
        throw Error(response.statusText);
        }
        return response;
    }
    app.readResponseAsJson = function(response) {
        return response.json();
    }
    app.loadJson = function(response) {
        var data = response;
        app.staticResults = data;
    }

    app.fetchJson = function(){
        fetch('_scripts/searchResults.txt')
        .then(validateResponse)
        .then(app.readResponseAsJson)
        .then(app.loadJson)
        .then(app.initializeMap)
        .catch(app.logError);
    }

    //initializeMap() is called when page is loaded.
    app.initializeMap = function() {
       map = new google.maps.Map(document.querySelector('#map'), app.mapOptions);
        // Sets the boundaries of the map based on pin locations
        window.mapBounds = new google.maps.LatLngBounds();
        app.pinPoster(app.beenThere);
        
    }

    app.createMapMarker = function(placeData, querySent) {
        var myPosition = {};

        if(app.offLineMode){
            var lat = placeData.geometry.location.lat;  
            var lon = placeData.geometry.location.lng;  
            myPosition = {lat: parseFloat(placeData.geometry.location.lat), lng: parseFloat(placeData.geometry.location.lng)};
        }else{
            var lat = placeData.geometry.location.lat();  // latitude from the place service
            var lon = placeData.geometry.location.lng();  // longitude from the place service
            myPosition = placeData.geometry.location;
        }
        var name = placeData.formatted_address;   // name of the place from the place service
        var bounds = window.mapBounds;            // current boundaries of the map window

        // marker is an object with additional data about the pin for a single location
        var marker = new google.maps.Marker({
            map: map,
            position: myPosition,
            title: name
        });

        app.findMarkerDesc(app.beenThere, querySent.query);
        var infoWindow = new google.maps.InfoWindow({
            content:name +' : '+ app.infoContent
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
            app.MarkerCounter ++;
            if(app.offLineMode){
                //console.log(app.staticResults.result[0]);
                //app.createMapMarker(results.result[app.MarkerCounter], request);
                app.createMapMarker(app.staticResults.result[app.MarkerCounter], request);
            }
            else{
                service.textSearch(request, (results, status)=>{
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        app.createMapMarker(results[0], request);
                    }
                });
            }
        });
    }

    app.findMarkerDesc = function(locations, querySent) {
        locations.forEach((place)=>{
                if(place.location == querySent){
                    app.infoContent = place.description;
                }
            }
        );
    }

    // Calls the initializeMap() function when the page loads
    //window.addEventListener('load', app.initializeMap());
    if(app.offLineMode){
        window.addEventListener('load', app.fetchJson());
    }else{
        window.addEventListener('load', app.initializeMap());
    }

    // Vanilla JS way to listen for resizing of the window
    // and adjust map bounds
    //window.addEventListener('resize', function(e) {
    //Make sure the map bounds get updated on page resize
    //  map.fitBounds(mapBounds);
    //});
})();
