var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 9498,

    user: "root",

    password: "root",
    database: "greatbay_db"
});

connection.connect(function (err) {
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
        .then(function (answer) {
            if (answer.postOrBid.toUppperCase() === "POST") {
                postAuction();
            }
            else {
                bidAuction();
            }
        });
}

function postAuction() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the name of the item your are submitting?"
            },
            {
                name: "category",
                type: "input",
                message: "Which category will your item be placed in?"
            },
            {
                name: "startingBid",
                type: "input",
                message: "What is your starting bid?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO auctions SET ?",
                {
                    item_name: answer.item,
                    category: answer.category,
                    starting_bid: answer.startingBid,
                    highest_bid: answer.startingBid
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your auction was created successfully.");

                    start();
                }
            );
        });
}

function bidAuction() {
    connection.query("SELECT * FROM auctions", function (err, results) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].item_name);
                        }
                        return choiceArray;
                    },
                    message: "Name an auction you would like to bid in."
                },
                {
                    name: "bid",
                    type: "input",
                    message: "How much would you like to bid?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_name === answer.choice) {
                        chosenItem = results[i];
                    }
                }

                if (chosenItem.highest_bid < parseInt(answer.bid)) {
                    connection.query(
                        "UPDATE auctions SET ? WHERE ?",
                        [
                            {
                                highest_bid: answer.bid
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Bid placed.");
                            start();
                        }
                    );
                }
                else {
                    console.log("Your bid wass too low. Sorry try again.");
                    start();
                }
            });
    });
}