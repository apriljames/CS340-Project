module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getFarms(res, mysql, context, complete){
        mysql.pool.query("SELECT farmID, name, location FROM Farms", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.farms  = results;
            complete();
        });
    }

    function getFarmsWithNameLike(req, res, mysql, context, complete) {
          //sanitize the input as well as include the % character
           var query = "SELECT Farms.farmID, name, location FROM Farms WHERE Farms.name LIKE " + mysql.pool.escape(req.params.s + '%');
          console.log(query)

          mysql.pool.query(query, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.farms = results;
                complete();
            });
        }

    function getFarm(res, mysql, context, id, complete){
            var sql = "SELECT farmID, name, location FROM Farms WHERE farmID = ?";
            var inserts = [id];
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.farms = results[0];
                complete();
            });
        }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletefarm.js","searchfarms.js","addfarm.js","updatefarm.js"];
        var mysql = req.app.get('mysql');
        getFarms(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('farms', context);
            }

        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
        router.get('/search/:s', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["deletefarm.js","searchfarms.js","addfarm.js","updatefarm.js"];
            var mysql = req.app.get('mysql');
            getFarmsWithNameLike(req, res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('farms', context);
                }
            }
        });

        /* Display one person for the specific purpose of updating people */

        router.get('/:id', function(req, res){
            callbackCount = 0;
            var context = {};
            context.jsscripts = ["updatefarm.js"];
            var mysql = req.app.get('mysql');
            getFarm(res, mysql, context, req.params.id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                   res.render('update-farm', context);
                }

            }
        });

        /* Adds a person, redirects to the people page after adding */

        router.post('/', function(req, res){
            console.log(req.body)
            var mysql = req.app.get('mysql');
            var sql = "INSERT INTO Farms (name, location) VALUES (?,?)";
            var inserts = [req.body.name, req.body.location];
            sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                if(error){
                    console.log(JSON.stringify(error))
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    res.redirect('/farms');
                }
            });
        });

        /* The URI that update data is sent to in order to update a person */

        router.put('/:id', function(req, res){
            var mysql = req.app.get('mysql');
            console.log(req.body)
            console.log(req.params.id)
            var sql = "UPDATE Farms SET name=?, location=? WHERE farmID=?";
            var inserts = [req.body.name, req.body.location, req.params.id];
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
            var sql = "DELETE FROM Farms WHERE farmID = ?";
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
