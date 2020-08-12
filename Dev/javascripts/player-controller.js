const MediaEvent = {
    ABORTED: 1,
    CAN_PLAY: 2,
    CAN_PLAY_THROUGH: 3,
    DURATION_CHANGE: 4,
    ENDED: 5,
    ERROR: 6,
    LOADED_DATA: 7,
    LOADED_META_DATA: 8,
    LOAD_START: 9,
    PAUSE: 10,
    PLAY: 11,
    PLAYING: 12,
    PROGRESS: 13,
    RATE_CHANGE: 14,
    SEEKED: 15,
    SEEKING: 16,
    STALLED: 17,
    SUSPEND: 18,
    TIME_UPDATE: 19,
    VOLUME_CHANGE: 20,
    WAITING: 21,
    EXTERNAL: 22,
}

Object.freeze(MediaEvent);

class MediaMessage {

    constructor(readyState, eventType, message) {
        this.readyState = readyState;
        this.eventType = eventType;
        this.message = message;
    }

    getMessage() {
        const _message = {
            "readyState": this.readyState,
            "event": this.eventType,
            "message": this.message,
        }

        return JSON.stringify(_message);
    }
}

class MediaMessageChannel {

    constructor(controller, useConsoleForMessage = false) {
        this.controller = controller;
        this.useConsoleForMessage = useConsoleForMessage;
        this.errorDisplayed = false;
        this._timeout = null;
        this._stalled = false;
    }

    // To prevent BLACK Screen on IOS devices
    videoHackListener() {
        const vid = document.querySelector("video");
        setTimeout(function () {
            const scene = document.querySelector("#scene_id");
            scene.renderer.setSize(scene.canvas.width, scene.canvas.height);
        }, 500);
        vid.removeEventListener('canplay', this.videoHackListener);
    }

    onVideoPlaybackFailure() {
        this.controller.setLoader(true, true);
    }

    onVideoPlaybackSuccess() {
        this._stalled = false;
        if (this._timeout) clearTimeout(this._timeout);
        this.controller.setLoader(false);
    }

    onVideoPlaybackWaiting(stalled = false) {
        this.controller.setLoader(true, false, true);

        if (stalled) {
            this._stalled = true;
            this.retryPlay();
        }
    }

    retryPlay() {
        self = this;
        if (this._timeout) clearTimeout(this._timeout);
        this._timeout = setTimeout(() => {
            console.log(`player Stalled ${this._stalled}`);
            if (this._stalled) {
                this.controller.video.load();
                this.controller.play();
                this._stalled = false;
            }
        }, 10000);
    }

    onVideoEvents() {
        const readyState = this.controller.video.readyState;

        if (readyState === 4) {
            this.onVideoPlaybackSuccess();
        } else {
            this.onVideoPlaybackWaiting();
        }
    }

