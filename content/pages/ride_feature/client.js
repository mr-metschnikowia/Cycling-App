/* This JS file defines and holds all the functionality for users to log a ride and summarise their rides visually. 
It incorporates full front end and back end to the MongoDB server. 
We attribute credit to Full Calendar for the calendar template and Plotly for the visualizations.*/

var rideID;

//Call the main function encompassing all other functions to run the feature.
main();

//Declare the main function containing all other functions required to run the feature.
function main() {

    //declare all variables and arrays required
    let rName,
        rDate,
        rRoute,
        rDistance,
        rTime,
        rCycle,
        rSpeed,
        calendar,
        arr = [],
        rides = [],
        fVal,
        x = [],
        y = [],
        userInfo = null,
        // distanceGoal,
        // timeGoal,
        // countGoal,
        // speedGoal,
        // dGoal = [],
        // tGoal = [],
        // cGoal = [],
        // sGoal = [],
        // goalVal = [],
        // goalValue,
        // goalPeriod,
        filteredRides = [];

    /*load all functions that need to be loaded first 
    including listeners, initialising a calendar object, 
    loading entries from the database and rendering
    these existing entries from the database onto the database. */
    getUserInfo()
    addListeners();
    initCalendar();
    renderRows(rides);
    load();
    // deleteALL();

    //set up all listeners for buttons and assign functions on button click
    function addListeners() {
        document.getElementById('addEntry').addEventListener('click', isEmpty);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('deleteEntry').addEventListener('click', deleteEntry);
        document.getElementById("calendarView").addEventListener('click', calendarView);
        document.getElementById("summary").addEventListener('click', summary);
        document.getElementById("logout").addEventListener('click', logout);
    }

    // async function deleteALL() {  //Deletes all data from the database Collection
    //     let response = await fetch(`/deleteALL`, {method: 'POST', headers: { 'Content-Type': 'application/json' }, Authorization: "Basic "})
    //     .then(response => response.text())
    //     .then(res => console.log("Deleted", res))
    // }


    function getUserInfo() {
        if (window.localStorage.getItem("userInfo")) {
            userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
            document.querySelector("#user-info-wrapper").style.display = 'flex'
            document.querySelector("#avatar").innerHTML = userInfo.userName[0].toUpperCase()
            document.querySelector("#userName").innerHTML = userInfo.userName
        } else {
            alert("Please Log in first!")
            document.querySelector("#user-info-wrapper").style.display = 'none'
            window.location.href = "../index/index.html"

        }
    }
    function logout() {
        window.localStorage.removeItem("userInfo")
        window.location.href = "../index/index.html"
    }
    //initialize calendar and create new calendar object
    function initCalendar() {
        var calendarEl = document.getElementById('calendar');

        //set up calendar configurations and trigger functions according to button clicks.
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialDate: new Date(),
            initialView: 'dayGridMonth',
            contentHeight: 400,
            editable: true,
            customButtons: {
                addRide: {
                    text: 'Log a Ride',
                    click: renderEntry,
                }
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'addRide dayGridMonth,timeGridWeek'
            },
            //set up separate array to track calendar events on the front end (Front-End)
            events: arr,
            //if an event in the calendar is clicked, get the event ID and triggar a modal pop up
            //deleteEntry is just to keep track of the event ID incase of a delete to remove from the front end
            eventClick: function (info) {
                var eventObj = info.event;
                if (eventObj.id) {
                    renderRow(eventObj.id);
                    deleteEntry(eventObj.id);
                }
            },
            eventBackgroundColor: "#cfbf8f",
            eventBorderColor: "#3e7786",
        });

        calendar.render();
    }


    //Front end display for the pop up. All values are reset and the count increments with every entry added.
    function renderEntry() {
        const modal = document.getElementById('myModal')
        modal.style.display = "block";
        var btn = document.getElementById('addEntry');
        btn.style.display = "block";
        resetValues();
    }

    //On 'save', checks if all input values are empty or not. Only trigger an entry add if inputs have values. 
    function isEmpty() {
        // $('.form-row input').each(function () {
        //     if (!$(this).val()) {
        //         $(this).addClass("error");
        //         empty = true;
        //         // $('.form-row input').css('border-color', 'red');
        //     } else {
        //         $(this).removeClass("error");
        addEntry();
    }
    //     });
    // }

    //get values from input fields and stores them in back-end and then display in front-end
    function addEntry() {
        rName = document.getElementById("rideName").value;
        rDate = document.getElementById("date").value;
        rRoute = document.getElementById("route").value;
        rDistance = document.getElementById("distance").value;
        rTime = document.getElementById("time").value;
        rCycle = document.getElementById("cycle").value;
        //Calculate speed based on distance and time entered.
        rSpeed = (rDistance / rTime).toFixed(2);

        //set up unique ID for each ride
        rideID = _uuid();
        userInfo = JSON.parse(window.localStorage.getItem("userInfo"))

        let databaseArray = ({
            userName: userInfo.userName,
            rideID: rideID,
            rideName: document.getElementById("rideName").value,
            rideDate: document.getElementById("date").value,
            rideRoute: document.getElementById("route").value,
            rideDistance: document.getElementById("distance").value,
            rideTime: document.getElementById("time").value,
            rideCycle: document.getElementById("cycle").value,
            rideSpeed: (document.getElementById("distance").value / document.getElementById("time").value).toFixed(2)
        })


        logRide(); //Fetch function to send ride-info to database once input is given and "Save changes is clicked"
        async function logRide() {
            userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
            let userKey = userInfo.userKey //Database checks if userKey exists already and will block adding the ride if it had the same userKey
            let response = await fetch(`/logRide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, Authorization: "Basic " + userKey, body: JSON.stringify(databaseArray) })
                .then(response => response.text())
            location.reload();
        }

        //calculate speed based on distance and time then display.
        document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px">${rSpeed} KM/min</p>`
        rideID = _uuid();

        //checks if the entry exists in the array.
        var isAlreadyExistingRide = rides.filter(item => item.id == rideID)[0];

        //checks if an entry with the same name exists in the array
        var isExistingName = rides.filter(item => item.name == rName)[0];

        //if the entry exists already, user is trying to update the information.
        if (isAlreadyExistingRide) {
            //create temp array to push objects from original array
            var newRides = [];
            for (const ride of rides) {
                if (ride.id == rideID) {
                    //if ride exists using ride.ID then update in array and in database
                    newRides.push(
                        {
                            id: rideID,
                            name: rName,
                            date: rDate,
                            route: rRoute,
                            distance: rDistance,
                            time: rTime,
                            type: rCycle,
                            speed: rSpeed,
                        });

                    //api call.

                    //validation to make sure id is not null
                    if (ride.id != "" || ride.id != null) {
                        //remove unedited event from calendar
                        var event = calendar.getEventById(ride.id);
                        event.remove();
                        //add edited event to calendaar
                        addEvent({
                            id: rideID,
                            title: rName,
                            start: rDate,
                        });
                    }
                    //if no match in the array, keep iterating
                } else {
                    newRides.push(ride);
                }
            } rides = newRides;
        } else {
            //if not an existing ride, add a new ride.
            rides.push({
                id: rideID,
                name: rName,
                date: rDate,
                route: rRoute,
                distance: rDistance,
                time: rTime,
                type: rCycle,
                speed: rSpeed,
            });

            //add ride as an event to display on the front end of the calendar
            addEvent({
                id: rideID,
                title: rName,
                start: rDate,
            });
        }

        //stores full array in local storage.
        save();

        const modal = document.getElementById('myModal')
        modal.style.display = "none";

    }

    //When a new ride is going to be logged, ensure all input fields are reset first.
    function resetValues() {
        document.getElementById("rideName").value = "";
        document.getElementById("date").value = "";
        document.getElementById("route").value = "";
        document.getElementById("distance").value = "";
        document.getElementById("time").value = "";
        document.getElementById("cycle").value = "";
        document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px"></p>`;
    }

    //save full array containing all ride objects to local storage
    function save() {
        let stringified = JSON.stringify(rides);
        localStorage.setItem("rides", stringified);

    }

    //on window load, get rides array from local storage and render them on the front end
    async function load() {
        let userInfo = JSON.parse(window.localStorage.getItem("userInfo"))//Username is taken from local storage where it resides for the time of a Login of a User
        let userKey = userInfo.userKey
        let USERNAME = userInfo.userName //USERNAME is defining element. Bacckend will look for all entries with this username.
        let response = await fetch(`/getRides/${USERNAME}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, Authorization: "Basic " + userKey })
            .then(response => response.text())

        oldRides = JSON.parse(response);


        //if the ridies array is null, user has not logged any rides so create new array
        if (rides == null) {
            rides = [];
        } else {
            //if rides exist in database, redraw them onto front end on window load
            renderRows(oldRides);
        }
    }

    //add event to calendar
    function addEvent(event) {
        calendar.addEvent(event);
    }

    //close the modal
    function close() {
        const modal = document.getElementById('myModal')
        modal.style.display = "none";
    }

    //function to create unique id for each ride
    function _uuid() {
        var d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    //on page load when the array is retrieved from storage, render all of them to the calendar
    function renderRows(rides) {

        for (const a of rides) {
            addEvent({
                id: a.rideID,
                title: a.rideName,
                start: a.rideDate,
            });
        }
    }

    //when event on calendar is clicked, identify which event is clicked and display pop up with associated object values.

    function renderRow(id) {
        for (const ride of rides) { //Look into localStorage
            if (ride.id == id) {
                const modal = document.getElementById('myModal')
                modal.style.display = "block";
                var btn = document.getElementById('addEntry');
                btn.style.display = "none";
                document.getElementById("rideName").value = ride.name;
                document.getElementById("date").value = ride.date;
                document.getElementById("route").value = ride.route;
                document.getElementById("distance").value = ride.distance;
                document.getElementById("time").value = ride.time;
                document.getElementById("cycle").value = ride.type;
                document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px">${ride.speed} KM/min</p>`;
            }
        }
        for (const ride of oldRides) { //Database array is iterated according to rideID which was clicked and specific input displayed.
            if (ride.rideID == id) {

                const modal = document.getElementById('myModal')
                modal.style.display = "block";

                document.getElementById("rideName").value = ride.rideName;
                document.getElementById("date").value = ride.rideDate;
                document.getElementById("route").value = ride.rideRoute;
                document.getElementById("distance").value = ride.rideDistance;
                document.getElementById("time").value = ride.rideTime;
                document.getElementById("cycle").value = ride.rideCycle;
                document.getElementById("speed").innerHTML = `<p style="margin: 3px 3px 3px 3px">${ride.rideSpeed} KM/min</p>`;
            }
        }
    }

    async function deleteRide(ID) { //Fetch function to delete ride. Function deleteEntry() with evenlistener on "delete" button is calling this fetch
        let response = await fetch(`/deleteRide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, Authorization: "Basic ", body: JSON.stringify(ID) }) // array with ID value will be deleted from database
            .then(response => response.text())
        location.reload();
    }

    //detect when event is deleted, remove from array and update local storage. remove from calendar.
    function deleteEntry(id) {
        document.getElementById('deleteEntry').addEventListener('click', function () {
            var event = calendar.getEventById(id);
            var ID = ({ id: event.id })
            deleteRide(ID)// get ID from accessed event and send delete call to database for this ID
            var ID = ({ id: event })

            for (let i = 0; i < rides.length; i++) {
                if (rides[i].id == id) {
                    rides.splice(i, 1);
                    var event = calendar.getEventById(id);
                    event.remove();
                }
            }
            save();
            const modal = document.getElementById('myModal')
            modal.style.display = "none";
        });
    }
    //toggle between different tabs
    function calendarView() {
        var calendar = document.getElementById("calendar");
        calendar.style.display = "block";
        var summary = document.getElementById("summaryVis");
        summary.style.display = "none";
    }

    //Display visualisations 
    function summary() {
        var calendar = document.getElementById("calendar");
        calendar.style.display = "none";
        summaryVis();
    }

    //Add event listener to identify which filter values have been clicked to trigger summary visualisation
    function summaryVis() {
        var summary = document.getElementById("summaryVis");
        summary.style.display = "block";

        document.getElementById("filter").addEventListener("change", function () {
            fVal = document.getElementById("filter").value;
        });

        document.getElementById("submit").addEventListener("click", function () {
            //create arrays to store x-axis and y-axis values
            x = [];
            y = [];

            //if specific filter value has been clicked, get those attributes from the rides array and push to the y-axis array
            //the x-axis arrays will remain constant and contain only the dates for each ride logged
            if (fVal === 'Total Distance') {
                for (let i = 0; i < oldRides.length; i++) {
                    y.push(oldRides[i].rideDistance);
                    x.push(oldRides[i].rideDate);

                    // if (oldRides[i].distanceGoal != "") {
                    //     dGoal.push(oldRides[i].distanceGoal)
                    // } else {
                    //     oldRides[i].distanceGoal === "";
                    // }
                }

                plotVis(x, y, 'Total Distance', 'Distance (KM)');
                // renderGoal();

                // if (oldRides.some(e => e.distanceGoal === "")) {
                //     plotVis(x, y, 'Total Distance', 'Distance (KM)');
                //     renderGoal();
                // } else {
                //     plotExistingGoals(x, y, dGoal, 'Total Distance', 'Distance (KM)')
                //     renderGoal();
                // }

                //after triggering function to plot the visualisation, reset x-axis and y-axis values for future reuse.
                x = [];
                y = [];

            } else if (fVal === 'Total Minutes') {
                for (let i = 0; i < oldRides.length; i++) {
                    y.push(oldRides[i].rideTime);
                    x.push(oldRides[i].rideDate);

                    //     if (oldRides[i].timeGoal != "") {
                    //         tGoal.push(oldRides[i].timeGoal)
                    //     } else {
                    //         oldRides[i].timeGoal === "";
                    //     }
                    // }

                    plotVis(x, y, 'Total Time Cycling', 'Minutes');
                    // renderGoal();

                    // if (oldRides.some(e => e.timeGoal === "")) {
                    //     plotVis(x, y, 'Total Time Cycling', 'Minutes');
                    //     renderGoal();
                    // } else {
                    //     plotExistingGoals(x, y, tGoal, 'Total Time Cycling', 'Minutes')
                    //     renderGoal();
                    // }

                    x = [];
                    y = [];
                }

            } else if (fVal === 'Total Logs') {

                for (let i = 0; i < oldRides.length; i++) {
                    x.push(oldRides[i].rideDate);
                }
                const count = x.filter((x, i, a) => a.indexOf(x) == i)
                var counter;

                for (let i = 0; i < oldRides.length; i++) {
                    counter = oldRides.filter((v) => (v.rideDate === count[i])).length;
                    y.push(counter);

                    // if (oldRides[i].countGoal != "") {
                    //     cGoal.push(oldRides[i].countGoal)
                    // } else {
                    //     oldRides[i].countGoal === "";
                    // }
                }

                plotLogsVis(x, y, 'Total Training Logged', 'Count');
                // renderGoal();

                // if (oldRides.some(e => e.countGoal === "")) {
                //     plotVis(x, y, 'Total Training Logged', 'Count');
                //     renderGoal();
                // } else {
                //     plotExistingGoals(x, y, cGoal, 'Total Training Logged', 'Count')
                //     renderGoal();
                // }

                x = [];
                y = [];

            } else if (fVal === 'Average Speed') {
                for (let i = 0; i < oldRides.length; i++) {
                    y.push(oldRides[i].rideSpeed);
                    x.push(oldRides[i].rideDate);

                    // if (oldRides[i].speedGoal != "") {
                    //     sGoal.push(oldRides[i].speedGoal)
                    // } else {
                    //     oldRides[i].speedGoal === "";
                    // }
                }

                plotVis(x, y, 'Average Speed', 'Speed (KM/Min)');
                // renderGoal();

                // if (oldRides.some(e => e.speedGoal === "")) {
                //     plotVis(x, y, 'Average Speed', 'Speed (KM/Min)');
                //     renderGoal();
                // } else {
                //     plotExistingGoals(x, y, sGoal, 'Average Speed', 'Speed (KM/Min)')
                //     renderGoal();
                // }

                x = [];
                y = [];
            }
        });

    };

    //function to plot the visualization based on x-axis and y-axis arrays with customised graph legends and labels according to filter value
    function plotVis(xValues, yValues, setTitle, ylabel) {

        //set up visualization configuration
        var config = {
            displaylogo: false,
        };

        //assign data values to be plotted and aggregation to be used
        var data = [{
            type: 'bar',
            x: xValues,
            y: yValues,
            mode: 'markers',
            marker: {
                color: 'rgba(255,153,51,0.7)',
                width: 1
            },
            transforms: [{
                type: 'aggregate',
                groups: xValues,
                aggregations: [
                    { target: 'y', func: 'sum', enabled: true }
                ]
            }]

        }];

        //set up layout of the visualization including graph background color and toggle buttons for different time range
        var layout = {
            clearable: true,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            title: setTitle,
            xaxis: {
                autorange: true,
                range: ['2022-01-01', '2022-12-31'],
                rangeselector: {
                    buttons: [
                        {
                            count: 1,
                            label: 'Month by Month',
                            step: 'year',
                            stepmode: 'backward'
                        }, {
                            count: 1,
                            label: 'Week by Week',
                            step: 'month',
                            stepmode: 'backward'
                        },
                        {
                            count: 7,
                            label: 'Day by Day',
                            step: 'day',
                            stepmode: 'backward'
                        },
                        { step: 'all' }
                    ]
                },
                rangeslider: {
                    range: ['2022-01-01', '2022-12-31'],
                    pad: { t: 10 },
                },
                type: 'date',
                title: 'Filter Date Range'
            },
            yaxis: {
                title: ylabel,
                autorange: true,
                type: 'linear'
            }

        };

        Plotly.newPlot('tester', data, layout, config);
    }

    //separate function for visualizing the count of rides log as opposed to the sum of object attributes such as distance, speed, duration
    function plotLogsVis(xValues, yValues, setTitle, ylabel) {

        var config = {
            displaylogo: false,
        };

        var data = [{
            type: 'bar',
            x: xValues,
            y: yValues,
            mode: 'markers',
            marker: {
                color: 'rgba(255,153,51,0.6)',
                width: 1
            },
            transforms: [{
                type: 'aggregate',
                groups: xValues,
                aggregations: [
                    { target: 'y', func: 'count', enabled: true }
                ]
            }]

        }];

        var layout = {
            title: setTitle,
            xaxis: {
                autorange: false,
                range: ['2022-01-01', '2022-12-31'],
                rangeselector: {
                    buttons: [
                        {
                            count: 1,
                            label: 'Month by Month',
                            step: 'year',
                            stepmode: 'backward'
                        }, {
                            count: 1,
                            label: 'Week by Week',
                            step: 'month',
                            stepmode: 'backward'
                        },
                        {
                            count: 7,
                            label: 'Day by Day',
                            step: 'day',
                            stepmode: 'backward'
                        },
                        { step: 'all' }
                    ]
                },
                rangeslider: {
                    range: ['2022-01-01', '2022-12-31'],
                    pad: { t: 10 },
                },
                type: 'date',
                autorange: true,
                title: 'Filter Date Range'
            },
            yaxis: {
                title: ylabel,
                autorange: true,
                dtick: 1,
                type: 'linear'
            }

        };

        Plotly.newPlot('tester', data, layout, config);
    }

    /* Function to plot goals based on filter values such as distance, speed, duration, and logged rides. 
    Deprecated since we were unable to integrate with MongoDB on time.
    */
    // function renderGoal() {
    //     var show = document.getElementById("goalVal");
    //     show.style.display = "block";
    //     getGoals();
    // }

    // function getGoals() {
    //     document.getElementById("submitGoal").addEventListener("click", function () {
    //         goalValue = document.getElementById("goalValue").value;

    //         if (fVal === 'Total Distance') {
    //             for (let i = 0; i < rides.length; i++) {
    //                 y.push(rides[i].distance);
    //                 x.push(rides[i].date);
    //             }

    //             rides.forEach(e => e.distanceGoal = goalValue);
    //             save();

    //             plotGoals(x, y, goalValue, 'Total Distance', 'Distance (KM)');

    //         } else if (fVal === 'Total Minutes') {
    //             for (let i = 0; i < rides.length; i++) {
    //                 y.push(rides[i].time);
    //                 x.push(rides[i].rides);
    //                 rides[i].timeGoal = goalValue;
    //             }

    //             rides.forEach(e => e.timeGoal = goalValue);
    //             save();

    //             plotGoals(x, y, goalValue, 'Total Time Cycling', 'Minutes');

    //         } else if (fVal === 'Total Logs') {
    //             for (let i = 0; i < oldRides.length; i++) {
    //                 // y.push[rides[i].date];
    //                 x.push(rides[i].ride);
    //             }
    //             const count = x.filter((x, i, a) => a.indexOf(x) == i)
    //             var counter;
    //             for (let i = 0; i < rides.length; i++) {
    //                 counter = rides.filter((v) => (v.date === count[i])).length;
    //                 y.push(counter);
    //             }

    //             oldRides.forEach(e => e.countGoal = goalValue);
    //             save();

    //             plotGoals(x, y, goalValue, 'Total Training Logged', 'Count');

    //         } else if (fVal === 'Average Speed') {
    //             for (let i = 0; i < rides.length; i++) {
    //                 y.push(rides[i].speed);
    //                 x.push(rides[i].date);
    //             }

    //             rides.forEach(e => e.speedGoal = goalValue);
    //             save();

    //             plotGoals(x, y, goalValue, 'Average Speed', 'Speed (KM/Min)');

    //         }

    //     });

    // }

    // function plotGoals(xValues, yValues, goalValue, setTitle, ylabel) {

    //     var config = {
    //         displaylogo: false,
    //     };

    //     var actuals = {
    //         x: xValues,
    //         y: yValues,
    //         name: 'Actual Value',
    //         marker: {
    //             color: 'rgba(255,153,51,0.6)',
    //             width: 1,
    //         },
    //         type: 'bar',
    //     }

    //     for (let i = 0; i < xValues.length; i++) {
    //         goalVal.push(goalValue);
    //     }

    //     var goal = {
    //         x: xValues,
    //         y: goalVal,
    //         name: 'Goal Value',
    //         type: 'scatter',
    //         marker: {
    //             color: 'rgba(58,200,225,.8)',
    //         }
    //     }

    //     var data = [actuals, goal]

    //     var layout = {
    //         plot_bgcolor: 'rgba(0,0,0,0)',
    //         paper_bgcolor: 'rgba(0,0,0,0)',
    //         barmode: 'overlay',
    //         title: setTitle,
    //         xaxis: {
    //             autorange: true,
    //             range: ['2022-01-01', '2022-12-31'],
    //             rangeselector: {
    //                 buttons: [
    //                     {
    //                         count: 1,
    //                         label: 'Month by Month',
    //                         step: 'year',
    //                         stepmode: 'backward'
    //                     }, {
    //                         count: 1,
    //                         label: 'Week by Week',
    //                         step: 'month',
    //                         stepmode: 'backward'
    //                     },
    //                     {
    //                         count: 7,
    //                         label: 'Day by Day',
    //                         step: 'day',
    //                         stepmode: 'backward'
    //                     },
    //                     { step: 'all' }
    //                 ]
    //             },
    //             rangeslider: {
    //                 range: ['2022-01-01', '2022-12-31'],
    //                 pad: { t: 10 },
    //             },
    //             type: 'date',
    //             title: 'Filter Date Range'
    //         },
    //         yaxis: {
    //             title: ylabel,
    //             autorange: true,
    //             type: 'linear'
    //         }

    //     };

    //     Plotly.newPlot('tester', data, layout, config);

    // };

    // function plotExistingGoals(xValues, yValues, goalVal, setTitle, ylabel) {

    //     var config = {
    //         displaylogo: false,
    //     };

    //     var actuals = {
    //         x: xValues,
    //         y: yValues,
    //         name: 'Actual Value',
    //         marker: {
    //             color: 'rgba(255,153,51,0.6)',
    //             width: 1,
    //         },
    //         type: 'bar',
    //     }

    //     var goal = {
    //         x: xValues,
    //         y: goalVal,
    //         name: 'Goal Value',
    //         type: 'scatter',
    //         marker: {
    //             color: 'rgba(58,200,225,.8)',
    //         }
    //     }

    //     var data = [actuals, goal]

    //     var layout = {
    //         plot_bgcolor: 'rgba(0,0,0,0)',
    //         paper_bgcolor: 'rgba(0,0,0,0)',
    //         barmode: 'overlay',
    //         title: setTitle,
    //         xaxis: {
    //             autorange: true,
    //             range: ['2022-01-01', '2022-12-31'],
    //             rangeselector: {
    //                 buttons: [
    //                     {
    //                         count: 1,
    //                         label: 'Month by Month',
    //                         step: 'year',
    //                         stepmode: 'backward'
    //                     }, {
    //                         count: 1,
    //                         label: 'Week by Week',
    //                         step: 'month',
    //                         stepmode: 'backward'
    //                     },
    //                     {
    //                         count: 7,
    //                         label: 'Day by Day',
    //                         step: 'day',
    //                         stepmode: 'backward'
    //                     },
    //                     { step: 'all' }
    //                 ]
    //             },
    //             rangeslider: {
    //                 range: ['2022-01-01', '2022-12-31'],
    //                 pad: { t: 10 },
    //             },
    //             type: 'date',
    //             title: 'Filter Date Range'
    //         },
    //         yaxis: {
    //             title: ylabel,
    //             autorange: true,
    //             type: 'linear'
    //         }

    //     };

    //     Plotly.newPlot('tester', data, layout, config);

    // };


}
