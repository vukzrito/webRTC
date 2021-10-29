const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: 3001, debug: 2
})

const myVideo = document.createElement('video')
myVideo.muted = true;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        console.log('call requesting stream received')
        call.answer(stream)
        console.log('stream sent')
        
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            console.log('Stream received from user')
            setTimeout(addVideoStream(video, userVideoStream), 10000)
        })
    })


    socket.on('user-connected', (userId) => {
        console.log('User connected: ', userId);
        setTimeout(() => connectToNewUser(userId, stream), 1000);
    })
})
socket.on('user-disconnected', userId => {
    console.log(`User left room`)

})

myPeer.on('open', id => {
    console.log('joining room')
    socket.emit('join-room', ROOM_ID, id)

})

function connectToNewUser(userId, stream) {
    console.log('calling', userId)
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    //video.setAttribute('id', userId)

    call.on('stream', userVideoStream => {
        console.log('Stream received from user')
        setTimeout(addVideoStream(video, userVideoStream), 10000)
    })
    call.on('error', error => console.error(error))

    call.on('close', () => {
        console.log('log connection closed')
        video.remove()
    })
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    videoGrid.append(video)
}