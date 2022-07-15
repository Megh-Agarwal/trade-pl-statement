function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var coinsList = [];
var coinsSymbols = [];

let trades = [];
if(localStorage.trades){
    trades = JSON.parse(localStorage.trades);
}

$.ajax({
    type: "GET",
    url: "https://api.coincap.io/v2/assets?limit=2000",
    success: function(data){
        for(let i = 0; i < data["data"].length; i++){
            coinsList.push(data["data"][i]["name"] + ' - ' + data["data"][i]["symbol"]);
            coinsSymbols[data["data"][i]["symbol"]] = data["data"][i];
        }

        $("#investedCoin").typeahead({
            hint: true,
            highlight: true,
            minLength: 1,
            name: "coins",
            source: coinsList
        });
    }
});

for(let i = 0; i < trades.length; i++){
    let tradeDetails = JSON.parse(trades[i]);
    $("#tradeDetailsTableBody").append(
        `     
            <tr>
            <td>${tradeDetails.coin}</td>
            <td>${capitalizeFirstLetter(tradeDetails.type)}</td>
            <td>$${tradeDetails.price}</td>
            <td>${tradeDetails.volume} ${tradeDetails.symbol}</td>
            <td>$${tradeDetails.cost}</td>
            <td>${new Date(tradeDetails.tradeDate).toLocaleDateString()}</td>
            <td>
                <button type="button" class="btn btn-outline-primary" onclick='editTradeOpenModal(${tradeDetails.id})'>
                <span class="icon icon-edit"></span>
                </button>
            </td>
            </tr>
        `
    );
}

function editTradeOpenModal(id){
    for(let i = 0; i < trades.length; i++){
        let tradeDetails = JSON.parse(trades[i]);
        if(tradeDetails.id == id){
            $("#editInvestedCoin").val(tradeDetails.coin);
            $("#editTradeType").val(tradeDetails.type);
            $("#editPrice").val(tradeDetails.price);
            $("#editVolume").val(tradeDetails.volume);
            $("#editTradeDate").val(tradeDetails.tradeDate);
            $("#tradeId").val(id);
            $("#editTradeModal").modal('show');
        }
    }
}

var $rows = $('#tradeDetailsTableBody tr');
$('#search').keyup(function() {
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

    $rows.show().filter(function() {
        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});

$("#editTradeButton").on('click', function(e){
    let coin = $("#editInvestedCoin").val();
    let tradeType = $("#editTradeType").val();
    let price = $("#editPrice").val();
    let volume = $("#editVolume").val();
    let tradeDate = $("#editTradeDate").val();

    if(coin == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invested coin value as empty. Please enter the invested coin."
        })

        return false;
    }

    if(price == "" || !isNumber(price)){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid pricing value. Please enter a valid price at which the volume was traded."
        })

        return false;
    }

    if(volume == "" || !isNumber(volume)){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid volume value. Please enter a valid invested volume (quantity)."
        })

        return false;
    }

    if(tradeDate == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid trade date value. Please select a valid trade date."
        })

        return false;
    }

    let coinSymbol = coin.split('-');
    coinSymbol = coinSymbol[coinSymbol.length - 1].trim();

    if(coinSymbol == ""){
        PNotify.error({
            title: "An error occured",
            text: `Found invalid coin name.`
        })

        return false;
    }

    if(!isset(coinsSymbols, coinSymbol)){
        PNotify.error({
            title: "An error occured",
            text: `Found no coin with symbol as ${coinSymbol}.`
        })

        return false;
    }

    let coinWiseTrades = {};
    if(localStorage.coinWiseTrades){
        coinWiseTrades = JSON.parse(localStorage.coinWiseTrades);
    }

    if(tradeType == "sell"){
        if(!coinWiseTrades[coinSymbol]){
            PNotify.error({
                title: "An error occured",
                text: `You have no holding for coin with symbol as ${coinSymbol} to sell ${volume} ${coinSymbol}.`
            })
            
            return false;
        }

        let holdingOfCoin = JSON.parse(coinWiseTrades[coinSymbol]);
        let currentVolumeHolding = parseFloat(holdingOfCoin.volume);

        if(currentVolumeHolding < volume){
            PNotify.error({
                title: "An error occured",
                text: `You have only ${currentVolumeHolding} ${coinSymbol} to sell.`
            })
            
            return false;
        }
    }

    for(let i = 0; i < trades.length; i++){
        let tradeDetails = JSON.parse(trades[i]);
        if(tradeDetails.id == $("#tradeId").val()){
            tradeDetails.price = price;
            tradeDetails.volume = volume;
            tradeDetails.tradeDate = tradeDate;
            tradeDetails.cost = (price * volume).toFixed(2);
        }
        trades[i] = JSON.stringify(tradeDetails);
    }

    localStorage.setItem('trades', JSON.stringify(trades));

    let totalCost = 0.00;
    let totalVolume = 0;

    let totalSoldQty = 0;

    for(let i = 0; i < trades.length; i++){
        let tradeDetails = JSON.parse(trades[i]);
        if(tradeDetails.symbol == coinSymbol){
            if(tradeDetails.type == "buy") {
                totalVolume = totalVolume + parseFloat(tradeDetails.volume);
                totalCost = totalCost + parseFloat(tradeDetails.cost);
            }

            if(tradeDetails.type == "sell") {
                totalSoldQty = totalSoldQty + parseFloat(tradeDetails.volume);
            }
        }
    }

    let avgPrice = totalCost / totalVolume;

    let tempVar =  {
        "symbol": coinSymbol,
        "price": avgPrice,
        "volume": totalVolume - totalSoldQty,
        "cost": avgPrice * (totalVolume - totalSoldQty),
        "name": coinsSymbols[coinSymbol]["name"],
    };

    if(!coinWiseTrades[coinSymbol]){
        coinWiseTrades[coinSymbol] = {};
    }

    coinWiseTrades[coinSymbol] = JSON.stringify(tempVar)

    localStorage.setItem('coinWiseTrades', JSON.stringify(coinWiseTrades));

    PNotify.success({
        title: "Success",
        text: `The trade was successfully edited.`
    })

    setTimeout(function() {
        location.reload();
    }, 1000)
})

