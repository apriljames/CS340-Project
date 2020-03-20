function deleteDish(id){
  $.ajax({
      url: '/dishes/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};
