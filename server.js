const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
const dotenv = require('dotenv');
// grabbing required packages 

const config = require('./config-db.js');
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const client = new MongoClient(url, { useUnifiedTopology: true });
//build mongoDB connection
// setting up and connecting to MongoDB database: https://studres.cs.st-andrews.ac.uk/CS5003/Exercises/W7-MongoDB.html (accessed: 01/04/2022)
// https://studres.cs.st-andrews.ac.uk/CS5003/Lectures/W07/CS5003%20W07%20pt2%20-%20Creating.pdf (accessed: 01/04/2022)

let userPasswordCollection = null;
let userDetailsCollection = null;
let favouriteRouteCollection = null;
let eventsCollection = null;
let joinedEventsCollection = null;
let rideCollection = null;
let athleteCollection = null;
let athleteSubscriptionCollection = null;
let clubCollection = null;
let clubMemberCollection = null;
// create variables to store MongoDB collections

const app = express(); 
const API_PORT = 3000;
// set up express and set API port variable

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))
// configure body-parser 

dotenv.config();
// bring environmental variables from .env files - they are added to process.env

process.env.TOKEN_SECRET;
// access environmental variables from process.env

var loggedIn = {};
// temporary storage of logged in users

var authorise = function (req, res, next) {
    var user = basicAuth(req);
    if (!user || loggedIn[user.name].password !== user.pass) {
        return res.sendStatus(401)
    }
    req.username = user.name;
    next();
};
// authorisation function - used to protect features requiring users to be logged on - compares details sent in fetch request to details stored in loggedIn object

const validateUserRegister = function (json) {
    if (!json.hasOwnProperty('userName')) {
        throw new Error("Missing userName");
    }
    if (!json.hasOwnProperty('password')) {
        throw new Error("Missing password");
    }
    if (!json.hasOwnProperty('city')) {
        throw new Error("Missing city");
    }
    if (!json.hasOwnProperty('country')) {
        throw new Error("Missing country");
    }
    if (!json.hasOwnProperty('gender')) {
        throw new Error("Missing gender");
    }
    return { userName: json.userName, password: json.password, country: json.country, city: json.city, gender: json.gender };
}
// ensures that user registration contains all required information

const validateUserLogin = function (json) {
    if (!json.hasOwnProperty('userName')) {
        throw new Error("Missing userName");
    }
    if (!json.hasOwnProperty('password')) {
        throw new Error("Missing password");
    }
    return { userName: json.userName, password: json.password };
}
// validates user details upon logging in 

const validateRoute = function (json) {
    if (!json.hasOwnProperty('userName')) {
        throw new Error("Missing userName");
    }
    if (!json.hasOwnProperty('routeName')) {
        throw new Error("Missing route name");
    }
    if (!json.hasOwnProperty('routeStart')) {
        throw new Error("Missing start");
    }
    if (!json.hasOwnProperty('routeStop')) {
        throw new Error("Missing stop");
    }
    if (!json.hasOwnProperty('routeDetail')) {
        throw new Error("Missing detail");
    }
    return { userName: json.userName, routeName: json.routeName, start: json.routeStart, stop: json.routeStop, routeDetail: json.routeDetail };
}
// validates favourite route details upon submission

const validateRide = function (json) {
    if (!json.hasOwnProperty('userName')) {
        throw new Error("Missing userName");
    }
    if (!json.hasOwnProperty('rideID')) {
        throw new Error("Missing ID");
    }
    if (!json.hasOwnProperty('rideName')) {
        throw new Error("Missing Name");
    }
    if (!json.hasOwnProperty('rideDate')) {
        throw new Error("No Date");
    }
    if (json.rideDate == "") {
        throw new Error("Missing Date input"); // Making sure logged rides have non empty DATE !
    }
    return { userName: json.userName, rideID: json.rideID, rideName: json.rideName, rideDate: json.rideDate, rideTime: json.rideTime, rideDistance: json.rideDistance, rideSpeed: json.rideSpeed };
}
// validates favourite route details upon submission 

app.post('/register/', function (req, res, next) {
    let body = req.body;
    let user = validateUserRegister(body);
    userPasswordCollection.findOne({ userName: user.userName })
    // check if username already exists in collection 
        .then(doc => {
            if (doc != null) {
                res.status(400).json({ msg: `Could not register! User already exists!` });
            }
            // if user is found with same name, registration fails
            else {
                userDetailsCollection.insert({ userName: user.userName, country: user.country, city: user.city, gender: user.gender })
                userPasswordCollection.insertOne({ userName: user.userName, password: user.password })
                    .then(jsn => {
                        res.status(200).json({ msg: `You are now registered!` });
                    })
                // user details are inserted in one collection to create profile, and user password stored in separate collection for security purposes
            }
        })
});
// registers user with given details
// querying and inserting into databases: https://studres.cs.st-andrews.ac.uk/CS5003/Lectures/W07/CS5003%20W07%20pt3%20-%20Querying.pdf (accessed: 03/04/2022)

