let trades = [];
let coinWiseTrades = [];
let sortTrades = [];
let latestTrades = [];
let tradedCoins = [];
let nameToTradeMap = [];
let symbolVsDetailsMap = [];

let costVsTotal = [];
let costVsTotalColor = [];

let plBarChartData = [];

let color = "#6a87a0";
let lossColor = "#ff0925";
let totalCoins = 0;
  
if(localStorage.trades){
    trades = JSON.parse(localStorage.trades);
}

if(localStorage.coinWiseTrades){
    coinWiseTrades = JSON.parse(localStorage.coinWiseTrades);
}

for(let i = 0; i < trades.length; i++){
    let tradeDets = JSON.parse(trades[i]);
    if(!sortTrades[tradeDets.symbol]){
        sortTrades[tradeDets.symbol] = [];
    }

    sortTrades[tradeDets.symbol].push(tradeDets);
    symbolVsDetailsMap[tradeDets.symbol] = tradeDets["name"].toLowerCase();
}

for(let i in sortTrades){
    sortTrades[i].sort(customSort);
}

for(let i in coinWiseTrades){
    latestTrades[i] = JSON.parse(coinWiseTrades[i]);
    nameToTradeMap[latestTrades[i]["name"].toLowerCase()] = latestTrades[i];
    tradedCoins.push(latestTrades[i]["name"].toLowerCase());
    costVsTotal.push(latestTrades[i]["cost"]);
    plBarChartData.push(0);
    totalCoins++;
}
  
let tempTotal = 100 / totalCoins;
let tempVar = 0;

for(let i in latestTrades){
    costVsTotalColor.push(
        shadeColor(color, (tempVar - tempTotal))
    );
    tempVar += tempTotal
}

if(costVsTotalColor.length == 1){
    costVsTotalColor[0] = color;
}

/**
 * COIN => 
 *     [0] => {
 *       "labels" => [13th June, 14th June, 15th June....],
 *       "data" => [12, 41, 2, ...],
 *       "startingTradeDate" => "13th June, 2022"
 *     },
 *     [1] => {
 *       "labels" => [16th June, 17th June, 18th June....],
 *       "data" => [12, 41, 2, ...],
 *       "startingTradeDate" => "16th June, 2022"
 *     }
 * 
 * 
 * 
 */
var tempChartData = [];
let entireLabels = [];

console.log(sortTrades);

for(let i in sortTrades){
    /** 
     * 2 trades
     * 1 trade > 13th June
     * 2nd > 21st June
     * 
     * so from 13th to 21 > one dataset
     * 21 > current (Today minus 1) one dataset.
     * 
     * Calculation
     * Get data of coin from 13th to 21
     * If date does not exist, continue to next day untill price is found
     * that days (market price * qty subtracted by the cost) is the calculation
     * 
     * [13th June, 14th June, 15th June....]
     * [12, 41, 2, ...]
     * 
     * If two trade are on the same day
     * Add the quantity and take weighted
     * average of the unit cost.
     * 
     * ****************/

    if(!tempChartData[i]){
        tempChartData[i] = [];
    }

    let tempPriceTimeBased = [];
    let priceVsDate = [];

    $.ajax({
        type: "GET",
        async: false,
        url: `https://api.coincap.io/v2/assets/${symbolVsDetailsMap[i]}/history?interval=d1`,
        success: function(data){
            tempPriceTimeBased = data["data"];
            
            for(let k in tempPriceTimeBased){
                priceVsDate[formatDate(tempPriceTimeBased[k]["date"]).toString()] = parseFloat(tempPriceTimeBased[k]["priceUsd"]);
            }

            let existingVolume = 0;
            let existingCost = 0;

            let avgPrice = 0;

            let values = [];

            for(let j in sortTrades[i]){
                let tempTradeDs = sortTrades[i][j];
                let date = new Date(tempTradeDs.tradeDate);
                let tempVolume = parseFloat(tempTradeDs.volume);
                let tempCost = parseFloat(tempTradeDs.cost);

                if(tempTradeDs.type == "buy"){
                    tempVolume += existingVolume;
                    tempCost += existingCost;

                    avgPrice = tempCost / tempVolume;
                } else if(tempTradeDs.type == "sell"){
                    tempVolume = existingVolume - tempVolume;
                    tempCost = avgPrice * tempVolume;
                }

                let currentDate = new Date();
                let nextTradeDate = new Date();

                if(currentDate <= date){
                    continue;
                }

                if(sortTrades[i][parseInt(j)+1]){
                    nextTradeDate = new Date(sortTrades[i][parseInt(j)+1].tradeDate);
                }

                let labels = getDatesInRange(date, nextTradeDate);

                if(j == 0){
                    entireLabels[i] = getDatesInRange(date, currentDate);

                    for(let tempDate in entireLabels[i]){
                        if(!priceVsDate[entireLabels[i][tempDate]]){
                            var index = entireLabels[i].indexOf(entireLabels[i][tempDate]);
                            if (index !== -1) {
                                entireLabels[i].splice(index, 1);
                            }
                        }
                    }
                
                    for(let j in entireLabels[i]){
                        entireLabels[i][j] = entireLabels[i][j].split('-')[2] + " " + convertMonthToWord(entireLabels[i][j], 1, '-') + " " + entireLabels[i][j].split('-')[0];
                    }
                }

                if(labels.length == 0){
                    if(tempTradeDs.type == "buy"){
                        existingVolume += parseFloat(tempTradeDs.volume);
                        existingCost += parseFloat(tempTradeDs.cost);
                    } else if(tempTradeDs.type == "sell"){
                        existingVolume = parseFloat(tempVolume);
                        existingCost -= parseFloat(tempCost);
                    }

                    continue;
                }

                for(let tempDate in labels){
                    if(!priceVsDate[labels[tempDate]]){
                        var index = labels.indexOf(labels[tempDate]);
                        if (index !== -1) {
                            labels.splice(index, 1);
                        }
                    }
                }

                for(let tempDate in labels){
                    values.push(
                        (tempVolume * priceVsDate[labels[tempDate]]) - tempCost
                    )
                }

                if(tempTradeDs.type == "buy"){
                    existingVolume += parseFloat(tempTradeDs.volume);
                    existingCost += parseFloat(tempTradeDs.cost);
                } else if(tempTradeDs.type == "sell"){
                    existingVolume = parseFloat(tempVolume);
                    existingCost -= parseFloat(tempCost);
                }
            }

            tempChartData[i].push(
                {
                    "values": values
                }
            ); 
        }
    });
}

