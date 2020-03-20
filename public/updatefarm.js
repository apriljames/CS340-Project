function updateFarm(id){
    $.ajax({
        url: '/farms/' + id,
        type: 'PUT',
        data: $('#update-farm').serialize(),
        success: function(result){
            window.location.replace("../farms");
        }
    })
};
