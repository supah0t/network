document.addEventListener('DOMContentLoaded', function() {
        
    document.querySelector('#post').addEventListener('click', () => post_post());
    document.querySelector('.following-menu').addEventListener('click', () => load_following_posts());
    
    load_posts();
    test_posts();

  });

function test() {
  console.log("test successful");
}

//Test function for paginated response handling, have to apply to every function now
function test_posts() {

  document.querySelector('#form-view').style.display = 'block';
  document.querySelector('#post-list').style.display = 'block';
  document.querySelector('#post-list').innerHTML = '';
  document.querySelector('#profile-view').style.display = 'none'; 
  document.querySelector('#profile-view').innerHTML = ''; 

  fetch('/test')
  .then(response => response.json())
  .then(posts => {    
    
    let buttonDiv = document.querySelector('#page-button');
    let buttonList = document.createElement('ul');
    buttonList.className = "pagination justify-content-center";
    buttonDiv.appendChild(buttonList);
    
    for (let i=0; i<posts.length; i++) {
      console.log(posts[i]);
      let button = document.createElement("li");
      button.className="page-item";
      button.id=`button${i}`
      button.innerHTML = `<p data-page="button${i}" class="page-link" href=" ">${i}</p>`;
      button.addEventListener('click', () => post_format(posts[i]));
      button.addEventListener('click', () => button_active(`button${i}`));
      buttonList.appendChild(button);
    }

  });
}

//Handles paginator buttons, indicated which one is selected
function button_active(button) {
  document.querySelectorAll('li[id^="button"]').forEach(thing => {
    thing.className = "page-item"
  });
  document.querySelector(`#${button}`).className += " active";
}

//Since we have uniform post_format function this just handles the display values of the app areas
function load_posts() {
    document.querySelector('#form-view').style.display = 'block';
    document.querySelector('#post-list').style.display = 'block';
    document.querySelector('#post-list').innerHTML = '';
    document.querySelector('#profile-view').style.display = 'none'; 
    document.querySelector('#profile-view').innerHTML = ''; 

    fetch('/show')
    .then(response => response.json())
    .then(posts => {
      post_format(posts);
    });
}

//Similar to load_posts(), only with posts from people the user follows
function load_following_posts() {
  document.querySelector('#form-view').style.display = 'block';
  document.querySelector('#post-list').style.display = 'block';
  document.querySelector('#post-list').innerHTML = '';
  document.querySelector('#profile-view').style.display = 'none'; 
  document.querySelector('#profile-view').innerHTML = ''; 

  fetch('/followed_posts')
  .then(response => response.json())
  .then(posts => {
    history.pushState('', 'Following', `/following`);
    post_format(posts);
  });
}

//Unoptimized profile view, GET request to server, server returns list in which list[0] is the profile info so I have to handle it differently from the rest of the list
function load_profile(id) {
    document.querySelector('#form-view').style.display = 'none';
    document.querySelector('#post-list').style.display = 'block';
    document.querySelector('#post-list').innerHTML = '';
    document.querySelector('#profile-view').style.display = 'block';   
    document.querySelector('#profile-view').innerHTML = '';
    
    history.pushState('', 'Profile', `/${id}`);
    console.log('Profile View');    
    fetch(`/${id}`)
    .then(response => response.json())
    .then(posts => {
        
        data = posts;
        info = data.shift();
        let mainContainer = document.getElementById("post-list");
        let profileContainer = document.getElementById("profile-view");
        let divOne = document.createElement('div');
        divOne.className = 'profileView';
        divOne.innerHTML = `
          <div class="profile-info">
            <pre>${info.username}   Followers: ${info.followers}    Following: ${info.following}</pre>
            ${info.follow ? `<button id="follow-button" class="btn btn-danger btn-sm">Unfollow</button>` : `<button id="follow-button" class="btn btn-danger btn-sm">Follow</button>`}
          </div>
        `
        divOne.querySelector('#follow-button').addEventListener('click', () => follow_user(id, info.follow));

        if (info.myself === true) {
          divOne.querySelector('#follow-button').style.display = 'none';
        }

        profileContainer.appendChild(divOne);

        for (let i=0; i<data.length; i++) {
          let div = document.createElement("div");
          div.className = "postList";
          
          div.innerHTML = `
            <table class="postTable">
            <tr><p class="profile-username">${info.username}</p></tr>
            <tr><td><div class="gap-10"></div></td></tr>
            <tr><td>${data[i].comment}</td></tr>
            <tr><td class="timestamp">${data[i].timestamp}</td></tr>
            <tr><td>&#10084;&#65039; (Like count)</td> <td class="like-button"><button class="btn btn-danger btn-sm">Like</button></td></tr>
            </table>
          `
          div.querySelector('.like-button').addEventListener('click', () => test());
          
          mainContainer.appendChild(div);
        }

        console.log(data);
        console.log(info);
      
    });
}

//Post request to server when a user if followed
function follow_user(id, follow) {
  fetch('/follow', {
    method: 'POST',
    body: JSON.stringify({
      "id": id,
      "follow": follow
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_profile(id);
  })
}

//Post request to server when a post is submited
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

//Presents posts from django response in a uniform way for the whole app
function post_format(data) {
  let mainContainer = document.getElementById('post-list');
  mainContainer.innerHTML = '';

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
    
    div.querySelector(".username-button").addEventListener('click', () => load_profile(data[i].user));
    div.querySelector('.like-button').addEventListener('click', () => test());
    
    mainContainer.appendChild(div);
    
  }
}