document.addEventListener('DOMContentLoaded', function() {
    
    show_profile();
    
});


function show_profile() {
    
    let user = window.location.href.substr(22);
    
    fetch('/user')
    .then(response => response.json())
    .then(posts => {
      data = posts;
      
      console.log(data);
      
      //let mainContainer = document.getElementById("post-list");
      
    })
  }