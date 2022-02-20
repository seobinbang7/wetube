const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeLine");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

var controlsTimeout = null;
let controlsMovementTimeout = null;
let volume = 0.5;
video.volume = volume;

let videoPlayStatus = false;
let setVideoPlayStatus = false;

const handlePlayClick = (e) => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = (e) => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute";
    volumeRange.value = video.muted ? 0 : volume;
};

const handleVolumechange = (event) => {
    const {
        target: { value },
    } = event;
    if (video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    volumeValue = Number(value);
    video.volume = value;

    if (volumeValue === 0) {
        video.muted = true;
        muteBtn.innerText = "Unmute";
    }
};

const formatTime = (seconds) => {
    const startIdx = seconds >= 3600 ? 11 : 14;
    return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
    };

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
    currenTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
}

const handleTimelineChange = (event) =>  {
    const {
        target: { value },
    } = event;
    if(!setVideoPlayStatus) {
        videoPlayStatus = video.paused?false:true;
        setVideoPlayStatus=true;
    }
    video.pause();
    video.currentTime=value;
};

const handleTimelineSet = () => {
    videoPlayStatus ? video.play():video.pause();
    setVideoPlayStatus=false;
};

const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        document.exitFullscreen();
        fullScreenBtn.innerText = "Enter Full Screen";
    } else {
        videoContainer.requestFullscreen();
        fullScreenBtn.innerText = "Exit Full Screen";
    }
}

const hideControls = () => {
    videoControls.classList.remove("showing");
}

const handleMouseMove = () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if (controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);
}

const handleSpaceBar = (event) => {
    if(event.keycode = " ") {
        handlePlayClick();
    }
}

/* video 다 로딩되었을 때 */
if (video.readyState == 4) {
    handleLoadedMetadata();
    }

if (video.readyState >= 2) {
    getmetadata();
}
        
function getmetadata() {
    handleLoadedMetadata();
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumechange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mouseover",handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleTimelineSet);
fullScreenBtn.addEventListener("click", handleFullscreen);
document.addEventListener("keydown", handleSpaceBar);