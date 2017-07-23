(()=>{
    
    var app = {
        MarkerCounter : -1,
        mapOptions : {disableDefaultUI: true},
        staticResults : {},
        infoContent : '',
        offLineMode : true,
        beenThere : []
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
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }
    app.readResponseAsJson = function(response) {
        return response.json();
    }
    app.loadStaticResults = function(response) {
        var data = response;
        app.staticResults = data;
        //console.log(data);
    }

    app.loadMyplaces = function(response) {
        var data = response;
        app.beenThere = data;
        //console.log(data);
    }

    app.fetchMyPlaces = function(myData, sResults){
        fetch(myData)
        .then(app.readResponseAsJson)
        .then(app.loadMyplaces)
        
        fetch(sResults)
        .then(app.readResponseAsJson)
        .then(app.loadStaticResults)
        .then(app.initializeMap)
        .catch(app.logError);
    }

    app.initializeMap = function() {
        map = new google.maps.Map(document.querySelector('#map'), app.mapOptions);
        // Sets the boundaries of the map based on pin locations
        window.mapBounds = new google.maps.LatLngBounds();
        //console.log(app.beenThere);
        //console.log(app.staticResults);
        app.pinPoster(app.beenThere.beenThere);
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

        app.findMarkerDesc(app.beenThere.beenThere, querySent.query);
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
        window.addEventListener('load', app.fetchMyPlaces('_scripts/myPlaces.txt','_scripts/searchResults.txt'));
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
