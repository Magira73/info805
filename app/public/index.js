const urlRest = " http://127.0.0.1:5000/";
const voitureL = [["Renault Zoe", 395, 3], ["Tesla Model 3", 602, 1.5], ["Volkswagen ID. 3", 425, 1.33], ["Porsche Taycan", 463, 1] ]


//FONCTION APPELER AU CHARGEMENT DE LA PAGE
function init(){

    //CREATION DE LA LISTE DE VOITURE 
    var option = "<option value=''>choisissez votre voiture</option>";

    for (let i = 0; i < voitureL.length; i++) {
        var v = voitureL[i][0].split(' ');
        option += "<option value='" + v[0] + "'>" + voitureL[i][0] + "</option>";
    }
    document.getElementById('voiture-select').innerHTML = option;
}



//FONCTION POUR RECUPERER LES VALEURS ET CREER LA MAP
async function submit(){
    var voiture = document.getElementById("voiture-select").value;
    var départ = document.getElementById("src").value;    
    var arriver = document.getElementById("arriver").value;
    
    var test ;
    await chercherVille(départ).then((value) => {
        test = value;
        console.log(test);
      });
    console.log(test.centre.coordinates[0]);

    map(test.centre.coordinates)
}



//SOAP
function menuvoiture(){
 /*$.ajax({
     type: "GET",
     url: url,
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
        type: "GET",
        url: urlRest + "/helloWorld" ,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            console.log(data);
        }
    });
  }




//MAP LAEFLET
function map(depart){

    //CREATION DE LA MAP (CENTRER FRANCE)
    var map = L.map('map').setView([46.00, 2.00], 6);
    //46.00, 2.00 (france)

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZG9tcG5pZXMiLCJhIjoiY2t6c2t4c2Z1MDNvOTJxbnc2bDZ2dmhhaiJ9.JYoFr37k2d6_Aj-hOTf37g'
    }).addTo(map);

    //var marker = L.marker([51.5, -0.09]).addTo(map);

    //CREATION DE L'ITINERAIRE
    var dir = MQ.routing.directions();

    var departS = depart[0].toString() + ', ' + depart[1].toString();

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
}


//API VILLE 
function chercherVille(ville) {
    var res;
    $.ajax({
        url: "https://geo.api.gouv.fr/communes?nom=" + ville + "&fields=centre&format=json&geometry=centre" ,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            res = data[0];
        }
    });
    return res;
  }

//https://geo.api.gouv.fr/communes?nom=La%20chapelle%20saint%20martin&fields=centre&format=json&geometry=centre