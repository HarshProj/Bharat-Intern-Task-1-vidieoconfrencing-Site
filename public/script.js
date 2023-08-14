const socket=io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
    myVideoStream=stream;
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})
document.addEventListener("keydown", (e) => {
    if (e.code==="Enter" && chatInputBox.value != "") {
      socket.emit("message", chatInputBox.value);
      chatInputBox.value = "";
    }
  });
socket.on("createMessage", (msg,userId) => {
    let li = document.createElement("li");
    li.className="message";
    li.innerHTML = msg;
    all_messages.append(li);
    main__chat__window.scrollTop = main__chat__window.scrollHeight;
  });

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)

}

const playStop=()=>{
    let box=myVideoStream.getVideoTracks()[0].enabled;
    console.log(box);
    if(box){
        myVideoStream.getVideoTracks()[0].enabled=false;
        setPlayVideo();
    }
    else{
        myVideoStream.getVideoTracks()[0].enabled=true;
        setStopVideo();
    }
}
const setPlayVideo = () => {
    const html = `<i class="unmute fa fa-pause-circle"></i>
    <span class="unmute">Resume Video</span>`;
    document.getElementById("playPauseVideo").innerHTML = html;
  };
  
  const setStopVideo = () => {
    const html = `<i class=" fa fa-video-camera"></i>
    <span class="">Pause Video</span>`;
    document.getElementById("playPauseVideo").innerHTML = html;
  };