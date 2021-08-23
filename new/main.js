// let my lets be lets
const html = document.querySelector('html');
let mapCenter = { lat: 24.80746, lng: 0 }
let WHOData = [];
let coronaGlobalData;


// lat: 64.80746, lng: -40.4796
let mapCircles = [];
var casesTypeColors = {
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
let worldwideSelect = {
    name: "Worldwide",
    value: "worldwide",
    selected: true
}

// Initiate Language Drop Down
window.onload = () => {
    /*     twttr.widgets.load();
        var elems = document.querySelectorAll('.dropdown-trigger');
        var instances = M.Dropdown.init(elems); */
    initMap();
    getCountriesData();
    fetchRegions();
    getAllData();

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
            showDataOnMap(data);

        })
}


const getAllData = () => {
    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            coronaGlobalData = data
            let chartData = buildChartData(data, 'cases');
            buildChart(chartData);
        })
}




const clearTheMap = () => {
    for (let circle of mapCircles) {
        map.removeLayer(circle);
    }
}

const changeDataSelection = (casesType) => {
    /*    setSelectedTab(casesType);
        changeMapTitle(casesType);
    clearTheMap(); 
    showDataOnMap(coronaGlobalData, casesType);*/
    let chartData = buildChartData(coronaGlobalData, casesType);
    updateData(chartData, casesTypeColors[casesType].rgb, casesTypeColors[casesType].half_op);
}

// Fetch WHO Regions List - Gives a List of objects of Country ISO2 code example "us" along with WHO region
const fetchRegions = () => {
    fetch('./whoRegions.json')
        .then((response) => {
            return response.json()
        }).then((dataArr) => {
            for (const object of dataArr) {

                let regionAttribute = {};

                /*   console.log('object', object)
                  console.log('regionAttribute', regionAttribute); */

                for (const object2 of object.attr) {
                    if (object2.category === "WHO_REGION")
                        regionAttribute.region = object2.value
                    if (object2.category === "ISO2")
                        regionAttribute.iso2 = object2.value.toLowerCase();
                }

                WHOData.push(regionAttribute);
            }
        })
}
console.log(WHOData)

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
            radius: Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier
        }).addTo(map);

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

        circle.bindPopup(html);
        mapCircles.push(circle);

    })

}

