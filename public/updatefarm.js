function updateFarm(id){
    $.ajax({
        url: '/farms',
        type: 'PUT',
        data: $('#update-farm').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

function hideEditModal(){
  var modal = document.getElementById("editRowModal");
  modal.style.display = "none";
};
