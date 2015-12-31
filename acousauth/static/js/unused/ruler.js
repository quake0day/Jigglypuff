/*
	javascript ruler for google maps V3

	by Giulio Pons. http://www.barattalo.it
	this function uses the label class from Marc Ridley Blog

*/

var markersArray = [];
var labelsArray = [];
var polysArray=[];   
var path_info = [];
var SAMPLES = 100;
var elevations = [];
var data = null; 
function addruler() {
	if (markersArray){
		clearOverlays();
	}
	 var image = new google.maps.MarkerImage('images/sender.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(48, 46),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(20, 46));
     var image2 = new google.maps.MarkerImage('images/receiver.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(56, 46),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(20, 46));

	var ruler1 = new google.maps.Marker({
		position: map.getCenter() ,
		map: map,
		icon:image,
		draggable: true
	});
	var ruler2 = new google.maps.Marker({
		position: map.getCenter() ,
		map: map,
		icon:image2,
		draggable: true
	});


	markersArray.push(ruler1);
	markersArray.push(ruler2);
	var ruler1label = new Label({ map: map });
	var ruler2label = new Label({ map: map });
	ruler1label.bindTo('position', ruler1, 'position');
	ruler2label.bindTo('position', ruler2, 'position');
	labelsArray.push(ruler1label);
	labelsArray.push(ruler2label);
	updateMarkerPosition(ruler1.getPosition(),1);
    geocodePosition(ruler1.getPosition(),1);
    updateMarkerPosition(ruler2.getPosition(),2);
    geocodePosition(ruler2.getPosition(),2);

	var rulerpoly = new google.maps.Polyline({
		path: [ruler1.position, ruler2.position] ,
		strokeColor: "#FFFF00",
		strokeOpacity: .7,
		strokeWeight: 7
	});
	rulerpoly.setMap(map);
	polysArray.push(rulerpoly);
	

	ruler1label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
	ruler2label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
	updateElevation();
		 

  
  // Add dragging event listeners.
  google.maps.event.addListener(ruler1, 'dragstart', function() {
   // updateMarkerAddress('Dragging...',1);
  });
  
  google.maps.event.addListener(ruler2, 'dragstart', function() {
    //updateMarkerAddress('Dragging...',2);
  });
  
  google.maps.event.addListener(ruler1, 'dragend', function() {
    //updateMarkerStatus('Drag ended',1);
    updateMarkerPosition(ruler1.getPosition(),1);
    geocodePosition(ruler1.getPosition(),1);
    updateElevation();
  });
  google.maps.event.addListener(ruler2, 'dragend', function() {
    //updateMarkerStatus('Drag ended',2);
    updateMarkerPosition(ruler2.getPosition(),2);
    geocodePosition(ruler2.getPosition(),2);

    updateElevation();
    
  });
	google.maps.event.addListener(ruler1, 'drag', function() {
		    
		rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
		ruler1label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
		ruler2label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
		updateMarkerPosition(ruler1.getPosition(),1);
		

	});
	
	google.maps.event.addListener(ruler1, 'click', function() {
		
		//get_path_info(elevations);
		//alert(path_info);
		//clearOverlays();

	});
	google.maps.event.addListener(ruler2, 'drag', function() {
		rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
		ruler1label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
		ruler2label.set('text',distance( ruler1.getPosition().lat(), ruler1.getPosition().lng(), ruler2.getPosition().lat(), ruler2.getPosition().lng()));
		updateMarkerPosition(ruler2.getPosition(),2);
	});
	
	

}

function get_path_info(elevations){       
	if (path_info){
		path_info = [];
	}

    for (var i = 0; i < elevations.length; i++) { // results length must equal to SAMPLES
      path_info.push(elevations[i].location,elevations[i].elevation);
    }
    
    
}
  
  // Takes an array of ElevationResult objects, draws the path on the map
  // and plots the elevation profile on a GViz ColumnChart
  function plotElevation(results) {
	
    
    elevations = results;
         



    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    
    for (var i = 0; i < results.length; i++) {
      data.addRow(['', elevations[i].elevation]);
    }

    document.getElementById('chart_div').style.display = 'block';
    
    chart.draw(data, {
      width: 512,
      height: 200,
      legend: 'none',
      titleY: 'Elevation (m)',
      focusBorderColor: '#00ff00'
    });
  }
  
    // Trigger the elevation query for point to point
  // or submit a directions request for the path between points
  function updateElevation() {
	  
	  elevationService = new google.maps.ElevationService();
    if (markersArray.length > 1) {
      var travelMode = 'direct';
      //var travelMode = document.getElementById("mode").value;
      if (travelMode != 'direct') {
        calcRoute(travelMode);
      } else {
        var latlngs = [];
        for (var i in markersArray) {
          latlngs.push(markersArray[i].getPosition())
        }
                 
        elevationService.getElevationAlongPath({
          path: latlngs,
          samples: SAMPLES
        }, plotElevation);
   
      }
    }
  }
  
    // Submit a directions request for the path between points and an
  // elevation request for the path once returned
  function calcRoute(travelMode) {
	  elevationService = new google.maps.ElevationService();
	  directionsService = new google.maps.DirectionsService();
    var origin = markersArray[0].getPosition();
    var destination = markersArray[markersArray.length - 1].getPosition();
    
    var waypoints = [];
    for (var i = 1; i < markersArray.length - 1; i++) {
      waypoints.push({
        location: markersArray[i].getPosition(),
        stopover: true
      });
    }
    
    var request = {
      origin: origin,
      destination: destination,
      waypoints: waypoints
    };
   
    switch (travelMode) {
      case "bicycling":
        request.travelMode = google.maps.DirectionsTravelMode.BICYCLING;
        break;
      case "driving":
        request.travelMode = google.maps.DirectionsTravelMode.DRIVING;
        break;
      case "walking":
        request.travelMode = google.maps.DirectionsTravelMode.WALKING;
        break;
    }
    
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        elevationService.getElevationAlongPath({
          path: response.routes[0].overview_path,
          samples: SAMPLES
        }, plotElevation);
      } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
        alert("Could not find a route between these points");
      } else {
        alert("Directions request failed");
      }
    });
  }
  
