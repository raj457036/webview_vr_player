var playlist = {
  streams: [],
  titles: [],
  pos: -1,
};

function init(passIf) {
  // console.log("init");
  if (playlist.streams.length > 0 || passIf === true) {
    if (playlist.streams[0].indexOf("m3u8") != -1) {
      console.log("hls");
      hlsLoad()
    } else {
      console.log("dash");
      initApp()
    }
  }
}

function initApp() {
  shaka.polyfill.installAll();
  if (shaka.Player.isBrowserSupported()) {
    var player = initPlayer();
    window.player = player;
    doPlay(player, pushNext());
  } else {
    console.error('Browser not supported!');
  }
}

function initPlayer() {
  var video = document.getElementById('video_player_id');
  var player = new shaka.Player(video);

  player.addEventListener('error', onErrorEvent);
  video.addEventListener('ended', function () {
    player.unload();
    doPlay(player, pushNext());
  });
  return player;
}

function doPlay(player, src) {
  player.load(src.manifest).then(function () {
    console.log("hello");
  }).catch(onError);
}

function pushNext() {
  playlist.pos++;
  if (playlist.pos > playlist.streams.length - 1) {
    playlist.pos = 0;
  }
  return {
    manifest: playlist.streams[playlist.pos],
    title: playlist.titles[playlist.pos]
  };
}

function onErrorEvent(event) {
  onError(event.detail);
}

function onError(error) {
  console.error('Error code', error.code, 'object', error);
}

function onHlsError(hls, event, data) {
  mediaController.setLoader(true);
  switch (data.type) {
    case Hls.ErrorTypes.NETWORK_ERROR:
      // try to recover network error
      console.log("fatal network error encountered, try to recover");
      hls.startLoad();
      break;
    case Hls.ErrorTypes.MEDIA_ERROR:
      console.log("fatal media error encountered, try to recover");
      hls.recoverMediaError();
      break;
    default:
      // cannot recover
      console.log('couldn\'t recovered');
      hls.destroy();
      mediaController.forceRetry();
      break;
  }
}

function setupEvents(HLSPlayer) {

  if (HLSPlayer !== null) {
    console.log('setting up');

    HLSPlayer.on(
      window.Hls.Events.LEVEL_LOADING, () => {
        mediaController.setLoader(true);
      });

    HLSPlayer.on(
      window.Hls.Events.FRAG_BUFFERED ||
      window.Hls.Events.FRAG_LOADED, () => {
        mediaController.setLoader(false);
      });
  }
}

function configPlayer() {
  window.Hls.DefaultConfig = {
    ...window.Hls.DefaultConfig,
    autoStartLoad: true,
    startPosition: -1,
    // debug: false,
    capLevelOnFPSDrop: false,
    capLevelToPlayerSize: false,
    // defaultAudioCodec: undefined,
    // initialLiveManifestSize: 1,
    // maxBufferLength: 30,
    // maxMaxBufferLength: 600,
    // maxBufferSize: 60 * 1000 * 1000,
    // maxBufferHole: 0.5,
    // lowBufferWatchdogPeriod: 0.5,
    // highBufferWatchdogPeriod: 3,
    // nudgeOffset: 0.1,
    // nudgeMaxRetry: 3,
    // maxFragLookUpTolerance: 0.25,
    liveSyncDuration: 6,
    // liveMaxLatencyDurationCount: Infinity,
    // liveDurationInfinity: false,
    // liveBackBufferLength: Infinity,
    // enableWorker: true,
    // enableSoftwareAES: true,
    // manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 4,
    // manifestLoadingMaxRetryTimeout: 64000,
    // startLevel: undefined,
    // levelLoadingTimeOut: 10000,
    levelLoadingMaxRetry: 16,
    // levelLoadingRetryDelay: 1000,
    // levelLoadingMaxRetryTimeout: 64000,
    // fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 24,
    // fragLoadingRetryDelay: 1000,
    // fragLoadingMaxRetryTimeout: 64000,
    startFragPrefetch: true,
    // testBandwidth: true,
    // fpsDroppedMonitoringPeriod: 5000,
    // fpsDroppedMonitoringThreshold: 0.2,
    // appendErrorMaxRetry: 3,
    // loader: customLoader,
    // fLoader: customFragmentLoader,
    // pLoader: customPlaylistLoader,
    // xhrSetup: XMLHttpRequestSetupCallback,
    // fetchSetup: FetchSetupCallback,
    // abrController: AbrController,
    // bufferController: BufferController,
    // capLevelController: CapLevelController,
    // fpsController: FPSController,
    // timelineController: TimelineController,
    // enableWebVTT: true,
    // enableCEA708Captions: true,
    // stretchShortVideoTrack: false,
    // maxAudioFramesDrift: 1,
    // forceKeyFrameOnDiscontinuity: true,
    // abrEwmaFastLive: 3.0,
    // abrEwmaSlowLive: 9.0,
    // abrEwmaFastVoD: 3.0,
    // abrEwmaSlowVoD: 9.0,
    // abrEwmaDefaultEstimate: 500000,
    // abrBandWidthFactor: 0.95,
    // abrBandWidthUpFactor: 0.7,
    // abrMaxWithRealBitrate: false,
    // maxStarvationDelay: 4,
    // maxLoadingDelay: 4,
    // minAutoBitrate: 0,
    // emeEnabled: false,
    // widevineLicenseUrl: undefined,
    // drmSystemOptions: {},
    // requestMediaKeySystemAccessFunc: requestMediaKeySystemAccess
  };
}

function hlsLoad(stream) {

  if (Hls.isSupported()) {
    var video = document.getElementById('video_player_id');
    configPlayer();
    var hls = new Hls();
    hls.loadSource(playlist.streams[0]);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      console.log("MANIFEST_PARSED");
    });
    hls.on(Hls.Events.ERROR, (event, data) => onHlsError(hls, event, data));
    setupEvents(hls);
    window.HlsPlayer = hls;
  } else {
    initApp();
  }
}