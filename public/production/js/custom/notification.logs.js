var notificationTypesList=["price","gain","loss","total"],notificationOptionsList=["once","everytime"],notificationConditionsList=["more","less","equal"],notificationTypesMap={price:"Price",total:"Gain and Loss"},notificationOptionsMap={once:"Only Once",everytime:"Everytime"},notificationConditionsMap={more:"More than equal to x",less:"Less than equal to x",equal:"Equal to x"};let notificationLogs=[];localStorage.notificationLogs&&(notificationLogs=JSON.parse(localStorage.notificationLogs));for(let i=0;i<notificationLogs.length;i++){let t=JSON.parse(notificationLogs[i]);$("#notificationLogsTableBody").append(`     
            <tr>
                <td>${t.notification.combined}</td>
                <td>${t.message.title}</td>
                <td>${t.message.body}</td>
                <td>${new Date(t.timestamp).toLocaleDateString()+" "+new Date(t.timestamp).toLocaleTimeString()}</td>
            </tr>
        `)}var $rows=$("#notificationDetailsTableBody tr");$("#search").keyup(function(){var t=$.trim($(this).val()).replace(/ +/g," ").toLowerCase();$rows.show().filter(function(){return!~$(this).text().replace(/\s+/g," ").toLowerCase().indexOf(t)}).hide()});