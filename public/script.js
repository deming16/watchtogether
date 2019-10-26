// FIREBASE
let caughtUp = true;
document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();

  const db = firebase.firestore();

  const video = db.collection('rooms').doc('room');

  video.onSnapshot(doc => {
    const data = doc.data();
    // if (data.state === -1) {
    //   player.stopVideo();
    // }
    if (data.state === 1) {
      player.playVideo();
    }
    if (data.state === 2) {
      player.pauseVideo();
    }

  })
});



// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
var player;
function onYouTubePlayerAPIReady() {
  player = new YT.Player('ytplayer', {
    height: '360',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    playerVars: { 'autoplay': 1 },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  const db = firebase.firestore();
  const video = db.collection("rooms").doc("room");

  video.get()
    .then(doc => {
      const data = doc.data();
      video.update({ numWatcher: data.numWatcher + 1 });
    });
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data !== 3) {
    const db = firebase.firestore();
    const video = db.collection("rooms").doc("room");
    if (event.data === 2) {
      setTimeout(function () {
        if (event.target.getPlayerState() === 2) {
          video.update({ state: event.data });
        }
        else {
          video.update({ timeStamp: player.getCurrentTime() });
        }
      }, 1000)
    }
    else {
      video.update({ state: event.data });
    }
  }
}

window.onbeforeunload = function (event) {
  event.preventDefault();
  const db = firebase.firestore();
  const video = db.collection("rooms").doc("room");

  video.get()
    .then(doc => {
      const data = doc.data();
      video.update({ numWatcher: data.numWatcher - 1 });
    });

  return "";
}


window.setInterval(function () {
  const db = firebase.firestore();
  const video = db.collection("rooms").doc("room");
  video.get()
    .then(doc => {
      const data = doc.data();

      if (player.getVideoData()['video_id'] !== data.videoId) {
        changeVideo(data.videoId);
      }
      else if (data.timeStamp - player.getCurrentTime() > 5 || data.timeStamp - player.getCurrentTime() < -5) {
        player.seekTo(data.timeStamp, true);
      }
      else {
        video.update({ timeStamp: player.getCurrentTime() });
      }
    });

}, 2000);

const idBtn = document.querySelector('#id-btn');
idBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const videoId = document.querySelector('#video-id').value;
  changeVideo(videoId);
});

function changeVideo(videoId) {
  player.loadVideoById(videoId, 0);
  const db = firebase.firestore();
  const video = db.collection("rooms").doc("room");
  video.update({ videoId: videoId, timeStamp: 0 });
}