    subscribe(code, self = this) {
        const vid = this.controller.video;

        if (code == MediaEvent.ABORTED) {
            vid.onabort = function () {
                self.onVideoPlaybackSuccess();
                self.sendMessage(MediaEvent.ABORTED);
            };
        }

        if (code == MediaEvent.CAN_PLAY) {
            vid.oncanplay = function () {
                self.onVideoPlaybackSuccess();
                self.sendMessage(MediaEvent.CAN_PLAY);
            };

            // const scene = document.querySelector("#scene_id");
            // if (scene.isIOS) {
            //     vid.addEventListener("canplay", self.videoHackListener);
            // }
        }

        if (code == MediaEvent.CAN_PLAY_THROUGH) {
            vid.oncanplaythrough = function () {
                self.onVideoPlaybackSuccess();
                self.sendMessage(MediaEvent.CAN_PLAY_THROUGH);
            };
        }

        if (code == MediaEvent.DURATION_CHANGE) {
            vid.ondurationchange = function () {
                self.sendMessage(MediaEvent.DURATION_CHANGE);
            };
        }

        if (code == MediaEvent.ENDED) {
            vid.onended = function () {
                self.sendMessage(MediaEvent.ENDED);
            };
        }

        if (code == MediaEvent.ERROR) {
            vid.onerror = function () {
                self.onVideoPlaybackFailure();
                self.sendMessage(MediaEvent.ERROR);
            };
        }

        if (code == MediaEvent.LOADED_DATA) {
            vid.onloadeddata = function () {
                self.onVideoPlaybackSuccess();
                self.sendMessage(MediaEvent.LOADED_DATA);
            };
        }

        if (code == MediaEvent.LOADED_META_DATA) {
            vid.onloadedmetadata = function () {
                self.sendMessage(MediaEvent.LOADED_META_DATA);
            };
        }

        if (code == MediaEvent.LOAD_START) {
            vid.onloadstart = function () {
                self.onVideoPlaybackWaiting();
                self.sendMessage(MediaEvent.LOAD_START);
            };
        }

        if (code == MediaEvent.PAUSE) {
            vid.onpause = function () {
                self.sendMessage(MediaEvent.PAUSE);
            };
        }

        if (code == MediaEvent.PLAY) {
            vid.onplay = function () {
                self.sendMessage(MediaEvent.PLAY);
            };
        }

        if (code == MediaEvent.PLAYING) {
            vid.onplaying = function () {
                self.onVideoPlaybackSuccess();
                self.sendMessage(MediaEvent.PLAYING);
            };
        }

        if (code == MediaEvent.PROGRESS) {
            vid.onprogress = function () {
                self.onVideoEvents();
                self.sendMessage(MediaEvent.PROGRESS);
            };
        }

        if (code == MediaEvent.RATE_CHANGE) {
            vid.onratechange = function () {
                self.sendMessage(MediaEvent.RATE_CHANGE);
            }
        }

        if (code == MediaEvent.SEEKED) {
            vid.onseeked = function () {
                self.sendMessage(MediaEvent.SEEKED);
            };
        }

        if (code == MediaEvent.SEEKING) {
            vid.onseeking = function () {
                self.sendMessage(MediaEvent.SEEKING);
            };
        }

        if (code == MediaEvent.STALLED) {
            vid.onstalled = function () {
                self.onVideoPlaybackWaiting(true);
                self.sendMessage(MediaEvent.STALLED);
            };
        }

        if (code == MediaEvent.SUSPEND) {
            vid.onsuspend = function () {
                self.sendMessage(MediaEvent.SUSPEND);
            };
        }

        if (code == MediaEvent.TIME_UPDATE) {
            vid.ontimeupdate = function () {
                self.onVideoEvents();
                self.sendMessage(MediaEvent.TIME_UPDATE);
            };
        }

        if (code == MediaEvent.VOLUME_CHANGE) {
            vid.onvolumechange = function () {
                self.sendMessage(MediaEvent.VOLUME_CHANGE);
            };
        }

        if (code == MediaEvent.WAITING) {
            vid.onwaiting = function () {
                self.onVideoPlaybackWaiting();
                self.sendMessage(MediaEvent.WAITING);
            };
        }
    }

