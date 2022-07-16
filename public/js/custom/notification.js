function askNotificationPermission() {
    // If the user agreed to get notified
    // Let's try to send ten notifications
    if (window.Notification && Notification.permission === "granted") {
        console.log("granted notification");
    }

    // If the user hasn't told if they want to be notified or not
    // Note: because of Chrome, we are not sure the permission property
    // is set, therefore it's unsafe to check for the "default" value.
    else if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission(function (status) {
            // If the user said okay
            if (status === "granted") {
                console.log("granted user notification");
            }

            // Otherwise, we can fallback to a regular modal alert
            else {
                alert("Hi!");
            }
        });
    }

    // If the user refuses to get notified
    else {
        // We can fallback to a regular modal alert
        alert("Hi!");
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var coinsList = [];
var coinsSymbols = [];

var notificationTypesList = ['price', 'gain', 'loss', 'total'];
var notificationOptionsList = ['once', 'everytime'];
var notificationConditionsList = ['more', 'less', 'equal'];

var notificationTypesMap = {
    "price": "Price",
    "total": "Gain and Loss",
};

var notificationOptionsMap = {
    "once": "Only Once",
    "everytime": "Everytime",
};

var notificationConditionsMap = {
    "more": "More than equal to x",
    "less": "Less than equal to x",
    "equal": "Equal to x",
};

let notifications = [];
if(localStorage.notifications){
    notifications = JSON.parse(localStorage.notifications);
}

$.ajax({
    type: "GET",
    url: "https://api.coincap.io/v2/assets?limit=2000",
    async: false,
    success: function(data){
        for(let i = 0; i < data["data"].length; i++){
            coinsList.push(data["data"][i]["name"] + ' - ' + data["data"][i]["symbol"]);
            coinsSymbols[data["data"][i]["symbol"]] = data["data"][i];
        }

        $("#notificationCoin").typeahead({
            hint: true,
            highlight: true,
            minLength: 1,
            name: "coins",
            source: coinsList
        });
    }
});

for(let i = 0; i < notifications.length; i++){
    let notificationDetails = JSON.parse(notifications[i]);
    $("#notificationDetailsTableBody").append(
        `     
            <tr>
                <td>${notificationDetails.combined}</td>
                <td>${notificationTypesMap[notificationDetails.type]}</td>
                <td>${notificationOptionsMap[notificationDetails.option]}</td>
                <td>${notificationConditionsMap[notificationDetails.condition]}</td>
                <td>$${notificationDetails.value}</td>
                <td>${new Date(notificationDetails.expiry).toLocaleDateString()}</td>
                <td>
                    <div class="d-grid gap-2 d-md-block">
                        <button 
                            type="button" 
                            class="btn btn-xs btn-outline-primary" 
                            onclick='editNotificationOpenModal(${notificationDetails.id})'
                        >
                            <span class="icon icon-edit"></span>
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-xs btn-outline-danger" 
                            onclick='deleteNotificationOpenModal(${notificationDetails.id})'
                        >
                            <span class="icon icon-cross"></span>
                        </button>    
                    </div>
                </td>
            </tr>
        `
    );
}

function editNotificationOpenModal(id){
    for(let i = 0; i < notifications.length; i++){
        let notificationDetails = JSON.parse(notifications[i]);
        if(notificationDetails.id == id){
            $("#editNotificationCoin").val(notificationDetails.combined);
            $("#editNotificationType").val(notificationDetails.type);
            $("#editNotificationOption").val(notificationDetails.option);
            $("#editNotificationCondition").val(notificationDetails.condition);
            $("#editNotificationExpiry").val(notificationDetails.expiry);
            $("#editNotificationValue").val(notificationDetails.value);
            $("#notificationId").val(id);
            
            $("#editNotificationCoin").typeahead({
                hint: true,
                highlight: true,
                minLength: 1,
                name: "coins",
                source: coinsList
            });

            $("#editNotificationModal").modal('show');
        }
    }
}

function deleteNotificationOpenModal(id){
    for(let i = 0; i < notifications.length; i++){
        let notificationDetails = JSON.parse(notifications[i]);
        if(notificationDetails.id == id){
            $("#deleteNotificationSpanId").text(id);
            $("#deleteNotificationModal").modal('show');
        }
    }
}

var $rows = $('#notificationDetailsTableBody tr');
$('#search').keyup(function() {
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

    $rows.show().filter(function() {
        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});

$("#editNotificationButton").on('click', function(e){
    let coin = $("#editNotificationCoin").val();
    let type = $("#editNotificationType").val();
    let option = $("#editNotificationOption").val();
    let condition = $("#editNotificationCondition").val();
    let expiry = $("#editNotificationExpiry").val();
    let value = $("#editNotificationValue").val();

    if(coin == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found coin for notification value as empty. Please enter the coin."
        })

        return false;
    }

    if(
        type == "" || 
        !notificationTypesList.includes(type)
    ){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification type. Please select a notification type."
        })

        return false;
    }

    if(
        option == "" || 
        !notificationOptionsList.includes(option)
    ){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification option. Please select a notification option."
        })

        return false;
    }

    if(
        condition == "" || 
        !notificationConditionsList.includes(condition)
    ){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification condition. Please select a notification condition."
        })

        return false;
    }

    if(expiry == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification expiry value. Please select a valid notification expiry date."
        })

        return false;
    }

    if(value == "" || !isNumber(value)){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification value. Please enter a valid notification value."
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

    for(let i = 0; i < notifications.length; i++){
        let notificationDetails = JSON.parse(notifications[i]);
        if(notificationDetails.id == $("#notificationId").val()){
            notificationDetails.name = coinsSymbols[coinSymbol]["name"];
            notificationDetails.coin = coinSymbol;
            notificationDetails.combined = coin;
            notificationDetails.type = type;
            notificationDetails.option = option;
            notificationDetails.condition = condition;
            notificationDetails.expiry = expiry;
            notificationDetails.value = value;
        }
        notifications[i] = JSON.stringify(notificationDetails);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));

    PNotify.success({
        title: "Success",
        text: `The notification was successfully edited.`
    })

    setTimeout(function() {
        location.reload();
    }, 1000)
})

