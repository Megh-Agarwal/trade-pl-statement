setInputDate("#tradeDate");

var coinsList = [];
var coinsSymbols = [];

let trades = [];
if(localStorage.trades){
    trades = JSON.parse(localStorage.trades);
}

let boughtInTypes = ["usd", "btc", "eth"];

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

function updateCoinWiseTrades(
    tradesToCheck,
    localStorageVarToUpdate,
    coinToUpdate,
    json
){
    let totalCost = 0.00;
    let totalVolume = 0;

    let totalSoldQty = 0;

    for(let i = 0; i < tradesToCheck.length; i++){
        let tradeDetails = JSON.parse(tradesToCheck[i]);
        if(tradeDetails.symbol == coinToUpdate){
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

    json.price = avgPrice;
    json.volume = totalVolume - totalSoldQty;
    json.cost = avgPrice * (totalVolume - totalSoldQty);

    let coinWiseTrades = {};
    if(localStorage[localStorageVarToUpdate]){
        coinWiseTrades = JSON.parse(localStorage[localStorageVarToUpdate]);
    }
    
    if(!coinWiseTrades[coinToUpdate]){
        coinWiseTrades[coinToUpdate] = {};
    }

    coinWiseTrades[coinToUpdate] = JSON.stringify(json)

    localStorage.setItem(localStorageVarToUpdate, JSON.stringify(coinWiseTrades));
}

for(let i = 0; i < trades.length; i++){
    let tradeDetails = JSON.parse(trades[i]);

    if(tradeDetails.display == "show"){
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
                    <button 
                        type="button" 
                        class="btn btn-sm btn-outline-primary" 
                        onclick='editTradeOpenModal("${tradeDetails.id}")'
                    >
                        <span class="icon icon-edit"></span>
                    </button>
                </td>
                </tr>
            `
        );
    }
}

function editTradeOpenModal(id){
    for(let i = 0; i < trades.length; i++){
        let tradeDetails = JSON.parse(trades[i]);
        if(tradeDetails.id == id){

            $("#editInvestedCoin").val(tradeDetails.coin);
            $("#editTradeType").val(tradeDetails.type);
            $("#editVolume").val(tradeDetails.volume);
            $("#editTradeDate").val(tradeDetails.tradeDate);
            $("#tradeId").val(id);
            $("#editTradeModal").modal('show');

            if(tradeDetails.boughtIn != "usd"){
                $("#editBoughtIn").val(tradeDetails.boughtIn);
                $("#editPrice").val(tradeDetails.boughtInPrice);
                $("#editExchangeRate").val(tradeDetails.exchangeRate);
            } else {
                $("#editPrice").val(tradeDetails.price);
            }

            $("#editBoughtIn").trigger('change');

            break;
        }
    }
}

$("#boughtIn").on('change', function (e) {
    let boughtIn = $("#boughtIn").val();

    if(boughtIn == "btc" || boughtIn == "eth"){
        $("#fetchPriceButton").removeAttr("hidden");
        $("#boughtInSupplement").removeAttr("hidden");

        if(boughtIn == "btc"){
            $(".boughtInCoinName").text("of bitcoin when the coin was bought/sold"); 
        } else if(boughtIn == "eth"){
            $(".boughtInCoinName").text("of ethereum when the coin was bought/sold"); 
        }
    }

    if(boughtIn == "usd"){
        $("#fetchPriceButton").attr("hidden", true);
        $("#boughtInSupplement").attr("hidden", true);
        $(".boughtInCoinName").text(""); 
    }
});

$("#editBoughtIn").on('change', function (e) {
    let boughtIn = $("#editBoughtIn").val();

    if(boughtIn == "btc" || boughtIn == "eth"){
        $("#editFetchPriceButton").removeAttr("hidden");
        $("#editBoughtInSupplement").removeAttr("hidden");

        if(boughtIn == "btc"){
            $(".editBoughtInCoinName").text("of bitcoin when the coin was bought/sold"); 
        } else if(boughtIn == "eth"){
            $(".editBoughtInCoinName").text("of ethereum when the coin was bought/sold"); 
        }
    }

    if(boughtIn == "usd"){
        $("#editFetchPriceButton").attr("hidden", true);
        $("#editBoughtInSupplement").attr("hidden", true);
        $(".editBoughtInCoinName").text(""); 
    }
});

$("#fetchPriceButton").on('click', function (e) {
    let coin = $("#boughtIn").val();
    let symbol = "bitcoin";

    if(coin == "btc" || coin == "eth"){
        if(coin == "eth"){
            symbol = "ethereum";
        }

        let tradeDate = $("#tradeDate").val();

        $.ajax({
            type: "GET",
            url: `https://api.coincap.io/v2/assets/${symbol}/history?interval=d1`,
            success: function(data){
                let tempPriceTimeBased = data["data"];
                let price = "";

                
                for(let k in tempPriceTimeBased){
                    if(new Date(tradeDate).getTime() === new Date(formatDate(tempPriceTimeBased[k]["date"]).toString()).getTime()){
                        price = parseFloat(tempPriceTimeBased[k]["priceUsd"]);
                    }
                }
                
                if(price == ""){
                    PNotify.error({
                        title: "An error occured",
                        text: `Could not fetch price for trade date ${new Date(tradeDate).toLocaleDateString()}. Please enter the price manually.`
                    })
        
                    return false;
                }

                $("#price").val(price);
            
                PNotify.success({
                    title: "Fetched price successfully",
                    text: `Successfully fetched price for ${symbol} for trade date ${new Date(tradeDate).toLocaleDateString()}.`
                });

                return true;
            }
        });
    }
})