    unsubscribe(code) {
        const vid = this.controller.video;

        if (code == MediaEvent.ABORTED) {
            vid.onabort = this.onVideoPlaybackSuccess;
        }

        if (code == MediaEvent.CAN_PLAY) {
            vid.oncanplay = this.onVideoPlaybackSuccess;
        }

        if (code == MediaEvent.CAN_PLAY_THROUGH) {
            vid.oncanplaythrough = this.onVideoPlaybackSuccess;
        }

        if (code == MediaEvent.DURATION_CHANGE) {
            vid.ondurationchange = null;
        }

        if (code == MediaEvent.ENDED) {
            vid.onended = null;
        }

        if (code == MediaEvent.ERROR) {
            vid.onerror = this.onVideoPlaybackFailure;
        }

        if (code == MediaEvent.LOADED_DATA) {
            vid.onloadeddata = this.onVideoPlaybackSuccess;
        }

        if (code == MediaEvent.LOADED_META_DATA) {
            vid.onloadedmetadata = null;
        }

        if (code == MediaEvent.LOAD_START) {
            vid.onloadstart = null;
        }

        if (code == MediaEvent.PAUSE) {
            vid.onpause = null;
        }

        if (code == MediaEvent.PLAY) {
            vid.onplay = null;
        }

        if (code == MediaEvent.PLAYING) {
            vid.onplaying = null;
        }

        if (code == MediaEvent.PROGRESS) {
            vid.onprogress = this.onVideoEvents();
        }

        if (code == MediaEvent.RATE_CHANGE) {
            vid.onratechange = null;
        }

        if (code == MediaEvent.SEEKED) {
            vid.onseeked = null;
        }

        if (code == MediaEvent.SEEKING) {
            vid.onseeking = null;
        }

        if (code == MediaEvent.STALLED) {
            vid.onstalled = this.onVideoPlaybackFailure;
        }

        if (code == MediaEvent.SUSPEND) {
            vid.onsuspend = null;
        }

        if (code == MediaEvent.TIME_UPDATE) {
            vid.ontimeupdate = this.onVideoEvents();
        }

        if (code == MediaEvent.VOLUME_CHANGE) {
            vid.onvolumechange = null;
        }

        if (code == MediaEvent.WAITING) {
            vid.onwaiting = this.onVideoPlaybackWaiting;
        }
    }

    sendMessage(event, message = "") {
        const mediaMessage = new MediaMessage(this.controller.video.readyState, event, message);

        try {
            this._postMessage(mediaMessage.getMessage());
            return true;
        } catch (error) {
            if (this.useConsoleForMessage) {
                console.warn("postMessage is not defined. Setting : MediaMessageChannel.postMessage = console.log");
                MediaMessageChannel.postMessage = console.log;
            } else if (!this.errorDisplayed) {
                console.warn("postMessage is not defined. Set : MediaMessageChannel.postMessage = someFunction");
                this.errorDisplayed = true;
            }
        }

        return false;
    }

    _postMessage(message) {
        MediaMessageChannel.postMessage(message);
    }
}


class MediaController {

    constructor(id) {
        this.videoID = id;
        this.video = null;
        this.autoPlay = true;
        this.channel = new MediaMessageChannel(this);
        this.__playerBuilt = false;
        this.src = null;
        this.cam = null;
        this._flat = false;
    }

    resetCamera() {
        this.cam.components['touch-look-controls'].yawObject.rotation.set(0, 0, 0);
        this.cam.components['touch-look-controls'].pitchObject.rotation.set(0, 0, 0);
    }

    toggleTouch(enabled = true) {
        this.cam.components['touch-look-controls'].data.enabled = enabled;
    }

    togglePlayer(flat = true, aspectRatio = 16 / 9, rotation = 0) {
        var videosphere = document.querySelector("#videosphere");
        if (flat) {
            this.resetCamera();
            videosphere.removeAttribute("geometry", "radius");
            videosphere.setAttribute("geometry", 'primitive', 'plane');
            videosphere.setAttribute("geometry", "width", aspectRatio);
            videosphere.object3D.rotation.y = Math.PI;
            videosphere.object3D.rotation.z = (Math.PI / 180) * rotation;
            videosphere.object3D.position.y = 1.6;
            videosphere.object3D.position.z = -1.0;
            setTimeout(() => this.toggleTouch(false), 100);
        } else {
            videosphere.removeAttribute("geometry", "width");
            videosphere.setAttribute("geometry", 'primitive', 'sphere');
            videosphere.object3D.rotation.y = 0;
            videosphere.object3D.rotation.z = 0;
            videosphere.object3D.position.y = 1.6;
            videosphere.object3D.position.z = 0;
            setTimeout(() => this.toggleTouch(true), 100);
        }

        if (videosphere.getAttribute("material")['shader'] != 'flat') {
            this.resetShader();
        }
    }

