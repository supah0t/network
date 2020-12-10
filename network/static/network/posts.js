document.addEventListener('DOMContentLoaded', function() {
        
    document.querySelector('#post').addEventListener('click', () => post_post());
    
    load_posts();

  });

function test() {
  console.log("test successful");
}

function load_posts() {
    
    fetch('/show')
    .then(response => response.json())
    .then(posts => {
        data = posts;
        
        let mainContainer = document.getElementById("post-list");
        
        console.log(data);
        
        for (let i=0; i<data.length; i++) {
          let div = document.createElement("div");
          div.className = "postList";
          
          div.innerHTML = `
            <table class="postTable">
            <tr><button class="username-button">${data[i].username}</button></tr>
            <tr><td><div class="gap-10"></div></td></tr>
            <tr><td>${data[i].comment}</td></tr>
            <tr><td class="timestamp">${data[i].timestamp}</td></tr>
            <tr><td>&#10084;&#65039; (Like count)</td> <td class="like-button"><button class="btn btn-danger btn-sm">Like</button></td></tr>
            </table>
          `
          
          div.querySelector(".username-button").addEventListener('click', () => window.location.href = `/${data[i].id}` );
          div.querySelector('.like-button').addEventListener('click', () => test());
          
          mainContainer.appendChild(div);
          
        }
        
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