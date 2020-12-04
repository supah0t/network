document.addEventListener('DOMContentLoaded', function() {
    
    test()
    
    //document.querySelector('#post').addEventListener('click', () => post_post());
    document.querySelector('#post').addEventListener('click', () => test());
    
    //load_posts();
});

function test() {
    console.log("Hello");
}

function load_posts() {
    //todo
}

function post_post() {
    
    const post = document.querySelector('#post-body').value;
    
    console.log(post);
    
    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
            "comment": post
        })
    })
    .then(response => response.json())
    .then(result => {
        
        console.log(result);
    });
    return false;
}