var openEdit = false;

document.addEventListener('DOMContentLoaded', function() {
        
    document.querySelector('#post').addEventListener('click', () => post_post());
    document.querySelector('.following-menu').addEventListener('click', () => load_following_posts());
    
    load_posts();
  });

function test() {
    console.log("Test successful");
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
      paginate_posts(posts);
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
    paginate_posts(posts);
  });
}

//Unoptimized profile view, GET request to server, server returns list in which list[0] is the profile info so I have to handle it differently from the rest of the list
function load_profile(id) {
    document.querySelector('#form-view').style.display = 'none';
    document.querySelector('#post-list').style.display = 'block';
    document.querySelector('#post-list').innerHTML = '';
    document.querySelector('#profile-view').style.display = 'block';   
    document.querySelector('#profile-view').innerHTML = '';
    
    //history.pushState('', 'Profile', `/${id}`);
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

        paginate_posts(data);
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
        <tr><td><button class="username-button">${data[i].username}</button></td></tr>
        <tr><td><div class="gap-10"></div></td></tr>
        <tr><td>${data[i].comment}</td>
        ${ data[i].myself ? `<td id="edit${i}" class="edit-button"><button class="btn btn-warning btn-sm">Edit</button></td></tr>` : `</tr>`}
        <tr><td class="timestamp">${data[i].timestamp}</td></tr>
        <tr><td>&#10084;&#65039; (Like count)</td> <td class="like-button"><button class="btn btn-danger btn-sm">Like</button></td></tr>
      </table>
    `
    
    div.querySelector(".username-button").addEventListener('click', () => load_profile(data[i].user));
    div.querySelector('.like-button').addEventListener('click', () => test());
    if (data[i].myself === true) {
        div.querySelector('.edit-button').addEventListener('click', () => edit_post(i));    
    }
    
    mainContainer.appendChild(div);
  }
  console.log(data);
}

//Edit a post
function edit_post(number) {
    if (openEdit === false) {
        oldPost = document.querySelector(`#edit${number}`).parentElement.firstElementChild.innerHTML;
        area = document.querySelector(`#edit${number}`).parentElement;
        area.innerHTML = `<form><div class="form-group"><textarea class="form-control" id="edit-post-form">${oldPost}</textarea><br></div><button type="submit" class="btn btn-primary">Post</  button>&nbsp;&nbsp;<button type="submit" class="btn btn-primary" id="cancel-button">Cancel</button></form>`;
        area.querySelector('#cancel-button').addEventListener('click', () => test());
        openEdit = true;
    }
}

//Remove edit form and replace with old post
function stop_edit_post(post, number) {
    //document.querySelector
}


//Test function for paginated response handling, have to apply to every function now
function paginate_posts(posts) { 
    
  let buttonDiv = document.querySelector('#page-button');
  buttonDiv.innerHTML = '';
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

  post_format(posts[0]);
  document.querySelector(`#button0`).className += " active";
}

//Handles paginator buttons, indicated which one is selected
function button_active(button) {
  document.querySelectorAll('li[id^="button"]').forEach(thing => {
    thing.className = "page-item"
  });
  document.querySelector(`#${button}`).className += " active";
}
