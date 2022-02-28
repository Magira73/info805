const urlRest= " https://apirest805.herokuapp.com/";
const voitureL = [["Renault Zoe", 395, 3], ["Tesla Model 3", 602, 1.5], ["Volkswagen ID. 3", 425, 1.33], ["Porsche Taycan", 463, 1]];

//["Renault Zoe", 395, 3], ["Tesla Model 3", 602, 1.5], ["Volkswagen ID. 3", 425, 1.33], ["Porsche Taycan", 463, 1] 

//FONCTION APPELER AU CHARGEMENT DE LA PAGE
async function init(){

    //CREATION DE LA LISTE DE VOITURE 
    var option = "<option value=''>choisissez votre voiture</option>";

    //await menuvoiture();

    for (let i = 0; i < voitureL.length; i++) {
        option += "<option value='" + i + "'>" + voitureL[i][0] + "</option>";
    }
    document.getElementById('voiture-select').innerHTML = option;

    
}


//FONCTIONs POUR RECUPERER LES VALEURS ET CREER LA MAP
$('.ville').on('change keyup paste', function(e){
    var id  = '#' + this.id;
    $.ajax({
        url: "https://geo.api.gouv.fr/communes?nom=" + this.value + "&fields=centre&format=json&geometry=centre" ,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            if (data.length != 0) {
                $(id).attr('data-coords', data[0].centre.coordinates);
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
    $('#src').val(nom);
    $('#src').attr('data-coords', data);
    document.getElementById('containerRes1').innerHTML = "";
})

$("#containerRes2").on("click", ".ville1", function(e){
    var data = $(this).attr('data-coords');
    var nom = $(this).attr('name');
    $('#arriver').val(nom);
    $('#arrvier').attr('data-coords', data);
    document.getElementById('containerRes2').innerHTML = "";
})

//CREATION MAP
function submit(){
    var voiture = document.getElementById("voiture-select").value;
    var depart = $('#src').attr('data-coords');    
    var arriver = $('#arriver').attr('data-coords');

    if (!voiture) {
        console.log('err');
    }
    if (!depart) {
        console.log('err');
    }
    if (!arriver) {
        console.log('err');
    }
    if (voiture && depart && arriver) {
        var distance50 = voitureL[voiture][1] - 50;

        var tmp = depart.split(',');
        var departA = [parseFloat(tmp[1]),parseFloat(tmp[0])];

        tmp = arriver.split(',');
        var arriverA = [parseFloat(tmp[1]),parseFloat(tmp[0])];

        var res = [];
        var i = 0;
        var pointTmp = departA;
        while (turf.distance(pointTmp, arriverA) > distance50) {
            var line = turf.lineString([pointTmp, arriverA]);
            var along = turf.along(line, distance50);

            alongTmp = [along['geometry']['coordinates'][0], along['geometry']['coordinates'][1]];
            
            res[i] = alongTmp;
            pointTmp = alongTmp;
            i++;
        }
       

        borne(depart, arriver, res);

        var distance = turf.distance(departA, arriverA);
        calculTime(distance, 1, voitureL[voiture]);

        //var pi = pointInter['geometry']['coordinates'][1].toString() + ',' + pointInter['geometry']['coordinates'][0].toString();
    }

}



//SOAP RECUPERER LA LISTE DES VOITURE
function menuvoiture(){
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/api-soap",
            dataType: "json",
            success: function (response) {
                var tmp = response['list_voituresResult']['string'];
                for (let i = 0, j = 0; i < tmp.length; i += 3, j++) {
                    var voiture = [tmp[i], parseInt(tmp[i+1]), parseFloat(tmp[i+2])];
                    voitureL[j] = voiture;
                }
                resolve('ok')
            },
            error: function (error) {
                reject(error)
              }
        });
    });
}



