"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = void 0;
var game_1 = require("../models/game");
var di_container_1 = require("./di-container");
var MAX_VOLUME = 1;
var AudioController = /** @class */ (function () {
    function AudioController() {
        this.assetsManager = di_container_1.DIContainer.getInstance().resolve(game_1.ASSETS_MANAGER_DI);
        this.audioContext = new AudioContext();
        this.mainGainNode = this.audioContext.createGain();
        this.playingSounds = {};
        this.mainGainNode.gain.value = MAX_VOLUME;
        this.mainGainNode.connect(this.audioContext.destination);
    }
    Object.defineProperty(AudioController.prototype, "playingAssetsIds", {
        get: function () {
            return Object.keys(this.playingSounds);
        },
        enumerable: false,
        configurable: true
    });
    AudioController.prototype.setMainVolume = function (value) {
        this.mainGainNode.gain.value =
            value >= 0 && value <= MAX_VOLUME ? value : MAX_VOLUME;
    };
    AudioController.prototype.getMainVolume = function () {
        return this.mainGainNode.gain.value;
    };
    AudioController.prototype.playAsset = function (id, audioPlayingOptions) {
        var _this = this;
        var _a;
        if (audioPlayingOptions === void 0) { audioPlayingOptions = { loop: false, force: true }; }
        var soundAsset = this.assetsManager.find(id);
        if (soundAsset === undefined) {
            console.warn("Can`t find asset", id);
        }
        if (this.playingAssetsIds.indexOf(id) > -1 &&
            audioPlayingOptions.force === false) {
            return;
        }
        this.playingSounds[id] = audioPlayingOptions;
        var arrayBuffer = (_a = this.assetsManager.find(id)) === null || _a === void 0 ? void 0 : _a.source;
        if (arrayBuffer === undefined) {
            return;
        }
        // THIS IS INCONVENIENT!
        // we are doing 2 operations (cloning buffer, and then decode) each time we want to play a sound, and this comes at a cost!
        // Look for a solution
        this.audioContext
            .decodeAudioData(arrayBuffer.slice(0))
            .then(function (audioBuffer) {
            var audioBufferSourceNode = _this.audioContext.createBufferSource();
            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.connect(_this.mainGainNode);
            audioBufferSourceNode.start();
            audioBufferSourceNode.loop = audioPlayingOptions.loop;
            audioBufferSourceNode.addEventListener("ended", function () {
                Object.entries(_this.playingSounds).forEach(function (n) {
                    if (n[0] === id) {
                        console.log("Audio buffer ended event: ".concat(id));
                        delete _this.playingSounds[id];
                    }
                });
            });
        });
    };
    AudioController.AUDIO_CONTROLLER_DI = "AudioController";
    return AudioController;
}());
exports.AudioController = AudioController;
