/* Takes care of chart configurations */
let chart;

const buildChartData = (data, casesType) => {
    let chartData = [];
    let lastDataPoint;
    for (let date in data.cases) {
        if (lastDataPoint) {
            let newDataPoint = {
                x: date,
                y: data[casesType][date] - lastDataPoint
            }
            chartData.push(newDataPoint);
        }
        //casesType determines the type of case from where to ge the data points
        //date gets one value per passed date
        lastDataPoint = data[casesType][date];
    }
    return chartData;
}


const buildChart = (chartData) => {
    let yearsCount = new Date().getFullYear() - 2019;
    let labelsCount = [];
    for (var i = 0; i < yearsCount; i++) {
        labelsCount.push(2000 + (yearsCount - i));
    }

    var timeFormat = 'MM/DD/YY';
    var ctx = document.getElementById("myChart").getContext('2d'); //Getting the context on which to draw as this is a canvas see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
    chart = new Chart(ctx, {
        //Chart's type
        type: "line",

        data: {
            labels: labelsCount,
            datasets: [{
                label: "Stats since CovID started",
                backgroundColor: "rgba(204, 16, 52, 0.5)",
                fill: true,
                borderColor: "#CC1034",
                data: chartData
            }]
        },

        //these are configuration options
        options: {
            legend: {
                display: false
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            maintainAspectRatio: false,
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return numeral(tooltipItem.value).format('+0,0');
                    }
                }
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,
                        tooltipFormat: 'll'
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, values) {
                            return numeral(value).format('0a');
                        }
                    }
                }]
            }
        }
    });
}