$("#addNewTradeButton").on('click', function(e){
    let coin = $("#investedCoin").val();
    let tradeType = $("#tradeType").val();
    let price = $("#price").val();
    let volume = $("#volume").val();
    let tradeDate = $("#tradeDate").val();

    if(coin == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invested coin value as empty. Please enter the invested coin."
        })

        return false;
    }

    if(tradeType == "" || (tradeType != "buy" && tradeType != "sell")){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid trade type. Please select a trade type."
        })

        return false;
    }

    if(price == "" || !isNumber(price)){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid pricing value. Please enter a valid price at which the volume was traded."
        })

        return false;
    }

    if(volume == "" || !isNumber(volume)){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid volume value. Please enter a valid invested volume (quantity)."
        })

        return false;
    }

    if(tradeDate == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid trade date value. Please select a valid trade date."
        })

        return false;
    }

    let coinSymbol = coin.split('-');
    coinSymbol = coinSymbol[coinSymbol.length - 1].trim();

    if(coinSymbol == ""){
        PNotify.error({
            title: "An error occured",
            text: `Found invalid coin name.`
        })

        return false;
    }

    if(!isset(coinsSymbols, coinSymbol)){
        PNotify.error({
            title: "An error occured",
            text: `Found no coin with symbol as ${coinSymbol}.`
        })

        return false;
    }

    let coinWiseTrades = {};
    if(localStorage.coinWiseTrades){
        coinWiseTrades = JSON.parse(localStorage.coinWiseTrades);
    }

    if(tradeType == "sell"){
        if(!coinWiseTrades[coinSymbol]){
            PNotify.error({
                title: "An error occured",
                text: `You have no holding for coin with symbol as ${coinSymbol} to sell ${volume} ${coinSymbol}.`
            })
            
            return false;
        }

        let holdingOfCoin = JSON.parse(coinWiseTrades[coinSymbol]);
        let currentVolumeHolding = parseFloat(holdingOfCoin.volume);

        if(currentVolumeHolding < volume){
            PNotify.error({
                title: "An error occured",
                text: `You have only ${currentVolumeHolding} ${coinSymbol} to sell.`
            })
            
            return false;
        }
    }

    trades.push(JSON.stringify({
        "id": Date.now(),
        "symbol": coinSymbol,
        "type": tradeType,
        "coin": coin,
        "price": price,
        "volume": volume,
        "tradeDate": tradeDate,
        "name": coinsSymbols[coinSymbol]["name"],
        "cost": (price * volume).toFixed(2)
    }));

    localStorage.setItem('trades', JSON.stringify(trades));

    let totalCost = 0.00;
    let totalVolume = 0;

    let totalSoldQty = 0;

    for(let i = 0; i < trades.length; i++){
        let tradeDetails = JSON.parse(trades[i]);
        if(tradeDetails.symbol == coinSymbol){
            if(tradeDetails.type == "buy") {
                totalVolume = totalVolume + parseFloat(tradeDetails.volume);
                totalCost = totalCost + parseFloat(tradeDetails.cost);
            }

            if(tradeDetails.type == "sell") {
                totalSoldQty = totalSoldQty + parseFloat(tradeDetails.volume);
            }
        }
    }

    let avgPrice = totalCost / totalVolume;

    let tempVar =  {
        "symbol": coinSymbol,
        "price": avgPrice,
        "volume": totalVolume - totalSoldQty,
        "cost": avgPrice * (totalVolume - totalSoldQty),
        "name": coinsSymbols[coinSymbol]["name"],
    };

    if(!coinWiseTrades[coinSymbol]){
        coinWiseTrades[coinSymbol] = {};
    }

    coinWiseTrades[coinSymbol] = JSON.stringify(tempVar)

    localStorage.setItem('coinWiseTrades', JSON.stringify(coinWiseTrades));

    PNotify.success({
        title: "Success",
        text: `The trade was successfully added.`
    })

    setTimeout(function() {
        location.reload();
    }, 1000)
});