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

    function getIngredients(res, mysql, context, complete){
        mysql.pool.query("SELECT ingID, name FROM Ingredients", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.ingredients = results;
            complete();
        });
    }

    function getIngredientsForDish(res, mysql, id, context, complete){
        var sql = "SELECT Ingredients.name as iname FROM Ingredients_In_Dishes INNER JOIN Ingredients ON Ingredients_In_Dishes.ingID = Ingredients.ingID INNER JOIN Dishes on Ingredients_In_Dishes.dishID = Dishes.dishID WHERE Ingredients_In_Dishes.dishID = ?"
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.ingredientslist = results;
            complete();
        });
    }

    function getDishesWithNameLike(req, res, mysql, context, complete) {
          //sanitize the input as well as include the % character
           var query = "SELECT Dishes.dishID, name, cost, description FROM Dishes WHERE Dishes.name LIKE " + mysql.pool.escape(req.params.s + '%');
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
            var sql = "SELECT dishID, name, cost, description FROM Dishes WHERE dishID = ?";
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
        context.jsscripts = ["deletedish.js","searchdishes.js","adddish.js","updatedish.js","viewingredients.js"];
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
            context.jsscripts = ["deletedish.js","searchdishes.js","adddish.js","updatedish.js","viewingredients.js"];
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
            context.jsscripts = ["updatedish.js", "viewingredients.js"];
            var mysql = req.app.get('mysql');
            getDish(res, mysql, context, req.params.id, complete);
            getIngredients(res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 2){
                   res.render('update-dish', context);
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
/*
            var mysql = req.app.get('mysql');
            var sql = "INSERT INTO Ingredients_In_Dishes (name, cost, description) VALUES (?,?,?)"; // NEEDS ANOTHER QUERY TO INSERT INTO RELATIONSHIP TABLE
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
            */
        });

        /* The URI that update data is sent to in order to update a person */

        router.put('/:id', function(req, res){
            var mysql = req.app.get('mysql');
            console.log(req.body)
            console.log(req.params.id)
            var sql = "UPDATE Dishes SET name=?, cost=?, description=? WHERE dishID=?"; // NEEDS ANOTHER QUERY TO UPDATE RELATIONSHIP TABLE
            var inserts = [req.body.name, req.body.cost, req.body.description, req.params.id];
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

        /* Route to view a dishes ingredients */
        router.get('/ingredientslist/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["deletedish.js","searchdishes.js","adddish.js","updatedish.js","viewingredients.js"];
            var mysql = req.app.get('mysql');
            getIngredientsForDish(res, mysql, req.params.id, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('view-ingredients', context);
                }
            }
        });


    return router;
}();
