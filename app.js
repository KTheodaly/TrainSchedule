var config = {
    apiKey: "AIzaSyA1aIjY6vE9UOIOtMx31nIq_8b-Vu5zdivw",
    authDomain: "trainschedule-ed82c.firebaseapp.com",
    databaseURL: "https://trainschedule-ed82c.firebaseio.com",
    projectId: "trainschedule-ed82c",
    storageBucket: "trainschedule-ed82c.appspot.com",
    messagingSenderId: "967186088183"
};
firebase.initializeApp(config);

// references firebase
var database = firebase.database(),

    name = name,
    trainName = trainName,
    destination = destination,
    time = time,
    frequency = frequency,
    nextTrain = nextTrain,
    minutesAway = minutesAway;

$("#submit").on("click", function (event) {
    event.prevendivefault();
    computeValues();
});

function computeValues() {
    trainName = $("#trainName").val().trim();
    destination = $("#destination").val().trim();
    time = $("#time").val().trim();
    frequency = $("#frequency").val().trim();

    // adds a zero to times with one digit so they will be military time I think
    if (time.match(/\D/).index === 1) {
        time = "0" + time;
    }


    var timeRightNow = moment().format("YYYY-MM-DD HH:mm"),
        // convert time entered to match current time format
        formattedTime = moment().format("YYYY-MM-DD") + " " + time;

    // Set variable with next train time and format 0 to midnight
    function nextTrainTime() {
        nextTrain = moment(formattedTime).format("HH:mm A");
        if (nextTrain === "00:00 AM") {
            nextTrain = "12:00 AM";
        }
    }

    // Calculate next arrival
    if (formattedTime > timeRightNow) {
        nextTrain = time;
        minutesAway = moment(formattedTime).diff(moment(timeRightNow), "minutes");
        nextTrainTime();
    }
    else {
        while (formattedTime < timeRightNow) {

            var incrementTime = moment(formattedTime).add(frequency, "minutes"),
                newTime = moment(incrementTime._d).format("YYYY-MM-DD HH:mm");
            formattedTime = newTime;
        }
        nextTrainTime();
        // Set variable with difference of next train and current time
        minutesAway = moment(formattedTime).diff(moment(timeRightNow), "minutes");
    }

    // Convert minutesAway to military time
    if (minutesAway > 60) {
        if (minutesAway % 60 === 0) { //60 cause of hours
            minutesAway = Math.floor(minutesAway / 60) + " hours"
        }
        else {
            minutesAway = Math.floor(minutesAway / 60) + "h " + minutesAway % 60 + "m";
        }
    }
    else {
        minutesAway = minutesAway + " minutes";
    }

    // Change frequency to military
    if (frequency > 60) {
        if (frequency % 60 === 0) {
            frequency = Math.floor(frequency / 60) + " hours"
        }
        else {
            frequency = Math.floor(frequency / 60) + "h " + frequency % 60 + "m";
        }
    }
    else {
        frequency = frequency + " minutes";
    }

    // Push to database
    database.ref().push({
        trainName: trainName,
        destination: destination,
        frequency: frequency,
        nextTrain: nextTrain,
        minutesAway: minutesAway
    });
}
//Append values to be displayed on my table
database.ref().on("child_added", function (childSnapshot) {

    $("#trainSchedule").append('<div class="container">' + 
        '<div class="row">' + 
        '<div class="col-lg-1"></div>' +
        '<div class="col-lg-2"><div class="grid">' + childSnapshot.val().trainName + '</div>' + '</div>' +
        '<div class="col-lg-2"><div class="grid">' + childSnapshot.val().destination + '</div>' + '</div>' +
        '<div class="col-lg-2"><div class="grid">' + childSnapshot.val().frequency + '</div>' + '</div>' +
        '<div class="col-lg-2"><div class="grid">' + childSnapshot.val().nextTrain + '</div>' + '</div>' +
        '<div class="col-lg-2"><div class="grid">' + childSnapshot.val().minutesAway + '</div>' + '</div>' +
        '<div class="col-lg-1"></div>' +
        '</div></div>' 
    );

});