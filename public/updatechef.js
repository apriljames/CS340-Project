function updateChef(id){
    $.ajax({
        url: '/chefs/' + id,
        type: 'PUT',
        data: $('#update-chef').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

function hideEditModal(){
  var modal = document.getElementById("editRowModal");
  modal.style.display = "none";
};
