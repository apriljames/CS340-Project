function updateIngredient(id){
    $.ajax({
        url: '/ingredients',
        type: 'PUT',
        data: $('#update-ingredient').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

function hideEditModal(){
  var modal = document.getElementById("editRowModal");
  modal.style.display = "none";
};
