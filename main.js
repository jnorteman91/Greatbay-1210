var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 9498,

    user: "root",

    password: "root",
    database: "greatbay_db"
});

connection.connect(function(err) {
    if (err) throw err;

    start();
});

function start() {
    inquirer
        .prompt({
            name: "postOrBid",
            type: "rawlist",
            message: "Please [POST] an auction or [BID] ono an auction.",
            choices: ["POST", "BID"]
        })
        .then(function(answer) {
            if (answer.postOrBid.toUppperCase() === "POST") {
                postAuction();
            }
            else {
                bidAuction();
            }
        });
}