app.post('/login/', function (req, res, next) {
    let body = req.body;
    let user = validateUserLogin(body);
    userPasswordCollection.findOne({ userName: user.userName, password: user.password })
        // check if user has registered
        .then(doc => {
            if (doc != null) {
                loggedIn[user.userName] = { password: user.password };
                // add user details to loggedIn object
                res.status(200).json({ msg: `Welcome ${user.userName}`, userName: user.userName, password: user.password  });
            }
            else {
                res.status(400).json({ msg: `Username or password incorrect!`, userName: null, password: null });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({ msg: `Could not login!`, userName: null, password: null });
        });
});
// login endpoint

function validateParameter(value) {
    var checkedValue = String(value).length < 1 || value == undefined || value == "NA" ? { $exists: true } : value;
    return checkedValue
}
// checks value sent from client-side, whcih will be used in query. If value is null, 'All' or "NA", function returns JSON query to essntially disregard that parameter during search 
// $exists MongoDB operator: https://www.mongodb.com/docs/manual/reference/operator/query/exists/ (accessed: 05/04/2022)

app.post('/events', authorise, function (req, res, next) {
    const name = req.body.name;
    const region = req.body.region;
    let distance = req.body.distance;
    var query = { name: validateParameter(name), region: validateParameter(region), distance: validateParameter(distance) };
    // constructing MongoDB search query based on parameters taken from request body
    eventsCollection.find(query).toArray()
        .then(docs => {
            if (docs != null) {
                res.status(200).json(docs);
            }
        })
});
// get events endpoint based on search criteria

app.post('/joinEvent', authorise, function (req, res, next) {
    const eventName = req.body.eventName;
    const userName = req.body.userName;
    const joinedEvent = { userName: userName, eventName: eventName };
    joinedEventsCollection.findOne(joinedEvent)
        // check if event already joined
        .then(doc => {
            if (doc != null) {
                res.status(400).json({ msg: `You have already joined this event!` });
            }
            else {
                joinedEventsCollection.insertOne(joinedEvent)
                    .then(jsn => {
                        res.status(200).json({ msg: `You have now joined ${eventName}!` });
                    })
            }
        })
});
// join event endpoint

app.get('/clubs/:NAME', authorise, function (req, res, next) {
    const name = req.params.NAME;
    var query = { name: validateParameter(name) };
    clubCollection.find(query).toArray()
        .then(docs => {
            if (docs != null) {
                res.status(200).json(docs);
            }
        })
});
// get clubs

app.post('/joinClub', authorise, function (req, res, next) {
    const clubName = req.body.clubName;
    const userName = req.body.userName;
    const membership = { userName: userName, clubName: clubName };
    clubMemberCollection.findOne(membership)
        // check if already subscribed
        .then(doc => {
            if (doc != null) {
                res.status(400).json({ msg: `You are already a member of ${clubName}!` });
            }
            else {
                clubMemberCollection.insertOne(membership)
                    .then(jsn => {
                        res.status(200).json({ msg: `You are now a member of ${clubName}!` });
                    })
            }
        })
});
// join club endpoint 

app.post('/favouriteRoute/', authorise, function (req, res, next) {
    let body = req.body;
    let route = validateRoute(body);
    favouriteRouteCollection.findOne({ userName: route.userName, routeName: route.routeName })
        // check if routename already exists in personal favourites 
        .then(doc => {
            if (doc != null) {
                res.status(400).json({ msg: `Route name taken!` });
            }
            else {
                favouriteRouteCollection.insertOne(route)
                    .then(jsn => {
                        res.status(200).json({ msg: `Route ${route.routeName} added to favourites!` });
                    })
            }
        })
});
// Adds route to favourites database

app.post('/logRide/', function (req, res, next) {
    let body = req.body;
    let ride = validateRide(body); //Checks that imporant input is provided, than returns an object with all provided values.
    rideCollection.findOne({ rideID: ride.rideID})
    // check if ride Name already exists
        .then(doc => {
            if (doc != null) {
                res.status(400).json({ msg: `Cannot save ride! Ride already exists!` });
            }
            else {
                rideCollection.insert(ride) //Inserts ride object into rideCollection
                    .then(jsn => {
                        res.status(200).json({ msg: `Ride saved!` });
                    })
            }
        })
});
// Adds RIDE to ride database

app.get('/getRides/:USERNAME', function (req, res, next) {  
    let user = req.params.USERNAME
    rideCollection.find({ userName: user }).toArray()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(400).json({ msg: `Could not get any rides from ${userName}!` });
        })
});
//Gets UserName from front End and returns all objects in ridesCollection from that user

