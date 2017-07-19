

BTDT = {
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
    }]
};

/*
initializeMap() is called when page is loaded.
*/
function initializeMap() {
  var locations;
  var MarkerCounter=-1;
  var prevWindow;
  var mapOptions = {
    disableDefaultUI: true
  };
  
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);
  
  function createMapMarker(placeData) {
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

    MarkerCounter ++;
    var infoWindow = new google.maps.InfoWindow({
      content:name +' : '+ BTDT.beenThere[MarkerCounter].description
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

  function pinPoster(locations) {
    var service = new google.maps.places.PlacesService(map);
    locations.forEach(function(place){
        var request = {
        query: place.location
      };
      service.textSearch(request, (results, status)=>{
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                createMapMarker(results[0]);
            }
        });
    });
  }
 
    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();
    pinPoster(BTDT.beenThere);
}

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
//window.addEventListener('resize', function(e) {
//Make sure the map bounds get updated on page resize
//  map.fitBounds(mapBounds);
//});
