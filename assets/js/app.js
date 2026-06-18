const cl = console.log

const spinner = document.getElementById('spinner')
const BASE_URL = `https://jsonplaceholder.typicode.com`

const POST_URL = `${BASE_URL}/posts`

const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title')
const bodyControl = document.getElementById('body')
const userIdControl = document.getElementById('userId')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')

let postsArr = []
let updateId = null

function snackbar (msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}

function createPostCards(arr) {

    const postContainer = document.getElementById('postContainer')

    let result = ''

    arr.forEach(post => {

        result += `
            <div class="col-md-3 mb-3" id="${post.id}">

                <div class="card post-card h-100">

                    <div class="card-header">
                        <h3>
                           ${post.title}
                        </h3>
                    </div>

                    <div class="card-body">
                        <p>
                            ${post.body}
                        </p>
                    </div>

                    <div class="card-footer d-flex justify-content-between">

                        <button
                            onclick="onEdit(this)"
                            class="btn btn-sm btn-outline-info"
                        >
                            Edit
                        </button>

                        <button
                            onclick="onRemove(this)"
                            class="btn btn-sm btn-outline-danger"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            </div>
        `
    })

    postContainer.innerHTML = result
}


// methodName, API_URL, body = null , successCb, errorCb

function makeApiCall(methodName, API_URL, body = null, successCb, errorCb) {

    spinner.classList.remove('d-none')

    body = body ? JSON.stringify(body) : null

    let xhr = new XMLHttpRequest()

    xhr.open(methodName, API_URL)

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')

    xhr.send(body)

    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = xhr.response ? JSON.parse(xhr.response) : {}

            if (methodName === 'GET') {

                if (Array.isArray(res)) {
                    successCb(res.reverse())
                } else {
                    successCb(res)
                }

            } else if (methodName === 'POST') {

                let obj = { ...JSON.parse(body), id: res.id }
                successCb(obj)

            } else if (methodName === 'PATCH') {

                let obj = { ...JSON.parse(body), id: res.id }
                successCb(obj)

            } else if (methodName === 'DELETE') {

                successCb()
            }

        } else {
            errorCb('Something went wrong', 'error')
        }
         
        spinner.classList.add('d-none')
    }
    

    xhr.onerror = function () {
        errorCb('Something went wrong', 'error') 
        spinner.classList.add('d-none')
    }
}


// READ >> GET 
makeApiCall('GET', POST_URL, null, createPostCards, snackbar)


function onPostSubmit (eve) {

    eve.preventDefault()

     if (
        titleControl.value.trim() === '' ||
        bodyControl.value.trim() === '' ||
        userIdControl.value.trim() === ''
    ) {

        snackbar('All fields are required !!!', 'error')
        return
    }

    let POST_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value,
        body: bodyControl.value
    }

    makeApiCall('POST', POST_URL, POST_OBJ, createSingleCard, snackbar)
}


function createSingleCard(res) {

    let col = document.createElement('div')

    col.className = 'col-md-3 mb-3'
    col.id = res.id

    col.innerHTML = `
        <div class="card post-card h-100">

            <div class="card-header">
                <h3>${res.title}</h3>
            </div>

            <div class="card-body">
                <p>
                    ${res.body}
                </p>
            </div>

            <div class="card-footer d-flex justify-content-between">

                <button
                    onclick="onEdit(this)"
                    class="btn btn-sm btn-outline-primary"
                >
                    Edit
                </button>

                <button
                    onclick="onRemove(this)"
                    class="btn btn-sm btn-outline-danger"
                >
                    Remove
                </button>

            </div>

        </div>
    `

    const postContainer = document.getElementById('postContainer')

    postContainer.prepend(col)
 
    postForm.reset()

    snackbar(`Post with id ${res.id} created successfully !!!`, 'success')
}

function onEdit(ele) {

    updateId = ele.closest('.col-md-3').id

    let EDIT_URL = `${BASE_URL}/posts/${updateId}`

    makeApiCall('GET', EDIT_URL, null, editCallBack, snackbar)
}

function editCallBack(res) {

    titleControl.value = res.title
    bodyControl.value = res.body
    userIdControl.value = res.userId

    addPostBtn.classList.add('d-none')
    updatePostBtn.classList.remove('d-none')
}

function onPostUpdate() {

    if (
        titleControl.value.trim() === '' ||
        bodyControl.value.trim() === '' ||
        userIdControl.value.trim() === ''
    ) {

        snackbar('All fields are required !!!', 'error')
        return
    }

    let UPDATE_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value,
        body: bodyControl.value
    }

    let UPDATE_URL = `${BASE_URL}/posts/${updateId}`

    makeApiCall('PATCH', UPDATE_URL, UPDATE_OBJ, updateCallBack, snackbar)
}

function updateCallBack(res) {

    let card = document.getElementById(updateId)

    card.querySelector('h3').innerHTML = res.title
    card.querySelector('p').innerHTML = res.body

    postForm.reset()

    updateId = null

    addPostBtn.classList.remove('d-none')
    updatePostBtn.classList.add('d-none')

    snackbar('Post updated successfully !!!', 'success')
}

function removeCallBack () {

    let REMOVE_ID = localStorage.getItem('REMOVE_ID')

    document.getElementById(REMOVE_ID).remove()

    localStorage.removeItem('REMOVE_ID')

    snackbar('Post removed successfully !!!', 'success')
}

function onRemove (ele) {

    let REMOVE_ID = ele.closest('.col-md-3').id

    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this post?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel'
    }).then(result => {

        if (result.isConfirmed) {

            localStorage.setItem('REMOVE_ID', REMOVE_ID)

            let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}`

            makeApiCall('DELETE', REMOVE_URL, null, removeCallBack, snackbar)
        }
    })
}

postForm.addEventListener('submit', onPostSubmit)
updatePostBtn.addEventListener('click', onPostUpdate)