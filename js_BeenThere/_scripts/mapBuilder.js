(()=>{
    
    var app = {
        MarkerCounter : -1,
        mapOptions : {disableDefaultUI: true},
        staticResults : {},
        infoContent : '',
        offLineMode : true,
        beenThere : [],
        searchOffline : '_scripts/searchResults.txt',
        myPlaceOffline : '_scripts/myPlaces.txt',
        searchFile : '_scripts/searchResults.1.txt',
        myPlaceFile : '_scripts/myPlaces.1.txt'
    };
    
    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
    }

    var getResults = fetch((app.offLineMode?app.searchOffline:app.searchFile)).then(function(response){ 
         return response.json()
    });
    var getPlaces = fetch((app.offLineMode?app.myPlaceOffline:app.myPlaceFile)).then(function(response){
        return response.json();
        
    });
    var combinedData = {"getPlaces":{},"getResults":{}};
    
    Promise.all([getResults,getPlaces])
    .then(function(values){
        combinedData["getResults"] = values[0];
        combinedData["getPlaces"]  = values[1];
        return combinedData
    })
    .then(function(data){
        app.beenThere = data.getPlaces;
        app.staticResults = data.getResults;
    })
    .then(function(data){
        app.initializeMap();
    })

    app.logError = function(error) {
        console.log('Looks like there was a problem: \n', error);
    }

    app.logResult = function(result) {
        console.log(result);
    }
    
    app.initializeMap = function() {
        //console.log(app.beenThere);
        //console.log(app.staticResults);
        //return 
        
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

    // Vanilla JS way to listen for resizing of the window
    // and adjust map bounds
    //window.addEventListener('resize', function(e) {
    //Make sure the map bounds get updated on page resize
    //  map.fitBounds(mapBounds);
    //});
})();
