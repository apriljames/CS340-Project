module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getDishes(res, mysql, context, complete){
        mysql.pool.query("SELECT dishID, name FROM Dishes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.dishes  = results;
            complete();
        });
    }

    function getChefs(res, mysql, context, complete){
        mysql.pool.query("SELECT chefID, fName, lName, dish FROM Chefs INNER JOIN Dishes ON dish = Dishes.dishID", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.chefs = results;
            console.log(results);
            complete();
        });
    }

    function getChefsWithNameLike(req, res, mysql, context, complete) {

          context.jsscripts = ["deletechef.js","searchchefs.js","selecteddish.js","addchef.js","updatechef.js"];
          //sanitize the input as well as include the % character
          var query = "SELECT chefID, fName, lName, dish FROM Chefs WHERE Chefs.fName LIKE " + mysql.pool.escape(req.params.s + '%');
          console.log(query)

          mysql.pool.query(query, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.chefs = results;
                complete();
            });
        }
    function getChef(res, mysql, context, id, complete){
            var sql = "SELECT chefID, fName, lName, dish FROM Chefs WHERE chefID = ?";
            var inserts = [id];
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.chefs = results[0];
                complete();
            });
        }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletechef.js","searchchefs.js","selecteddish.js","addchef.js","updatechef.js"];
        var mysql = req.app.get('mysql');
        getChefs(res, mysql, context, complete);
        getDishes(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('chefs', context);
            }

        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
        router.get('/search/:s', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["searchchefs.js"];
            var mysql = req.app.get('mysql');
            getChefsWithNameLike(req, res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('chefs', context);
                }
            }
        });

        /* Display one person for the specific purpose of updating people */

        router.get('/:id', function(req, res){
            callbackCount = 0;
            var context = {};
            context.jsscripts = ["deletechef.js","searchchefs.js","selecteddish.js","addchef.js","updatechef.js"];
            var mysql = req.app.get('mysql');
            getChef(res, mysql, context, req.params.id, complete);
            getDishes(res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 2){
                   res.render('update-chef', context);
                }

            }
        });

        /* Adds a person, redirects to the people page after adding */

        router.post('/', function(req, res){
            console.log(req.body)
            var mysql = req.app.get('mysql');
            var sql = "INSERT INTO Chefs (fName, lName, dish) VALUES (?,?,?)";
            var inserts = [req.body.fname, req.body.lname, req.body.dish];
            sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                if(error){
                    console.log(JSON.stringify(error))
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    res.redirect('/chefs');
                }
            });
        });

        /* The URI that update data is sent to in order to update a person */

        router.put('/:id', function(req, res){
            var mysql = req.app.get('mysql');
            console.log(req.body)
            console.log(req.params.id)
            var sql = "UPDATE Chefs SET fName = ?, lName = ?, dish = ? WHERE chefID = ?";
            var inserts = [req.body.fname, req.body.lname, req.body.dish, req.params.id];
            sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                if(error){
                    console.log(error)
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    res.status(200);
                    res.end();
                }
            });
        });

        /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

        router.delete('/:id', function(req, res){
            var mysql = req.app.get('mysql');
            var sql = "DELETE FROM Chefs WHERE chefID = ?";
            var inserts = [req.params.id];
            sql = mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    console.log(error)
                    res.write(JSON.stringify(error));
                    res.status(400);
                    res.end();
                }else{
                    res.status(202).end();
                }
            })
        })

    return router;
}();
