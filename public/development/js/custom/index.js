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

            let prevMv = parseFloat($("#MV_" + i).text());
            let prevGl = parseFloat($("#GL_" + i).text());
            let prevGlP = parseFloat($("#GLP_" + i).text());

            let newMv = (updatedPrice[i] * nameToTradeMap[i]["volume"]);
            let newGl = (parseFloat(newMv) - nameToTradeMap[i]["cost"]);
            let newGlP = ((parseFloat(newGl) / nameToTradeMap[i]["cost"]) * 100);

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
    