function showMarkers(){
	
		if (markersArray.length == MAX){
			
		var randomnumber=Math.floor(Math.random()*101);  
		
		for(var i=0; i< markersArray.length-1; i++){
			postdata(markersArray[i].getPosition().toString(),markersArray[i+1].getPosition().toString(),randomnumber,path_info);
			}
	}
	}
  // Remove the green rollover marker when the mouse leaves the chart
  function clearMouseMarker() {
    if (mousemarker != null) {
      mousemarker.setMap(null);
      mousemarker = null;
    }
  }
  
function clearOverlays() {
  if (markersArray) {
    for (var i = 0; i < markersArray.length; i++ ) {
      markersArray[i].setMap(null);
    }
  }
    if (labelsArray) {
    for (var i = 0; i < labelsArray.length; i++ ) {
      labelsArray[i].setMap(null);
    }
  }
      if (polysArray) {
    for (var i = 0; i < polysArray.length; i++ ) {
      polysArray[i].setMap(null);
    }
  }
  markersArray=[];
  labelsArray=[];
  polysArray=[];
  
}
function geocodePosition(pos,id) {
	var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    latLng: pos
  }, function(responses) {
    if (responses && responses.length > 0) {
      updateMarkerAddress(responses[0].formatted_address,id);
    } else {
      updateMarkerAddress('Cannot determine address at this location.',id);
    }
  });
}
function getLatLng(lat1,lon1,lat2,lon2){
	//clearOverlays();
}


function distance(lat1,lon1,lat2,lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180; 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
		Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	if (d>1) return Math.round(d)+"km";
	else if (d<=1) return Math.round(d*1000)+"m";
	return d;
}
