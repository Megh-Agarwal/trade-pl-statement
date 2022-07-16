const publicVapidKey = "BI6jIHYbytCsLCBK-D38d6XfcUpoznzdEGAlMVbDu-LeGTjsI4N4T5SEEC9wl-jw6WFKsJ0h9FqYcFFvbGlso7g";

// Check for service worker
if ("serviceWorker" in navigator) {
    send().catch(err => console.error(err));
}

// Register SW, Register Push, Send Push
async function send() {
    // Register Service Worker
    console.log("Registering service worker...");
    const register = await navigator.serviceWorker.register("/worker.js", { scope: "/" });
    console.log("Service Worker Registered...");

    if(register.installing) {
        console.log('Service worker installing');
    } else if(register.waiting) {
        console.log('Service worker installed');
    } else if(register.active) {
        console.log('Service worker active');
    }

    if (!('PushManager' in window)) {  
        console.log('Push messaging isn\'t supported.');  
    } else {
        console.log('Push noti is working');  
    }

    //
    if (Notification.permission === 'denied') {  
        console.log('The user has blocked notifications.');   
    } else {
        console.log('The user is not stupid');  
    }

    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    // Send Push Notification
    checkForNotifications(subscription);
    console.log("Sending Push...");
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function checkForNotifications(subscription){
    let notifications = [];
    let coinWiseTrades = [];
    let nameToTradeMap = [];
    let coinsToFetchLiveData = [];
    let coinWiseNotificationRequests = [];
    let notisSendForCoins = [];

    if(localStorage.notifications){
        notifications = JSON.parse(localStorage.notifications);
    }

    if(localStorage.coinWiseTrades){
        coinWiseTrades = JSON.parse(localStorage.coinWiseTrades);
    }

    for(let i in notifications){
        let notification = JSON.parse(notifications[i]);

        if(notification["status"] == 0){
            if(!coinWiseNotificationRequests[notification["name"].toLowerCase()]){
                coinWiseNotificationRequests[notification["name"].toLowerCase()] = [];
            }

            coinWiseNotificationRequests[notification["name"].toLowerCase()].push(notification);
            coinsToFetchLiveData.push(notification["name"].toLowerCase());
        }
    }

    for(let i in coinWiseTrades){
        let temp = JSON.parse(coinWiseTrades[i]);
        nameToTradeMap[temp["name"].toLowerCase()] = temp;
    }

    setInterval(function(){
        notisSendForCoins = [];
    }, 300000)

    if(coinsToFetchLiveData != []){
        const pricesWs = new WebSocket('wss://ws.coincap.io/prices?assets=' + coinsToFetchLiveData.join(','))
    
        pricesWs.onmessage = function (msg) {
            let updatedPrice = JSON.parse(msg.data);
            for(let i in updatedPrice){
                let newPrice = parseFloat(updatedPrice[i]);

                for(let j in coinWiseNotificationRequests[i]){
                    let notification = coinWiseNotificationRequests[i][j];

                    let notificationValue = parseFloat(notification["value"]);

                    let expiryDate = new Date(notification["expiry"]);
                    let todaysDate = new Date();

                    let sendNotification = false;
                    let valueToCompare = newPrice;

                    if(notification["status"] == 0){
                        if(expiryDate >= todaysDate){
                            if(
                                notification["type"] == "total"
                            ) {
                                let newMv = newPrice * parseFloat(nameToTradeMap[i]["volume"]);
                                valueToCompare = newMv - parseFloat(nameToTradeMap[i]["cost"]);
                            }
    
                            if(
                                notification["condition"] == "equal" &&
                                valueToCompare == notificationValue
                            ){
                                //send notification
                                sendNotification = true;
                            } 
                            
                            else if(
                                notification["condition"] == "more" &&
                                valueToCompare >= notificationValue
                            ) {
                                //send notification
                                sendNotification = true;
                            }  
                            
                            else if(
                                notification["condition"] == "less" &&
                                valueToCompare <= notificationValue
                            ) {
                                //send notification
                                sendNotification = true;
                            }
                        } else {
                            //Update status of notification to 1 because the expiry date has been reached.
    
                            notification["status"] = 1;

                            coinWiseNotificationRequests[i][parseFloat(j)] = JSON.stringify(notification); 
    
                            for(let l in notifications) {
                                let notiDetails = JSON.parse(notifications[l])
                                if(notiDetails["id"] == notification["id"]){
                                    notifications[l] = JSON.stringify(notification);
                                }
                            }
                            
                            localStorage.setItem('notifications', JSON.stringify(notifications));
                        }
    
                        if(sendNotification == true){
                            if(notification["option"] == "once"){
                                notification["status"] = 1;

                                coinWiseNotificationRequests[i][parseFloat(j)] = JSON.stringify(notification); 
        
                                for(let l in notifications) {
                                    let notiDetails = JSON.parse(notifications[l])
                                    if(notiDetails["id"] == notification["id"]){
                                        notifications[l] = notification;
                                    }
                                }
                                
                                localStorage.setItem('notifications', JSON.stringify(notifications));
                            }
    
                            const sendNotification = async () => {
                                await fetch("/notify", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        "subscription": subscription,
                                        "notification": notification,
                                        "currentPrice": newPrice
                                    }),
                                    headers: {
                                        "content-type": "application/json"
                                    }
                                })
                            }

                            if(!notisSendForCoins.includes(j)){
                                sendNotification();
                                notisSendForCoins.push(j);
                            }
                        }
                    }
                }
            }
        }
    }
}