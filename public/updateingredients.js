function updateIngredient(id){
    $.ajax({
        url: '/ingredients/' + id,
        type: 'PUT',
        data: $('#update-ingredient').serialize(),
        success: function(result){
            window.location.replace("../ingredients");
        }
    })
};