for(let i in tempChartData){
    $("#plBreakdownCoinWiseHeader").append(
        `
        <div class="row" id="PL_BREAKDOWN_COIN_WISE_${i}">
            <canvas
            class="ex-graph"
            width="800" height="400"
            id="PL_BREAKDOWN_COIN_WISE_CHART_${i}"
            >
            </canvas>
        </div>

        <hr class="mt-3">

        `
    )

    let tempDatasets = [];
    let tempLabels = [];

    for(let j in tempChartData[i]){
        tempLabels = entireLabels[i];
        tempDatasets.push({
            "label": i,
            "data": tempChartData[i][j]["values"],
            borderColor: "#3e95cd",
            fill: true
        })
    }

    const zoomOptions = {
        pan: {
            enabled: true,
            modifierKey: 'shift',
        },
        zoom: {
            mode: 'xy',
            drag: {
                enabled: true,
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
            },
            wheel: {
                enabled: true
            },
            pan: {
                enabled: true
            }
        }
    };

    var growthOptions =  {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            zoom: zoomOptions,
            tooltip: {
                callbacks: {
                    label: function(context) {
                        var label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 10
                },
            },
            y: {
                ticks: {
                    maxTicksLimit: 10,
                    callback: function(value, index, values) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
                    }
                },
                title: {
                    display: true,
                    align: 'center',
                    text: 'Profit',
                    padding: '5px',
                    font: {
                        size: 16
                    }
                }
            }
        },
    };

    // Bar chart
    var plBreakdownBarChart = new Chart(
    document.getElementById(`PL_BREAKDOWN_COIN_WISE_CHART_${i}`), 
    {
        type: 'line',
        data: {
            labels: tempLabels,
            datasets: tempDatasets
        },
        options: growthOptions
    });
}

var costVsTotalChartElement = document.getElementById("costVsTotal");

