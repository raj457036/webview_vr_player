var playlist = {
  streams: [],
  titles: [],
  pos: -1,
};

function init(passIf) {
  console.log("init");
  if (playlist.streams.length > 0 || passIf === true) {
    hlsLoad();
  }
}

function setupShakaEvents(player) {
  player.addEventListener('loaded', ()=>mediaController.setLoader(false));
  player.addEventListener('loading', ()=>mediaController.setLoader(true));
  player.addEventListener('buffering', (_)=>mediaController.setLoader(_['buffering']));
}

function initApp() {
  shaka.polyfill.installAll();
  if (shaka.Player.isBrowserSupported()) {
    var player = initPlayer();
    window.player = player;
    setupShakaEvents(player);
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
    console.log("Manifest Loaded Successfully");
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
  console.info('Retrying...');
  if (error.severity === 2) {
    console.warn("Forcing Retry... Please Wait...");
    location.reload();
  }
}

// hls only
function onHlsError(hls, event, data) {
  switch (data.type) {
    case Hls.ErrorTypes.NETWORK_ERROR:
      // try to recover network error
      mediaController.setLoader(true, true);
      console.log("fatal network error encountered, try to recover");
      hls.startLoad();
      break;
    case Hls.ErrorTypes.MEDIA_ERROR:
      console.log("fatal media error encountered, try to recover");
      mediaController.setLoader(true, true);
      hls.recoverMediaError();
      break;
    default:
      // cannot recover
      console.log('couldn\'t recovered');
      mediaController.setLoader(true, true);
      hls.destroy();
      location.reload();
      break;
  }
}

function setupEvents(HLSPlayer) {

  if (HLSPlayer !== null) {
    console.log('setting up');

    HLSPlayer.on(
      window.Hls.Events.FRAG_BUFFERED ||
      window.Hls.Events.FRAG_LOADED ||
      window.Hls.Events.LEVEL_LOADED, () => {
        mediaController.setLoader(false);
      });
  }
}

function configPlayer() {
  window.Hls.DefaultConfig = {
    ...window.Hls.DefaultConfig,
    abrBandWidthFactor: 0.95,
    abrBandWidthUpFactor: 0.7,
    abrEwmaDefaultEstimate: 500000,
    abrEwmaFastLive: 3,
    abrEwmaFastVoD: 3,
    abrEwmaSlowLive: 9,
    abrEwmaSlowVoD: 9,
    abrMaxWithRealBitrate: false,
    appendErrorMaxRetry: 3,
    autoStartLoad: true,
    capLevelOnFPSDrop: false,
    capLevelToPlayerSize: false,
    defaultAudioCodec: undefined,
    emeEnabled: false,
    enableCEA708Captions: true,
    enableSoftwareAES: true,
    enableWebVTT: true,
    enableWorker: true,
    fLoader: undefined,
    forceKeyFrameOnDiscontinuity: true,
    fpsDroppedMonitoringPeriod: 5000,
    fpsDroppedMonitoringThreshold: 0.2,
    fragLoadingMaxRetry: 6,
    fragLoadingMaxRetryTimeout: 64000,
    fragLoadingRetryDelay: 1000,
    fragLoadingTimeOut: 20000,
    highBufferWatchdogPeriod: 3,
    initialLiveManifestSize: 1,
    levelLoadingMaxRetry: 4,
    levelLoadingMaxRetryTimeout: 64000,
    levelLoadingRetryDelay: 1000,
    levelLoadingTimeOut: 10000,
    licenseXhrSetup: undefined,
    liveDurationInfinity: false,
    liveMaxLatencyDuration: undefined,
    liveMaxLatencyDurationCount: Infinity,
    liveSyncDuration: undefined,
    liveSyncDurationCount: 3,
    lowBufferWatchdogPeriod: 0.5,
    manifestLoadingMaxRetry: 1,
    manifestLoadingMaxRetryTimeout: 64000,
    manifestLoadingRetryDelay: 1000,
    manifestLoadingTimeOut: 10000,
    maxAudioFramesDrift: 1,
    maxBufferHole: 0.5,
    maxBufferLength: 30,
    maxBufferSize: 60000000,
    maxFragLookUpTolerance: 0.25,
    maxLoadingDelay: 4,
    maxMaxBufferLength: 600,
    maxStarvationDelay: 4,
    minAutoBitrate: 0,
    nudgeMaxRetry: 3,
    nudgeOffset: 0.1,
    pLoader: undefined,
    requestMediaKeySystemAccessFunc: null,
    startFragPrefetch: false,
    startLevel: undefined,
    startPosition: -1,
    stretchShortVideoTrack: false,
  }
}

function hlsLoad(stream) {
  console.log('ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd');

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