$("#editFetchPriceButton").on('click', function (e) {
    let coin = $("#editBoughtIn").val();
    let symbol = "bitcoin";

    if(coin == "btc" || coin == "eth"){
        if(coin == "eth"){
            symbol = "ethereum";
        }

        let tradeDate = $("#editTradeDate").val();

        $.ajax({
            type: "GET",
            url: `https://api.coincap.io/v2/assets/${symbol}/history?interval=d1`,
            success: function(data){
                let tempPriceTimeBased = data["data"];
                let price = "";

                
                for(let k in tempPriceTimeBased){
                    if(new Date(tradeDate).getTime() === new Date(formatDate(tempPriceTimeBased[k]["date"]).toString()).getTime()){
                        price = parseFloat(tempPriceTimeBased[k]["priceUsd"]);
                    }
                }
                
                if(price == ""){
                    PNotify.error({
                        title: "An error occured",
                        text: `Could not fetch price for trade date ${new Date(tradeDate).toLocaleDateString()}. Please enter the price manually.`
                    })
        
                    return false;
                }

                $("#editPrice").val(price);
            
                PNotify.success({
                    title: "Fetched price successfully",
                    text: `Successfully fetched price for ${symbol} for trade date ${new Date(tradeDate).toLocaleDateString()}.`
                });

                return true;
            }
        });
    }
})

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

    let boughtIn = $("#editBoughtIn").val();

    let boughtInPrice = price;
    let exchangeRate = $("#editExchangeRate").val();

    let noOfSpentCoinForBoughtIn = 0;

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

    if(boughtIn == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid bought in value. Please select a valid bought in value."
        })

        return false;
    }

    if(!boughtInTypes.includes(boughtIn)){
        PNotify.error({
            title: "An error occured",
            text: `Found invalid bought in type ${boughtIn}. Please select a valid bought in type.`
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

    if(boughtIn != "usd"){
        if(exchangeRate == "" || !isNumber(exchangeRate)){
            PNotify.error({
                title: "An error occured",
                text: "Found invalid exchange rate value. Please enter a valid exchange rate at which the volume was traded."
            })
    
            return false;
        }
        
        noOfSpentCoinForBoughtIn = volume * exchangeRate;
    }

    for(let i = 0; i < trades.length; i++){
        let tradeDetails = JSON.parse(trades[i]);

        if(tradeDetails.id == $("#tradeId").val()){
            if(
                tradeDetails.relation != "none" && 
                tradeDetails.relation != "related"
            ){
                for(let j = 0; j < trades.length; j++){
                    let relatedTradeDetails = JSON.parse(trades[j]);

                    if(relatedTradeDetails.id == tradeDetails.relation){

                        relatedTradeDetails.boughtInPrice = boughtInPrice;
                        relatedTradeDetails.exchangeRate = exchangeRate;
                        relatedTradeDetails.price = price;
                        relatedTradeDetails.volume = noOfSpentCoinForBoughtIn;
                        relatedTradeDetails.tradeDate = tradeDate;
                        relatedTradeDetails.cost = (price * noOfSpentCoinForBoughtIn).toFixed(2);

                        trades[j] = JSON.stringify(relatedTradeDetails);

                        updateCoinWiseTrades(
                            trades,
                            'coinWiseTrades',
                            relatedTradeDetails.symbol,
                            {
                                "symbol": relatedTradeDetails.symbol,
                                "name": coinsSymbols[relatedTradeDetails.symbol]["name"],
                            }
                        );
                        
                        price = price * exchangeRate;
                    }
                }
            }

            tradeDetails.boughtInPrice = boughtInPrice;
            tradeDetails.exchangeRate = exchangeRate;
            tradeDetails.price = price;
            tradeDetails.volume = volume;
            tradeDetails.tradeDate = tradeDate;
            tradeDetails.cost = (price * volume).toFixed(2);
        }

        trades[i] = JSON.stringify(tradeDetails);
    }

    localStorage.setItem('trades', JSON.stringify(trades));

    updateCoinWiseTrades(
        trades,
        'coinWiseTrades',
        coinSymbol,
        {
            "symbol": coinSymbol,
            "name": coinsSymbols[coinSymbol]["name"],
        }
    );

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
    let boughtIn = $("#boughtIn").val();

    let boughtInPrice = price;
    let exchangeRate = $("#exchangeRate").val();

    let noOfSpentCoinForBoughtIn = 0;

    let exchangeRateBasedTrade = {};

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

    if(boughtIn == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid bought in value. Please select a valid bought in value."
        })

        return false;
    }

    if(!boughtInTypes.includes(boughtIn)){
        PNotify.error({
            title: "An error occured",
            text: `Found invalid bought in type ${boughtIn}. Please select a valid bought in type.`
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

    if(boughtIn != "usd"){
        if(exchangeRate == "" || !isNumber(exchangeRate)){
            PNotify.error({
                title: "An error occured",
                text: "Found invalid exchange rate value. Please enter a valid exchange rate at which the volume was traded."
            })
    
            return false;
        }
        
        noOfSpentCoinForBoughtIn = volume * exchangeRate;

        let tempCoin = "Bitcoin - BTC";
        let tempCoinSymbol = "BTC";

        if(boughtIn == "eth"){
            tempCoin = "Ethereum - ETH";
            tempCoinSymbol = "ETH";
        }

        exchangeRateBasedTrade = {
            "id": generateId(),
            "symbol": tempCoinSymbol,
            "type": "sell",
            "coin": tempCoin,
            "price": price,
            "volume": noOfSpentCoinForBoughtIn,
            "tradeDate": tradeDate,
            "name": coinsSymbols[tempCoinSymbol]["name"],
            "cost": (price * noOfSpentCoinForBoughtIn).toFixed(2),
            "boughtIn": boughtIn,
            "exchangeRate": exchangeRate,
            "boughtInPrice": boughtInPrice,
            "display": "hidden",
            "relation": "related"
        };

        trades.push(JSON.stringify(exchangeRateBasedTrade));

        updateCoinWiseTrades(
            trades,
            'coinWiseTrades',
            tempCoinSymbol,
            {
                "symbol": tempCoinSymbol,
                "name": coinsSymbols[tempCoinSymbol]["name"],
            }
        );

        price = price * exchangeRate;
    }

    trades.push(JSON.stringify({
        "id": generateId(),
        "symbol": coinSymbol,
        "type": tradeType,
        "coin": coin,
        "price": price,
        "volume": volume,
        "tradeDate": tradeDate,
        "name": coinsSymbols[coinSymbol]["name"],
        "cost": (price * volume).toFixed(2),
        "boughtIn": boughtIn,
        "exchangeRate": exchangeRate,
        "boughtInPrice": boughtInPrice,
        "display": "show",
        "relation": Object.keys(exchangeRateBasedTrade).includes("id") ? exchangeRateBasedTrade.id : "none"
    }));

    localStorage.setItem('trades', JSON.stringify(trades));

    updateCoinWiseTrades(
        trades,
        'coinWiseTrades',
        coinSymbol,
        {
            "symbol": coinSymbol,
            "name": coinsSymbols[coinSymbol]["name"],
        }
    );

    PNotify.success({
        title: "Success",
        text: `The trade was successfully added.`
    })

    setTimeout(function() {
        location.reload();
    }, 1000)
});