    resetShader() {
        var vs = document.querySelector("#videosphere");
        vs.setAttribute('material', 'shader', 'flat');
    }



    build360Player(autoplay = true, vrBtn = true, iosPerm = true, video_src = null, muted = true) {
        const _ascene = `
        <a-scene 
            loading-screen="dotsColor: white; backgroundColor: black" 
            vr-mode-ui="enabled: ${vrBtn}" 
            ar-mode-ui="enabled: false" 
            id="scene_id"
            class="player"
            device-orientation-permission-ui="enabled: ${iosPerm}"
        >
            <a-assets>
                <video 
                src="${video_src}"
                id="${this.videoID}" autoplay="${autoplay}" muted="${muted}" playsinline webkit-playsinline preload="auto" crossorigin="anonymous"></video>
            </a-assets>
            <a-entity id="camera" camera="active: true" position="0 1.6 0" touch-look-controls></a-entity>
            <a-videosphere id="videosphere" src="#${this.videoID}"></a-videosphere>

        </a-scene>`;


        if (!this.__playerBuilt) {
            this.__playerBuilt = true;
            this.src = video_src;
            $("body").prepend(_ascene);
            this.video = document.getElementById(this.videoID);
            this.cam = document.querySelector("#camera");
            var videosphere = document.querySelector("#videosphere");
            videosphere.addEventListener("materialvideoloadeddata", this.resetShader);
        } else {
            console.log('Player already built!!');
        }
    }


    get isFlat() {
        return this._flat;
    }

    viewInFlat(fullscreen = true, aspectRatio = null) {
        if (this.__playerBuilt && !this._flat) {
            this._flat = true;
            const ar = aspectRatio || (fullscreen ? window.innerHeight / window.innerWidth : window.innerWidth / window.innerHeight);

            if (fullscreen) this.togglePlayer(true, ar, 90);
            else this.togglePlayer(true, ar);
        }

        return "";
    }

    viewInMono() {
        if (this.__playerBuilt && this._flat) {
            this._flat = false;
            this.togglePlayer(false);
        }

        return "";
    }

    setLoader(value, error = false, buffering = false) {
        const spinner = $("#spinner");

        if (value === true)
            spinner.show();
        else
            spinner.hide();

        if (error) {
            spinner.addClass('error');
        } else {
            spinner.removeClass('error');
        }

        if (buffering) {
            spinner.addClass('buffering');
        } else {
            spinner.removeClass('buffering');
        }
    }

    // Methods

    seek(by_time) {
        this.currentTime(this.currentTime() + by_time);
        return "";
    }

    currentTime(time) {
        if (time < this.duration && time > 0) {
            this.video.currentTime = time;
            return "";
        } else return this.video.currentTime;
    }

    play(time) {
        this.subscribeToBufferingEvents();
        mediaController.setLoader(true);
        this.video.play().then(function () {
            // Automatic playback started!
            console.log('playing...');
        }).catch(function (error) {
            mediaController.setLoader(true);
            console.log("PlayBack Failed: " + JSON.stringify({
                'code': error.code,
                'message': error.message,
                'name': error.name,
            }));
            if (error.message === "Failed to load because no supported source was found." ||
                error.message == "The element has no supported sources.") {
                hlsLoad();
            }
        });

        if (time) {
            this.video.currentTime = time;
        }

        return "";
    }

    pause() {
        this.video.pause();
        return "";
    }

    playbackRate(rate) {
        if (rate < 5 && rate > -1) {
            this.video.playbackRate = rate;
            return "";
        } else return this.video.playbackRate;
    }


    forceReplay() {
        this.pause();
        this.currentTime(0);
        init(true);
        return "";
    }

    load(url, autoPlay = false) {
        this.pause();
        this.currentTime(0);
        playlist.streams[0] = url;
        init(true);

        if (autoPlay) {
            this.play();
        } else {
            this.pause();
        }
        return "";
    }

