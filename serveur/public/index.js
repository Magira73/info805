const urlRest = " http://127.0.0.1:5000/";


//SOAP
function menuvoiture(){
    document.location.href="/api-soap";
 /*$.ajax({
     type: "GET",
     url: urlRest,
     data: "data",
     dataType: "json",
     success: function (response) {
         console.log(response);
     }
 }); */
}

//MON API REST
function calculTime() {
    $.ajax({
        url: urlRest + "/helloWorld" ,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            console.log(data);
        }
    });
  }



//MAP LAEFLET

var map = L.map('map').setView([46.00, 2.00], 6);
//46.00, 2.00

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZG9tcG5pZXMiLCJhIjoiY2t6c2t4c2Z1MDNvOTJxbnc2bDZ2dmhhaiJ9.JYoFr37k2d6_Aj-hOTf37g'
}).addTo(map);

var marker = L.marker([51.5, -0.09]).addTo(map);

//----------------------------------------------

var dir = MQ.routing.directions();

dir.route({
    locations: [
        '45.764670, 5.697158',
        '45.647817, 5.760518'
    ]
});

CustomRouteLayer = MQ.Routing.RouteLayer.extend({
    createStartMarker: function (location, stopNumber) {
        var custom_icon;
        var marker;

        custom_icon = L.icon({
            iconUrl: 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-red_1.png',
            iconSize: [20, 29],
            iconAnchor: [10, 29],
            popupAnchor: [0, -29]
        });

        marker = L.marker(location.latLng, {icon: custom_icon}).addTo(map);

        return marker;
    },

    createEndMarker: function (location, stopNumber) {
        var custom_icon;
        var marker;

        custom_icon = L.icon({
            iconUrl: 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-blue_1.png',
            iconSize: [20, 29],
            iconAnchor: [10, 29],
            popupAnchor: [0, -29]
        });

        marker = L.marker(location.latLng, {icon: custom_icon}).addTo(map);

        return marker;
    }
});

map.addLayer(new CustomRouteLayer({
    directions: dir,
    fitBounds: true
}));

// belley : 45.764670, 5.697158
// mdv : 45.647817, 5.760518