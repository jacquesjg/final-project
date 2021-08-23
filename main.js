// let my lets be lets
const html = document.querySelector('html');
console.log(html)
let mapCenter = { lat: 24.80746, lng: 0 }
let coronaGlobalData;
let coronaHistoricalData;
let WHOData = [];
let twitterEndpoint;

// lat: 64.80746, lng: -40.4796
let mapCircles = [];
let casesTypeColors = {
    cases: {
        hex: '#CC1034',
        rgb: 'rgb(204, 16, 52)',
        half_op: 'rgba(204, 16, 52, 0.5)',
        multiplier: 200
    },
    recovered: {
        hex: '#7dd71d',
        rgb: 'rgb(125, 215, 29)',
        half_op: 'rgba(125, 215, 29, 0.5)',
        multiplier: 300
    },
    deaths: {
        hex: '#fb4443',
        rgb: 'rgb(251, 68, 67)',
        half_op: 'rgba(251, 68, 67, 0.5)',
        multiplier: 500
    }
}


// Initiate Language Drop Down
window.onload = () => {
    const twitter = document.querySelector('#twitterChange');
    twitterEndpoint = document.querySelector('#twitter-endpoint');
    console.log(twitterEndpoint)

    //Hide the remaining tweettwe widgets

    changeTweets(1);
    initMap();
    getCountriesData();
    getHistoricalData();
    getWHOData();
}

var map;

// Initiate Map

function initMap() {
    map = L.map('map', {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: 2,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Disease Data API Fetch
const getCountriesData = () => {
    fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => {
            return response.json()
        }).then((data) => {
            console.log('Data: ', data);
            coronaGlobalData = data
            showDataOnMap(data);
        })
}


const getHistoricalData = () => {
    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=all")
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            console.log()
            coronaHistoricalData = data
            console.log('historical data', data)
            let chartData = buildChartData(data, 'cases');
            buildChart(chartData);
        })
}


// WHO regions
const getWHOData = () => {
    fetch('./WHORegions2.json')
        .then((response) => {
            console.log('response', response)
            return response.json()
        }).then((data) => {
            console.log('WHOData: ', data);
            for (const object of data) {
                WHOData.push(object)
            }
        })
}

console.log('GlobalWHOData', WHOData)

for (const object of WHOData) {
    console.log('Object', object)
}

const clearTheMap = () => {
    for (let circle of mapCircles) {
        map.removeLayer(circle);
    }
}

const changeDataSelection = (casesType) => {
    clearTheMap();
    showDataOnMap(coronaGlobalData, casesType);
    let chartData = buildChartData(coronaHistoricalData, casesType);
    console.log(chartData)
    updateData(chartData, casesTypeColors[casesType].rgb, casesTypeColors[casesType].half_op);
}

const changeTweets = (id) => {
    let widgetArray = [];
    widgetArray.push(document.getElementById("widget-container-1"));
    widgetArray.push(document.getElementById("widget-container-2"));
    widgetArray.push(document.getElementById("widget-container-3"));

    switch (id) {
        case 1:
            //Hide all the other widgets, apart from the first one
            widgetArray[1].classList.remove("show");
            widgetArray[2].classList.remove("show");
            widgetArray[1].classList.add("hidden");
            widgetArray[2].classList.add("hidden");
            widgetArray[0].classList.remove("hidden");
            widgetArray[0].classList.add("show");
            break;

        case 2:
            //Hide all the other widgets, apart from the second one
            widgetArray[0].classList.remove("show");
            widgetArray[2].classList.remove("show");
            widgetArray[0].classList.add("hidden");
            widgetArray[2].classList.add("hidden");
            widgetArray[1].classList.remove("hidden");
            widgetArray[1].classList.add("show");
            break;

        case 3:
            //Hide all the other widgets, apart from the third one
            widgetArray[0].classList.remove("show");
            widgetArray[1].classList.remove("show");
            widgetArray[0].classList.add("hidden");
            widgetArray[1].classList.add("hidden");
            widgetArray[2].classList.remove("hidden");
            widgetArray[2].classList.add("show");
            break;
    }
}