app.post('/deleteRide/', function (req, res, next) {
    let body = req.body;
    rideCollection.findOne({ rideID: body.id })
        // check if routename already exists in personal favourites 
        .then(doc => {
            if (doc != null) {
                rideCollection.deleteOne({ rideID: body.id })
                res.status(200).json({ msg: `Route deleted!` });
            }
            else {
                res.status(400).json({ msg: `Could not find route with id ${body}` });
            }
        })
});
 //Delete a specific ride from databse based on unique rideKey value

app.get('/getFavouriteRoutes/:USERNAME', authorise, function (req, res, next) {
    let userName = req.params.USERNAME
    favouriteRouteCollection.find({ userName: userName }).toArray()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({ msg: `Could not get favourited routes!` });
        })
});
// gets all routes favourited by specific user

app.post('/athletes', authorise, function (req, res, next) {
    const name = req.body.name;
    const nameArray = name.split(" ")
    const firstName = nameArray[0];
    const lastName = nameArray[1];
    const country = req.body.country;
    let gender = req.body.gender;
    var query = { firstname: validateParameter(firstName), lastname: validateParameter(lastName), country: validateParameter(country), gender: validateParameter(gender) };
    athleteCollection.find(query).toArray()
        .then(docs => {
            if (docs != null) {
                res.status(200).json(docs);
            }
        })
});
// get all 'athletes' who match query 

app.post('/subscribe', authorise, function (req, res, next) {
    const athleteName = req.body.athleteName;
    const userName = req.body.userName;
    const subscription = { userName: userName, athleteName: athleteName};
    athleteSubscriptionCollection.findOne(subscription)
        // check if already subscribed
        .then(doc => {
            if (doc != null) {
                res.status(400).json({ msg: `You have already subscribed to this athlete!` });
            }
            else {
                athleteSubscriptionCollection.insertOne(subscription)
                    .then(jsn => {
                        res.status(200).json({ msg: `You have now subscribed to ${athleteName}!` });
                    })
            }
        })
});
// subscribe to athlete endpoint 

app.use(express.static('content'));
// serve up static content

client.connect()
    // connect to mongodb server
