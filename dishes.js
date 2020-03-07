module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getDishes(res, mysql, context, complete){
        mysql.pool.query("SELECT dishID, name, cost, description FROM Dishes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.dishes  = results;
            complete();
        });
    }

    function getIngredients(res, mysql, context, id, complete){
        var sql = "SELECT name FROM Dishes INNER JOIN Ingredients_in_Dishes ON Ingredients_in_Dishes.dishID = Dishes.dishID INNER JOIN Ingredients ON Ingredients_in_Dishes.ingID = Ingredients.ingID WHERE dishID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.ingredients = results;
            complete();
        });
    }

    function getDishesWithNameLike(req, res, mysql, context, complete) {
          //sanitize the input as well as include the % character
           var query = "SELECT Dishes.dishID as id, name, cost, description FROM Dishes WHERE Dishes.name LIKE " + mysql.pool.escape(req.params.s + '%');
          console.log(query)

          mysql.pool.query(query, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.dishes = results;
                complete();
            });
        }

    function getDish(res, mysql, context, id, complete){
            var sql = "SELECT dishID as id, name, cost, description FROM Dishes WHERE dishID = ?";
            var inserts = [id];
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.dishes = results[0];
                complete();
            });
        }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getDishes(res, mysql, context, complete);
        getIngredients(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('dishes', context);
            }

        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
        router.get('/search/:s', function(req, res){
            var callbackCount = 0;
            var context = {};
            //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
            var mysql = req.app.get('mysql');
            getDishesWithNameLike(req, res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('dishes', context);
                }
            }
        });

        /* Display one person for the specific purpose of updating people */

        router.get('/:id', function(req, res){
            callbackCount = 0;
            var context = {};
            //context.jsscripts = ["selectedplanet.js", "updateperson.js"];
            var mysql = req.app.get('mysql');
            getDish(res, mysql, context, req.params.id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                   res.render('dishes', context);
                }

            }
        });

        /* Adds a person, redirects to the people page after adding */

        router.post('/', function(req, res){
            console.log(req.body)
            var mysql = req.app.get('mysql');
            var sql = "INSERT INTO Dishes (name, cost, description) VALUES (?,?,?)"; // NEEDS ANOTHER QUERY TO INSERT INTO RELATIONSHIP TABLE
            var inserts = [req.body.name, req.body.cost, req.body.description];
            sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                if(error){
                    console.log(JSON.stringify(error))
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    res.redirect('/dishes');
                }
            });
        });

        /* The URI that update data is sent to in order to update a person */

        router.put('/:id', function(req, res){
            var mysql = req.app.get('mysql');
            console.log(req.body)
            console.log(req.params.id)
            var sql = "UPDATE Dishes SET name=?, cost=?, description=? WHERE dishID=?"; // NEEDS ANOTHER QUERY TO UPDATE RELATIONSHIP TABLE
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
            var sql = "DELETE FROM Dishes WHERE dishID = ?"; // NEEDS ANOTHER QUERY TO DELETE FROM RELATIONSHIP TABLE
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