//MON API REST POUR FAIRE LES CALCUL DE TRAJET
function calculTime(distance, nbArret, voiture) {
    $.ajax({
        type: "GET",
        url: urlRest + "calculTime/"+ distance +"/"+ nbArret +"/" + voiture[2],
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            var time = convertNumToTime(data['time']);

            document.getElementById('info').innerHTML = "<div id='time'>Le trajet prendra environ "+ time +"</div>";
        }
    });
  }


function convertNumToTime(number) {

    var hour = Math.floor(number);
    var decpart = number - hour;

    var min = 1 / 60;
    decpart = min * Math.round(decpart / min);

    var minute = Math.floor(decpart * 60) + '';

    if (minute.length < 2) {
    minute = '0' + minute; 
    }

    time = hour + 'h' + minute;

    return time;
}


//CREATION DE L'ITINERAIRE
function direction(depart, arriver, pointInter){

    let request = new XMLHttpRequest();

    request.open('POST', "https://api.openrouteservice.org/v2/directions/driving-car/geojson");

    request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', '5b3ce3597851110001cf62482cdcf7217e5e40d7bffcbb957450014b');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            map(depart, arriver, pointInter, this.response);
        }
    };

    var res = "";
    for (let i = 0; i < pointInter.length; i++) {
        res += "[" + pointInter[i]['xlongitude'].toString() + ',' + pointInter[i]['ylatitude'].toString() + "],";
    }
    
    const body = '{"coordinates":[['+depart+'],' + res + '['+arriver+']]}';

    request.send(body);

}



//MAP LEAFLET
function map(depart, arriver, pointInter, data){

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

    

    
    var json = JSON.parse(data);
    var test = json['features'][0];

    var pathLayer = L.geoJson(test).addTo(map);
    map.fitBounds(pathLayer.getBounds());

    var custom_icon;

    var tmp = depart.split(',');
    var departI = [parseFloat(tmp[1]),parseFloat(tmp[0])];
    custom_icon = L.icon({
        iconUrl: 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-red_1.png',
        iconSize: [20, 29],
        iconAnchor: [10, 29],
        popupAnchor: [0, -29]
    });
    var marker = L.marker(departI, {icon: custom_icon}).addTo(map);

    tmp = arriver.split(',');
    var arriverI = [parseFloat(tmp[1]),parseFloat(tmp[0])];
    custom_icon = L.icon({
        iconUrl: 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-blue_1.png',
        iconSize: [20, 29],
        iconAnchor: [10, 29],
        popupAnchor: [0, -29]
    });
    marker = L.marker(arriverI, {icon: custom_icon}).addTo(map);


    for (let i = 0; i < pointInter.length; i++) {
        var pointInterI = [pointInter[i]['ylatitude'],pointInter[i]['xlongitude']];
        custom_icon = L.icon({
            iconUrl: 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-yellow_1.png',
            iconSize: [20, 29],
            iconAnchor: [10, 29],
            popupAnchor: [0, -29]
        });
        var marker = L.marker(pointInterI, {icon: custom_icon}).addTo(map);
        
    }
   
}


//API DES BORNES ELEC
async function borne(depart, arriver, tabPoint){
    var res = [];
    for (let i = 0; i < tabPoint.length; i++) {
        var point = tabPoint[i];
        var pointS = point[0].toString() + "%2C" + point[1].toString();
        try {
            res[i] = await appel(pointS);
        } catch (error) {
            console.log(error);
        }
    }
    direction(depart, arriver, res);
}

function appel(pointS){
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&rows=1&geofilter.distance=" + pointS + "%2C50000",
            headers: {
                Authorization: "Apikey b067d164e5768a48db2ede7fba532006a9b5828ab509e5af670c85b5",
                Accept: "application/json, charset=utf-8"
            },
            dataType: "json",
            success: function (data) {
                resolve(data['records']['0']['fields'])
              },
              error: function (error) {
                reject(error)
              },
            })
          })
}
//https://opendata.reseaux-energies.fr/explore/dataset/bornes-irve/api/?apikey=b067d164e5768a48db2ede7fba532006a9b5828ab509e5af670c85b5&disjunctive.region&geofilter.distance=48.8520930694,2.34738897685,1000