const path = require('path');
const webPush = require('web-push');

const getIndexPage = (req, res, next) => {
    res.render('index', {
        title: "$ - Dashboard"
    })
}

const getTradesPage = (req, res, next) => {
    res.render('trades', {
        title: "$ - Trades"
    })
}

const getNotificationsPage = (req, res, next) => {
    res.render('notification', {
        title: "$ - Notifications"
    })
}

const getWorkerJs = (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', 'worker.js'));
}

const postNotification = (req, res, next) => {
    //get push subscription object from the request
    const subscription = req.body["subscription"];

    const notification = req.body["notification"];
    const currentPrice = req.body["currentPrice"];

    //send status 201 for the request
    res.status(201).json({})

    let verb = "than";

    if(notification.condition == "equal"){
        verb = "to"
    }

    let type = "price";

    if(notification.type == "total"){
        type = "total Gain and Loss";
    }

    //create paylod: specified the detals of the push notification
    const payload = JSON.stringify({
        title: `Alert for ${notification.combined}!`,
        body: `${notification.name}'s (current price is $${currentPrice}) ${type} has reached ${notification.condition} ${verb} $${notification.value}` 
    });

    //pass the object into sendNotification fucntion and catch any error
    webPush.sendNotification(subscription, payload).catch(err=> console.error(err));
}

module.exports = { getIndexPage, getTradesPage, getNotificationsPage, getWorkerJs, postNotification };