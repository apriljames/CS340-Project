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
            complete();
        });
    }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getDishes(res, mysql, context, complete);
        getChefs(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('chefs', context);
            }

        }
    });

    return router;
}();
