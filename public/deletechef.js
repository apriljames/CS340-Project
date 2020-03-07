function deleteChef(id){
  $.ajax({
      url: '/chefs/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};
