module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getIngredients(res, mysql, context, complete){
        mysql.pool.query("SELECT ingID, name, origin FROM Ingredients", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.ingredients  = results;
            complete();
        });
    }

    function getIngredientsWithNameLike(req, res, mysql, context, complete) {
          //sanitize the input as well as include the % character
           var query = "SELECT Ingredients.ingID as id, name, origin FROM Ingredients WHERE Ingredients.name LIKE " + mysql.pool.escape(req.params.s + '%');
          console.log(query)

          mysql.pool.query(query, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.ingredients = results;
                complete();
            });
        }

    function getingredient(res, mysql, context, id, complete){
            var sql = "SELECT ingID as id, name, origin FROM Ingredients WHERE ingID = ?";
            var inserts = [id];
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.ingredients = results[0];
                complete();
            });
        }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteIngredient.js","searchingredients.js"];
        var mysql = req.app.get('mysql');
        getIngredients(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('ingredients', context);
            }

        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
        router.get('/search/:s', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["deleteIngredient.js","searchingredients.js"];
            var mysql = req.app.get('mysql');
            getIngredientsWithNameLike(req, res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('ingredients', context);
                }
            }
        });

        /* Display one person for the specific purpose of updating people */

        router.get('/:id', function(req, res){
            callbackCount = 0;
            var context = {};
            context.jsscripts = ["updateingredient.js"];
            var mysql = req.app.get('mysql');
            getIngredient(res, mysql, context, req.params.id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                   res.render('ingredients', context);
                   var editModal = document.getElementById("editRowModal");
                   editModal.style.display = "block";
                }

            }
        });

        /* Adds a person, redirects to the people page after adding */

        router.post('/', function(req, res){
            console.log(req.body)
            var mysql = req.app.get('mysql');
            var sql = "INSERT INTO Ingredients (name, origin) VALUES (?,?)";
            var inserts = [req.body.name, req.body.origin];
            sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                if(error){
                    console.log(JSON.stringify(error))
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    res.redirect('/ingredients');
                }
            });
        });

        /* The URI that update data is sent to in order to update a person */

        router.put('/:id', function(req, res){
            var mysql = req.app.get('mysql');
            console.log(req.body)
            console.log(req.params.id)
            var sql = "UPDATE Ingredients SET name=?, origin=? WHERE ingID=?";
            var inserts = [req.body.name, req.body.origin, req.params.id];
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
            var sql = "DELETE FROM Ingredients WHERE ingID = ?";
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
