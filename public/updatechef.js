function updateChef(id){
    $.ajax({
        url: '/chefs/' + id,
        type: 'PUT',
        data: $('#update-chef').serialize(),
        success: function(result){
            window.location.replace("../chefs");
        }
    })
};
