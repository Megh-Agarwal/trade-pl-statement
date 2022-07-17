function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

let notificationLogs = [];
if(localStorage.notificationLogs){
    notificationLogs = JSON.parse(localStorage.notificationLogs);
}

for(let i = 0; i < notificationLogs.length; i++){
    let notificationLogsDetails = JSON.parse(notificationLogs[i]);
    $("#notificationLogsTableBody").append(
        `     
            <tr>
                <td>${notificationLogsDetails["notification"]["combined"]}</td>
                <td>${notificationLogsDetails["message"]["title"]}</td>
                <td>${notificationLogsDetails["message"]["body"]}</td>
                <td>${new Date(notificationLogsDetails["timestamp"]).toLocaleDateString() + " " + new Date(notificationLogsDetails["timestamp"]).toLocaleTimeString()}</td>
            </tr>
        `
    );
}

var $rows = $('#notificationDetailsTableBody tr');
$('#search').keyup(function() {
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

    $rows.show().filter(function() {
        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});