//WHO Regional Twitter Accounts
const WHOGlobalTwitter = 'https://twitter.com/WHO';
const WHOAfricaTwitter = 'https://twitter.com/whoafro';
const WHOAmericasTwitter = 'https://twitter.com/pahowho';
const WHOSEAsiaTwitter = 'https://twitter.com/WHOSEARO';
const WHOEuropeTwitter = 'https://twitter.com/WHO_Europe';
const WHOEastMedTwitter = 'https://twitter.com/WHOEMRO';
const WHOWestPacTwitter = 'https://twitter.com/WHOWPRO';



// Show Data on the Map
const showDataOnMap = (data, casesType = "cases") => {

    //to make make smaller circle have higher layer, need sort by cases
    let dataFixed = data.sort(function (a, b) {
        return b.cases - a.cases;
    });


    console.log(dataFixed)

    dataFixed.map((country) => {


        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long
        }

        /*  console.log(country); */

        let circle = L.circle([countryCenter.lat, countryCenter.lng], {
            color: casesTypeColors[casesType].hex,
            fillColor: casesTypeColors[casesType].hex,
            fillOpacity: 0.4,
            radius: Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier,
        }).addTo(map)






        // fixes break issue with chart (null)
        if (country.countryInfo.iso2 != null) {
            var html = `
            <div class="info-container">
                <div class="info-flag" style="background-image: url(https://lipis.github.io/flag-icon-css/flags/4x3/${country.countryInfo.iso2.toLowerCase()}.svg);">
                </div>
                <div class="info-name">
                    ${country.country}
                </div>
                <div class="info-confirmed">
                    <b>Cases:</b> ${numeral(country.cases).format('0,0')}
                </div>
                <div class="info-recovered">
                <b>Recovered:</b> ${numeral(country.recovered).format('0,0')}
                </div>
                <div class="info-deaths">   
                <b>Deaths:</b> ${numeral(country.deaths).format('0,0')}
                </div>
            </div>
        `;
        }

        circle.bindPopup(html).on("click", circleClick);
        mapCircles.push(circle);

    })

}

const circleClick = () => {
    let flag = document.querySelector('#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div')
    console.log('flag', flag)
    let str = flag.innerHTML;
    console.log('str', str)
    const chars = str.split('')
    let gotISO2 = (chars[117] + chars[118]).toUpperCase();
    console.log(gotISO2)

    let region = ''

    for (let item of WHOData) {
        let currISO = item.iso2.value;
        if (gotISO2 == currISO) {
            console.log(gotISO2);
            console.log(item.iso2.value)
            region = item.region
            if (region === "Europe") {
                console.log('Europe is my region? Yes, it\'s Europe.', region)
                changeTweets(3); //WHO Europe's tweets
            } else if (region == "Africa") {
                changeTweets(2); //WHO Afro's tweets
            } else if ((region != "Africa") || (region != "Europe")) {
                changeTweets(1); //WHO global tweets
            }


        }
    }




}

/* const WHOGlobalTwitter = 'https://twitter.com/WHO';
const WHOAfricaTwitter = 'https://twitter.com/whoafro';
const WHOAmericasTwitter = 'https://twitter.com/pahowho';
const WHOSEAsiaTwitter = 'https://twitter.com/WHOSEARO';
const WHOEuropeTwitter = 'https://twitter.com/WHO_Europe';
const WHOEastMedTwitter = 'https://twitter.com/WHOEMRO';
const WHOWestPacTwitter = 'https://twitter.com/WHOWPRO';
 */
/*
https://twitter.com/WHO_Europe */




/*
 <a id="twitter-endpoint" class="twitter-timeline col l10" data-width="340" data-height="245" href="https://twitter.com/whoafro?ref_src=twsrc%5Etfw">Tweets by WHO</a>
*/