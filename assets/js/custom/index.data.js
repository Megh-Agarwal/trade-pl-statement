var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
};
  
function shadeColor(color, percent) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

function customSort(a, b) {
    return new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime();
}

function getDatesInRange(startDate, endDate) {
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date < endDate) {
        dates.push(formatDate(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function convertMonthToWord(strDate, splitPoint, splitKeyword){
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return months[+strDate.split(splitKeyword)[splitPoint] - 1];
}

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