var costVsTotalChart = new Chart(costVsTotalChartElement, {
    type: 'doughnut',
    data: {
        labels: tradedCoins,
        datasets: [{  
            label: 'Cost vs Total',
            data: costVsTotal,
            borderWidth: 1,
            backgroundColor: costVsTotalColor,
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        }
    }
});

var mvVsTotalChartElement = document.getElementById("mvVsTotal");

var mvVsTotalChart = new Chart(mvVsTotalChartElement, {
    type: 'doughnut',
    data: {
        labels: tradedCoins,
        datasets: [{
            label: 'Market Value vs Total',
            data: costVsTotal,
            borderWidth: 1,
            backgroundColor: costVsTotalColor,
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        }
    }
});

// Bar chart
var plBreakdownBarChart = new Chart(document.getElementById("plBarChart"), {
    type: 'bar',
    data: {
        labels: tradedCoins,
        datasets: [
            {
                label: "Gain - Loss",
                backgroundColor: costVsTotalColor,
                data: plBarChartData
            }
        ]
    }
});

if(trades.length == 0){
    $('#quickStatsHeader').hide();
    $('#pieChartsHeader').hide();
    $('#plStatementHeader').hide();
    $("#plStatementHr").hide();
    $("#plBreakdownHr").hide();
    $("#plBreakdownHeader").hide();
    $("#plBreakdownCoinWiseHeader").hide();
    $('#noTradesHeader').show();
} else {
    let totalCostOfAllCoins = 0;

    for(let coin in latestTrades){
        let tradeDetails = latestTrades[coin];
        tradeDetails.name = tradeDetails.name.toLowerCase();
        
        totalCostOfAllCoins += parseFloat(tradeDetails.cost);

        $("#tradeDetailsTableBody").append(
            `     
                <tr id='STATEMENT_${tradeDetails.name}'>
                <td>${tradeDetails.symbol}</td>
                <td>$${tradeDetails.price}</td>
                <td>${tradeDetails.volume} ${tradeDetails.symbol}</td>
                <td>$${tradeDetails.cost}</td>
                <td id='MP_${tradeDetails.name}'>${tradeDetails.price}</td>
                <td id='MV_${tradeDetails.name}'>${tradeDetails.cost}</td>
                <td id='GL_${tradeDetails.name}'>0</td>
                <td id='GLP_${tradeDetails.name}'>0.00</td>
                </tr>
            `
        );
    }

    totalCostOfAllCoins = totalCostOfAllCoins.toFixed(2);
    $("#tradeDetailsTableBody").append(
        `     
            <tr id='STATEMENT_TOTAL'>
                <td></td>
                <td></td>
                <td></td>
                <td>$${totalCostOfAllCoins}</td>
                <td></td>
                <td id='MV_TOTAL'>${totalCostOfAllCoins}</td>
                <td id='GL_TOTAL'>0</td>
                <td id='GLP_TOTAL'>0.00</td>
            </tr>
        `
    );

    let latestGl = [];
    let latestGlP = [];

    const pricesWs = new WebSocket('wss://ws.coincap.io/prices?assets=' + tradedCoins.join(','))

    pricesWs.onmessage = function (msg) {
        let updatedPrice = JSON.parse(msg.data);
        for(let i in updatedPrice){
            let temp = tradedCoins.indexOf(i);
            mvVsTotalChart.data.datasets[0].data[temp] = updatedPrice[i] * nameToTradeMap[i]["volume"];
            mvVsTotalChart.update();

            let prevMv = parseFloat($("#MV_" + i).text());
            let prevGl = parseFloat($("#GL_" + i).text());
            let prevGlP = parseFloat($("#GLP_" + i).text());

            let newMv = (updatedPrice[i] * nameToTradeMap[i]["volume"]);
            let newGl = (parseFloat(newMv) - nameToTradeMap[i]["cost"]);
            let newGlP = ((parseFloat(newGl) / nameToTradeMap[i]["cost"]) * 100);

            plBreakdownBarChart.data.datasets[0].data[temp] = newGl;
            plBreakdownBarChart.update();

            $("#MP_" + i).text(updatedPrice[i]);
            $("#MV_" + i).text(newMv);
            $("#GL_" + i).text(newGl);
            $("#GLP_" + i).text(newGlP);

            if(parseFloat(newGl) < 0){
                $("#STATEMENT_" + i).css("background-color", "#E64759");
            } else {
                $("#STATEMENT_" + i).css("background-color", "green");
            }

            $("#MV_TOTAL").text(((parseFloat($("#MV_TOTAL").text()) - prevMv) + parseFloat(newMv)));
            $("#GL_TOTAL").text(((parseFloat($("#GL_TOTAL").text()) - prevGl) + parseFloat(newGl)));
            $("#GLP_TOTAL").text(((parseFloat($("#GLP_TOTAL").text()) - prevGlP) + parseFloat(newGlP)));

            if(!latestGl[i]){
                latestGl[i] = "";
            }

            latestGl[i] = newGl;

            if(!latestGlP[i]){
                latestGlP[i] = "";
            }

            latestGlP[i] = newGlP;

            let bestCoin = 'No gainer';
            let bestGlTemp = 0;

            let worstCoin = 'No loser';
            let worstGlTemp = 0;

            for(let j in latestGl){
                if(bestGlTemp < latestGl[j]){
                    bestGlTemp = latestGl[j]
                    bestCoin = j
                }

                if(worstGlTemp > latestGl[j]){
                    worstGlTemp = latestGl[j]
                    worstCoin = j
                }
            }

            if(bestCoin == "No gainer"){
                $("#top-coin-mv").text(0);
                $("#top-coin").text("No Gainer");
                $("#top-coin-gl").text("0.00%");
            } else {
                $("#top-coin-mv").text(latestGl[bestCoin].toFixed(2));
                $("#top-coin").text("Gainer - " + bestCoin);
                $("#top-coin-gl").text(latestGlP[bestCoin].toFixed(2) + "%");
            }

            if(worstCoin == "No loser"){
                $("#loss-coin-mv").text(0);
                $("#loss-coin").text("No Loser");
                $("#loss-coin-gl").text("0.00%");
            } else {
                $("#loss-coin-mv").text(latestGl[worstCoin].toFixed(2));
                $("#loss-coin").text("Loser - " + worstCoin);
                $("#loss-coin-gl").text(latestGlP[worstCoin].toFixed(2) + "%");
            }
        }
    }
}
    