$("#addNewNotificationButton").on('click', function(e){
    let coin = $("#notificationCoin").val();
    let type = $("#notificationType").val();
    let option = $("#notificationOption").val();
    let condition = $("#notificationCondition").val();
    let expiry = $("#notificationExpiry").val();
    let value = $("#notificationValue").val();

    if(coin == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found coin for notification value as empty. Please enter the coin."
        })

        return false;
    }

    if(
        type == "" || 
        !notificationTypesList.includes(type)
    ){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification type. Please select a notification type."
        })

        return false;
    }

    if(
        option == "" || 
        !notificationOptionsList.includes(option)
    ){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification option. Please select a notification option."
        })

        return false;
    }

    if(
        condition == "" || 
        !notificationConditionsList.includes(condition)
    ){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification condition. Please select a notification condition."
        })

        return false;
    }

    if(expiry == ""){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification expiry value. Please select a valid notification expiry date."
        })

        return false;
    }

    if(value == "" || !isNumber(value)){
        PNotify.error({
            title: "An error occured",
            text: "Found invalid notification value. Please enter a valid notification value."
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

    notifications.push(JSON.stringify({
        "id": Date.now(),
        "name": coinsSymbols[coinSymbol]["name"],
        "combined": coin,
        "coin": coinSymbol,
        "type": type,
        "option": option,
        "condition": condition,
        "expiry": expiry,
        "value": value,
        "status": 0,
    }));

    localStorage.setItem('notifications', JSON.stringify(notifications));

    PNotify.success({
        title: "Success",
        text: `The notification was successfully added.`
    })

    setTimeout(function() {
        location.reload();
    }, 1000)
});

$("#deleteNotificationButton").on('click', function(e){
    for(let i = 0; i < notifications.length; i++){
        let notificationDetails = JSON.parse(notifications[i]);
        if(notificationDetails.id == $("#deleteNotificationSpanId").text()){
            notifications.splice(i, 1);
            break;
        }
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));

    PNotify.success({
        title: "Success",
        text: `The notification was successfully deleted.`
    })

    setTimeout(function() {
        location.reload();
    }, 1000)
})