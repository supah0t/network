var openEdit = false;

document.addEventListener('DOMContentLoaded', function() {
        
    document.querySelector('#post').addEventListener('click', () => post_post());
    document.querySelector('.following-menu').addEventListener('click', () => load_following_posts());
    load_posts();
  });
  
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
    
    fetch(`/${id}`)
    .then(response => response.json())
    .then(posts => {
        
        data = posts;
        info = data.shift();
        let profileContainer = document.getElementById("profile-view");
        let divOne = document.createElement('div');
        divOne.className = 'profile-area';
        divOne.innerHTML = `
          <div class="profile-info">
            <pre> ${info.username}   Followers: ${info.followers}    Following: ${info.following}</pre>
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
    });
}

//Presents posts from django response in a uniform way for the whole app
function post_format(data) {
  let mainContainer = document.getElementById('post-list');
  mainContainer.innerHTML = '';

  for (let i=0; i<data.length; i++) {
    let div = document.createElement("div");
    div.className = "postList";
    div.id = `post-table${i}`;
    
    div.innerHTML = `
      <table class="postTable">
        <tr><td><button class="username-button">${data[i].username}</button></td></tr>
        <tr><td><div class="gap-10"></div></td></tr>
        <tr id="edit${i}"><td class="post-area">${data[i].comment}</td>
        ${ data[i].myself ? `<td class="edit-button"><button class="btn btn-warning btn-sm">Edit</button></td></tr>` : `</tr>`}
        <tr><td><hr></td></tr>
        <tr><td class="edit-timestamp">${data[i].latestEdit != null ? `(Edited on ${data[i].latestEdit})` : ``}</td></tr>
        <tr><td class="timestamp">${data[i].timestamp}</td></tr>
        <tr><td>&#10084;&#65039; <span class="like-area${i}">${data[i].likes == "likes" ? `0` : `${data[i].likes}` }</span> </td> <td class="like-button"><button id="like-button${i}" class="btn btn-danger btn-sm">${data[i].liked == false ? `Like` : `Unlike`}</button></td></tr>
      </table>
    `
    
    div.querySelector(".username-button").addEventListener('click', () => load_profile(data[i].user));
    //div.querySelector(`#like-button${i}`).addEventListener('click', () => like_post(i, data[i].id));
    div.querySelector(`#like-button${i}`).addEventListener('click', function() {
        like_post(i, data[i].id);
    });
    
    if (data[i].myself === true) {
        div.querySelector('.edit-button').addEventListener('click', () => edit_post(i, data[i].id));    
    }
    
    mainContainer.appendChild(div);
  }
}

function like_post(number, id) {
    fetch('/like', {
        method: 'POST', 
        body: JSON.stringify({
            "id": id
        })
    })
    .then(response => response.json())
    .then(post => {
        likeNumber = parseInt(document.querySelector(`.like-area${number}`).innerHTML);
        document.querySelector(`.like-area${number}`).innerHTML = parseInt(post.likes);
        document.querySelector(`#like-button${number}`).innerHTML = post.liked === true ? `Unlike`: `Like`;
    });
}

//Edit a post
function edit_post(number, id) {
    if (openEdit === false) {
        oldText = document.querySelector(`#edit${number}`).firstElementChild.innerHTML;
        area = document.querySelector(`#edit${number}`);
        oldPost = area.innerHTML;
        area.innerHTML = `<form><div class="form-group"><textarea class="form-control" id="edit-post-form">${oldText}</textarea><br></div><button type="submit" id="post-edit" class="btn btn-primary btn-sm">Post</button>&nbsp;&nbsp;<button type="submit" class="btn btn-primary btn-sm" id="cancel-button">Cancel</button></form>`;
        area.querySelector('#cancel-button').addEventListener('click', () => stop_edit_post(oldPost, number));
        area.querySelector('#post-edit').addEventListener('click', () => post_edit(oldPost, number, id)); 
        openEdit = true;
    }
}

function post_edit(oldPost, number, id) {
    newPost = document.querySelector(`#edit-post-form`).value;
    
    fetch('/edit', {
        method: 'POST',
        body: JSON.stringify({
          "comment": newPost,
          "id": id
        })
    })
    .then(response => response.json())
    .then(result => {
        //Print result
        
        area = document.querySelector(`#edit${number}`);
        area.innerHTML = oldPost
        area.querySelector('.post-area').innerHTML = newPost;
        
        openEdit = false;
    });
      
}

//Remove edit form and replace with old post
function stop_edit_post(post, number) {
    area = document.querySelector(`#edit${number}`);
    area.innerHTML = post;
    area.querySelector('.edit-button').addEventListener('click', () => edit_post(number));
    openEdit = false;
}


//Test function for paginated response handling, have to apply to every function now
function paginate_posts(posts) { 
    
  let buttonDiv = document.querySelector('#page-button');
  buttonDiv.innerHTML = '';
  let buttonList = document.createElement('ul');
  buttonList.className = "pagination justify-content-center";
  buttonDiv.appendChild(buttonList);
  
  for (let i=0; i<posts.length; i++) {
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
