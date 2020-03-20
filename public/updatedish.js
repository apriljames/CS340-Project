function updateDish(id){
    $.ajax({
        url: '/dishes/' + id,
        type: 'PUT',
        data: $('#update-dish').serialize(),
        success: function(result){
            window.location.replace("../dishes");
        }
    })
};
