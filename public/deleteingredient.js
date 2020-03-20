function deleteIngredient(id){
  $.ajax({
      url: '/ingredients/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};
