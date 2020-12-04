document.addEventListener('DOMContentLoaded', function() {
        
    document.querySelector('#post').addEventListener('click', () => post_post());
    
    load_posts();
});


function load_posts() {
    
    fetch('/show')
    .then(response => response.json())
    .then(posts => {
        data = posts;
        
        console.log(data);
    });
}

function post_post() {
    
    const post = document.querySelector('#id_comment').value;

    fetch('/post', {
        method: 'POST', 
        body: JSON.stringify({
          "comment": post
        })
      })
      .then(response => response.json())
      .then(result => {
        //Print result
        console.log(result);
    
      });
      
}