.then(conn => {
    userPasswordCollection = client.db().collection(config.collection);
    userDetailsCollection = client.db().collection('userDetailsCollection');
    cycleStatsCollection = client.db().collection('cycleStats');
    favouriteRouteCollection = client.db().collection('favouriteRoute');
    eventsCollection = client.db().collection('eventsCollection');
    joinedEventsCollection = client.db().collection('joinedEventsCollection');
    clubCollection = client.db().collection('clubCollection');
    athleteCollection = client.db().collection('athleteCollection');
    athleteSubscriptionCollection = client.db().collection('athleteSubscriptionCollection');
    clubMemberCollection = client.db().collection('clubMemberCollection');
    rideCollection = client.db().collection('clubCollection');
    // create/fetch collections from remote database!
    console.log("Connected!", conn.s.url.replace(/:([^:@]{1,})@/, ':****@')) 
})
    .catch(err => { console.log(`Could not connect to ${url.replace(/:([^:@]{1,})@/, ':****@')}`, err); throw err; })
    
    .then(() => {
        clubCollection.drop()
            .then(() => console.log("club collection dropped!"));
        eventsCollection.drop()
            .then(() => console.log("events collection dropped!"));
        athleteCollection.drop()
            .then(() => console.log("athlete collection dropped!"));
    }

        )
    // dropping collection
    // drop collection: https://www.mongodb.com/docs/manual/reference/method/db.collection.drop/ (accessed: 06/04/2022)
    
    .then(() => {
        clubCollection.insertMany([
            {
                "name": "API-Metrow-Bodyby JR",
                "website": "http://www.apibikes.com/team"
            },
            {
                "name": "Brother U.K - Orientation Marketing",
                "website": "http://teamonform.com"
            },
            {
                "name": "ACambridge CC",
                "website": "http://www.CambridgeCC.org.uk"
            },
            {
                "name": "CC London",
                "website": "http://www.cc-london.com"
            },
            {
                "name": "CC Sudbury",
                "website": "http://www.cycleclubsudbury.com"
            },
            {
                "name": "Chelmer CC",
                "website": "http://www.bc-clubs.co.uk/chelmercc/"
            },
            {
                "name": "AColchester Rovers CC",
                "website": "http://wcolchesterrovers.apps-1and1.net/"
            },
            {
                "name": "Crest Cycling Club",
                "website": "http://www.crestcyclingclub.org.uk/"
            },
            {
                "name": "Cycle Club Ashwell (CCA)",
                "website": "http://www.ccashwell.com"
            },
            {
                "name": "Cycling Club Hackney",
                "website": "http://www.cyclingclubhackney.co.uk"
            },
            {
                "name": "DAP Cycling Club",
                "website": "http://en-gb.facebook.com/dapcycling/"
            },
            {
                "name": "Diss & District CC",
                "website": "http://www.disscc.com"
            },
            {
                "name": "East London Vélo",
                "website": "http://www.eastlondonvelo.com"
            },
            {
                "name": "Essex Roads CC",
                "website": "http://www.essexroads.com"
            },
            {
                "name": "Finchley Racing Team",
                "website": "http://www.finchleyracingteam.com"
            }
        ])
            .then(res => console.log("Data inserted with IDs", res.insertedIds))
            .catch(err => {
                console.log("Could not add data ", err.message);
            })
        eventsCollection.insertMany([
            {
                "name": "Central Park",
                "region": "UK",
                "distance": "2000",
                "date": "02 April",
                "price": 45
            },
            {
                "name": "Ridgeway Gravel X",
                "region": "UK",
                "distance": '200',
                "date": "03 April",
                "price": 45
            },
            {
                "name": "Dorset",
                "region": "UK",
                "distance": '4000',
                "date": "02 April",
                "price": 40
            },
            {
                "name": "C Peak Dictrict",
                "region": "UK",
                "distance": '1500',
                "date": "09-April",
                "price": 41
            },
            {
                "name": "UK's Hardest hundred",
                "region": "UK",
                "distance": '10000',
                "date": "10 April",
                "price": 45
            },
            {
                "name": "Haldon Heroic",
                "region": "UK",
                "distance": '900',
                "date": "11 April",
                "price": 49
            },
            {
                "name": "Sherwood Forest",
                "region": "UK",
                "distance": '1900',
                "date": "16 April",
                "price": 30
            },
            {
                "name": "Suffolk Gravel",
                "region": "UK",
                "distance": '1000',
                "date": "23 April",
                "price": 10
            },
            {
                "name": "The UKCE Classic",
                "region": "UK",
                "distance": '1900',
                "date": "24 April",
                "price": 100
            },
            {
                "name": "Women V Cancer",
                "region": "UK",
                "distance": '4000',
                "date": "29 April",
                "price": 17
            },
            {
                "name": "North Wales Gravel X",
                "region": "UK",
                "distance": '5000',
                "date": "30 April",
                "price": 45
            }
        ])
            .then(res => console.log("Data inserted with IDs", res.insertedIds))
            .catch(err => {
                console.log("Could not add data ", err.message);
            })
        athleteCollection.insertMany([
            {
                "id": 1,
                "firstname": "Marianne",
                "lastname": "Teutenberg",
                "city": "San Francisco",
                "country": "US",
                "gender": "F",
                "weight": 50,
                "bikes": [
                    {
                        "id": "b12345678987655",
                        "name": "EMC",
                        "distance": 2000
                    }
                ]
            },
            {
                "id": 2,
                "firstname": "cloa",
                "lastname": "Xedentolis",
                "city": "Edinburgh",
                "country": "UK",
                "gender": "M",
                "weight": 70,
                "bikes": [
                    {
                        "id": "b12345678987652",
                        "name": "LUCK",
                        "distance": 1004
                    }
                ]
            },
            {
                "id": 3,
                "firstname": "Sunny",
                "lastname": "Xongs",
                "city": "Edinburgh",
                "country": "UK",
                "gender": "F",
                "weight": 45,
                "bikes": [
                    {
                        "id": "b1234567898333",
                        "name": "Perple",
                        "distance": 1034
                    }
                ]
            },
            {
                "id": 4,
                "firstname": "Zen",
                "lastname": "dedeent",
                "city": "Chengdu",
                "country": "China",
                "gender": "M",
                "weight": 85,
                "bikes": [
                    {
                        "id": "b12345333387655",
                        "name": "Blue",
                        "distance": 399
                    }
                ]
            },
            {
                "id": 5,
                "firstname": "zoey",
                "lastname": "dennys",
                "city": "Paris",
                "country": "France",
                "gender": "M",
                "weight": 46,
                "bikes": [
                    {
                        "id": "b123456387655",
                        "name": "dog",
                        "distance": 455
                    }
                ]
            },
            {
                "id": 6,
                "firstname": "shine",
                "lastname": "Bennet",
                "city": "London",
                "country": "UK",
                "gender": "F",
                "weight": 51,
                "bikes": [
                    {
                        "id": "b1234527655",
                        "name": "catty",
                        "distance": 4551
                    }
                ]
            }
        ])
            .then(res => console.log("Data inserted with IDs", res.insertedIds))
            .catch(err => {
                console.log("Could not add data ", err.message);
            })

    })
// inserting values into database collection

.then(() => app.listen(API_PORT, () => console.log(`Listening on localhost: ${API_PORT}`)))
.catch(err => console.log(`Could not start server`, err))
// launch server on API port 3000