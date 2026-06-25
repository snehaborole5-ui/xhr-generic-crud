
const postform = document.getElementById('postform');
const titlecontrol = document.getElementById('title');
const bodycontrol = document.getElementById('body');
const userIdcontrol = document.getElementById('userId');
const addpost = document.getElementById('addpost');
const updatepost = document.getElementById('updatepost');
const postcontainer = document.getElementById('postcontainer');
const spinner = document.getElementById('spinner');

let postArr = [];
let base_url = 'https://jsonplaceholder.typicode.com/posts';


function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
}

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon || 'success',
        timer: 3000
    });
}


function makeapicall(methodName, api_url, body = null, successcb, errorcb) {
    spinner.classList.remove('d-none');
    body = body ? JSON.stringify(body) : null;
    let xhr = new XMLHttpRequest();
    xhr.open(methodName, api_url);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(body);
    
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = xhr.response ? JSON.parse(xhr.response) : {};
            if (methodName === 'GET') {
                successcb(res);
            } else if (methodName === 'POST') {
                let obj = { ...JSON.parse(body), id: res.id };
                successcb(obj);
            } else if (methodName === 'PATCH' || methodName === 'PUT') {
                successcb(JSON.parse(body));
            } else {
                successcb();
            }
        } else {
            errorcb('Something went wrong!', 'error');
        }
        spinner.classList.add('d-none');
    };
    
    xhr.onerror = function () {
        spinner.classList.add('d-none');
        errorcb('Network Error!', 'error');
    };
}

// Reusable Template Engine for Cards
function cardTemplate(p) {
    return `
        <div class="card border-dark mb-3 h-100 shadow-sm post-card-item">
            <div class="card-header bg-white">
                <h5 class="card-title-text text-capitalize mb-0" data-toggle="tooltip" title="${p.title}">${p.title}</h5>
            </div>
            <div class="card-body text-dark">
                <p class="card-text">${p.body}</p>
                <small class="text-muted d-block mt-2">User ID: <b>${p.userId}</b></small>
            </div>
            <div class="card-footer bg-white d-flex justify-content-between border-top-0">
                <button class="btn btn-sm btn-warning px-3 font-weight-bold" onclick="onedit(this)">Edit</button>
                <button class="btn btn-sm btn-danger px-3 font-weight-bold" onclick="onremove(this)">Remove</button>
            </div>
        </div>
    `;
}

// 1. Initial Load (GET)
function createcard(arr) {
    postArr = Array.isArray(arr) ? arr : [arr];
    let result = '';
    postArr.forEach(p => {
        result += `
            <div class="col-xl-3 col-md-4 col-sm-6 col-12 mb-4" id="${p.id}">
                ${cardTemplate(p)}
            </div>
        `;
    });
    postcontainer.innerHTML = result;
    initTooltips();
}

// 2. Form Submit Handler (POST)
function onsubmit(eve) {
    eve.preventDefault();
    let new_obj = {
        title: titlecontrol.value,
        userId: Number(userIdcontrol.value),
        body: bodycontrol.value
    };
    makeapicall('POST', base_url, new_obj, createnewcard, snackbar);
}

function createnewcard(res) {
    postArr.unshift(res);
    let col = document.createElement('div');
    col.className = 'col-xl-3 col-md-4 col-sm-6 col-12 mb-4';
    col.id = res.id;
    col.innerHTML = cardTemplate(res);
    
    postcontainer.prepend(col);
    initTooltips();
    snackbar(`The new card with ID ${res.id} is Added successfully`, 'success');
    postform.reset();
}


function onedit(ele) {
    let edit_id = ele.closest('.mb-4').id;
    localStorage.setItem('edit_id', edit_id);
    
    let localpost = postArr.find(p => p.id == edit_id);
    if (localpost) {
        postedit(localpost);
        return;
    }

    let edit_url = `${base_url}/${edit_id}`;
    makeapicall('GET', edit_url, null, postedit, snackbar);
}

function postedit(edit_obj) {
    titlecontrol.value = edit_obj.title;
    userIdcontrol.value = edit_obj.userId;
    bodycontrol.value = edit_obj.body;
    
    addpost.classList.add('d-none');
    updatepost.classList.remove('d-none');
    
    
    postform.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


function onupdate() {
    let update_id = localStorage.getItem('edit_id');
    let update_url = `${base_url}/${update_id}`;
    let update_obj = {
        title: titlecontrol.value,
        userId: Number(userIdcontrol.value),
        body: bodycontrol.value,
        id: Number(update_id) || update_id
    };
    
    makeapicall('PATCH', update_url, update_obj, updatepostcard, snackbar);
}

function updatepostcard(update_obj) {
    let card = document.getElementById(update_obj.id);
    let index = postArr.findIndex(p => p.id == update_obj.id);
    if (index !== -1) {
        postArr[index] = update_obj;
    }
    
    if (card) {
        card.innerHTML = cardTemplate(update_obj);
        card.scrollIntoView({behavior: 'smooth', block: 'center'});
        card.classList.add('highlight');
        setTimeout(() => {
            card.classList.remove('highlight')
        }, 3000)
    }
    
    initTooltips();
    snackbar(`The post with id ${update_obj.id} is updated successfully`, 'success');
    postform.reset();
    localStorage.removeItem('edit_id');

    addpost.classList.remove('d-none');
    updatepost.classList.add('d-none');
}


function onremove(ele) {
    let remove_id = ele.closest('.mb-4').id;
    
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to recover this post!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('remove_id', remove_id);
            let remove_url = `${base_url}/${remove_id}`;
            makeapicall('DELETE', remove_url, null, removecallback, snackbar);
        }
    });
}

function removecallback() {
    let remove_id = localStorage.getItem('remove_id');
    let card = document.getElementById(remove_id);
    if (card) {
        card.remove();
    }
    
    
    postArr = postArr.filter(p => p.id != remove_id);
    
    snackbar(`The post with id ${remove_id} is deleted Successfully`, 'success');
    localStorage.removeItem('remove_id');
}


makeapicall('GET', base_url, null, createcard, snackbar);

postform.addEventListener('submit', onsubmit);
updatepost.addEventListener('click', onupdate);