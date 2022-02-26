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
$('.ville').on('change keyup paste', function(e){
    var id  = '#' + this.id;
    $.ajax({
        url: "https://geo.api.gouv.fr/communes?nom=" + this.value + "&fields=centre&format=json&geometry=centre" ,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            if (data.length != 0) {
                $(id).attr('data-coords', data[0].centre.coordinates)
            }
            var option = "";
            for (let i = 0; i < 5; i++) {
                if (data[i]) {
                    option += "<div class='ville1' data-coords='" + data[i].centre.coordinates + "' name='" + data[i].nom + "'>" + data[i].nom + "</div>";
                    
                }
            }
            if (id == "#src") {
                document.getElementById('containerRes1').innerHTML = option;
            }
            if (id == "#arriver") {
                document.getElementById('containerRes2').innerHTML = option;                
            }
        }
    });
})

$("#containerRes1").on("click", ".ville1", function(e){
    var data = $(this).attr('data-coords');
    var nom = $(this).attr('name');
    $('#src').val(nom)
    $('#src').attr('data-coords', data)
    document.getElementById('containerRes1').innerHTML = "";
})

$("#containerRes2").on("click", ".ville1", function(e){
    var data = $(this).attr('data-coords');
    var nom = $(this).attr('name');
    $('#arriver').val(nom)
    $('#arrvier').attr('data-coords', data)
    document.getElementById('containerRes2').innerHTML = "";
})


function submit(){
    var voiture = document.getElementById("voiture-select").value;
    var depart = $('#src').attr('data-coords');    
    var arriver = $('#arriver').attr('data-coords'); 

    map(depart, arriver);
}


$('#submits').on('click', function(e){
    var voiture = document.getElementById("voiture-select").value;
    var départ = document.getElementById("src").value;
    var arriver = document.getElementById("arriver").value;

    if (!voiture) {
        console.log('err');
    }
    if (!départ) {
        console.log('err');
    }
    if (!arriver) {
        console.log('err');
    }
    if (voiture && départ && arriver) {
        var test ;
        console.log(départ);
        chercherVille(départ).then((value) => {
            test = value;
            console.log(test);
        });
        console.log('test');
        console.log(test);
    }
})



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




//MAP LEAFLET
function map(depart, arriver){

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

    var tmp = depart.split(',');
    var departS = tmp[1] + ',' + tmp[0];
    tmp = arriver.split(',');
    var arriverS = tmp[1] + ',' + tmp[0];

    console.log(departS);
    console.log(arriverS);


    dir.route({
        locations: [
            departS,
            arriverS
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



//https://geo.api.gouv.fr/communes?nom=La%20chapelle%20saint%20martin&fields=centre&format=json&geometry=centre