    enterVRMode() {
        const scene = $("a-scene")[0];
        scene.enterVR();
        return "";
    }

    exitVRMode() {
        const scene = $("a-scene")[0];
        scene.exitVR();
        return "";
    }

    subscribeToAllEvents() {
        const codes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

        for (var code of codes) {
            this.channel.subscribe(code);
        }
        return "";
    }

    unSubscribeFromAllEvents() {
        const codes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

        for (var code of codes) {
            this.channel.unsubscribe(code);
        }
        return "";
    }

    subscribe(...codes) {
        for (var code of codes) {
            this.channel.subscribe(code);
        }
        return "";
    }

    unsubscribe(...codes) {
        for (var code of codes) {
            this.channel.unsubscribe(code);
        }
        return "";
    }

    mute() {
        this.video.muted = true;
        return "";
    }

    unmute() {
        this.video.muted = false;
        return "";
    }

    subscribeToBufferingEvents() {
        this.subscribe(
            MediaEvent.ABORTED,
            MediaEvent.CAN_PLAY,
            MediaEvent.CAN_PLAY_THROUGH,
            MediaEvent.ERROR,
            MediaEvent.LOADED_DATA,
            MediaEvent.LOAD_START,
            MediaEvent.PLAYING,
            MediaEvent.STALLED,
            MediaEvent.WAITING,
            MediaEvent.PROGRESS,
        );

    }

    // getters
    get state() {
        return this.video.readyState;
    }

    get paused() {
        return this.video.paused;
    }

    get duration() {
        return this.video.duration;
    }

    get volume() {
        return this.video.volume * 100;
    }

    get isMuted() {
        return this.video.muted;
    }
}


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function processParams() {
    const url = getUrlParameter('video');
    const VRBtn = getUrlParameter('VRBtn');
    const autoPlay = getUrlParameter('autoPlay');
    const loop = getUrlParameter('loop');
    const debug = getUrlParameter('debug');
    const debugConsole = getUrlParameter('console');
    const iosPermissions = getUrlParameter('iosPerm');


    if (iosPermissions === 'false') {
        $('a-scene').attr("device-orientation-permission-ui", "enabled: false");
    }


    if (debug !== 'true') {
        $('.debugger').hide();

        const errorMsg = console.error;

        console.error = function (msg) {
            if (msg.toString() === "THREE.WebGLState:") {
                init();
            }
            errorMsg(msg);
        }

    } else {
        window.Hls.DefaultConfig['debug'] = true;
        if (debugConsole === 'false') {
            $('.debugger').hide();
        } else {
            setupDebugger();
        }
    }

    window.mediaController = new MediaController('video_player_id');

    mediaController.build360Player(
        autoplay = autoPlay !== 'false',
        vrBtn = VRBtn !== 'false',
        iosPerm = iosPermissions !== 'false',
        video_src = url,
    );

    if (url !== null) {
        playlist.streams[0] = url;
        // init(true)

        if (autoPlay !== 'false') {
            setTimeout(() => {
                if (!(mediaController.currentTime() > 0.0)) mediaController.play();
            }, 3000);
        } else {
            mediaController.autoPlay = false;
        }

        if (loop === 'true') {
            mediaController.video.loop = true;
        }

        if (VRBtn === 'false') {
            var h = document.getElementsByTagName('head').item(0);
            var s = document.createElement("style");
            s.type = "text/css";
            s.appendChild(document.createTextNode(".a-enter-vr-button {display: none;}"));
            h.appendChild(s);
        }
    } else {
        mediaController.setLoader(true, true);
    }

    mediaController.subscribeToBufferingEvents();

    if (debug === 'true') {
        subscribeToAllEvents();
    }

    window.mediaFilter = new MediaColorFilter('player');
}

document.title = "";
document.addEventListener('DOMContentLoaded', processParams);