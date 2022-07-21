require('dotenv').config()
const PORT = process.env.PORT || 5000;

const path = require('path');
const express = require('express');
const handlebars = require('hbs');
const webPush = require('web-push');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const routes = require('./routes/routes.js');
const minifier = require('./scripts/minifyFiles.js');

const publicVapidKey = "BI6jIHYbytCsLCBK-D38d6XfcUpoznzdEGAlMVbDu-LeGTjsI4N4T5SEEC9wl-jw6WFKsJ0h9FqYcFFvbGlso7g";
const privateVapidKey = process.env.PRIVATE_VAPID_API_KEY;

var publicDirectory = path.join(__dirname, './public/development/');

if(process.env.MODE == "production"){
    minifier(
        path.join(__dirname),
        'public/development/js',
        '.js',
        'public/production/js'
    );
    
    publicDirectory = path.join(__dirname, './public/production/');
}

const viewsPath = path.join(__dirname, './templates/views/');
const partialsPath = path.join(__dirname, './templates/partials/');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "connect-src": ["'self'", "https://api.coincap.io/v2/", "wss://ws.coincap.io/"],
            "script-src-attr": ["'unsafe-inline'"]
        }
    }
}));
app.use(express.json());
app.set('view engine', 'hbs');
app.set('views', viewsPath);
app.use(express.static(publicDirectory));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});
app.use(routes);

handlebars.registerPartials(partialsPath);

webPush.setVapidDetails('mailto:' + process.env.MAIL, publicVapidKey, privateVapidKey);

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
})