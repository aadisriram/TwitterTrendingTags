/**
 * Created by aadisriram on 4/4/15.
 */

/**
 * Created by aadisriram on 1/10/15.
 */

var port = 3000;

var server_name = "http://localhost:" + port + "/";
var server = io.connect(server_name);

var trend = document.getElementById('trend');

trend.onclick = function() {

    server.emit("get-trending", "testing");
}

//socket listener
server.on("trending", function(msg) {

    $('#trending-list').empty();
    var ct = 0;
    for(var key in msg) {
        if(ct == 10)
            break;
        ct++;
        $('#trending-list').append('<li class="list-group-item">' +
            msg[key].name + ' ' +
            msg[key].val + '</li>');
    }
});

console.log('Client: Connecting to server ' + server_name);