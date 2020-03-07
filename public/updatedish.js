function updateDish(id){
    $.ajax({
        url: '/dishes',
        type: 'PUT',
        data: $('#update-dish').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

function hideEditModal(){
  var modal = document.getElementById("editRowModal");
  modal.style.display = "none";
};
