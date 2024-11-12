"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronDownloadManager = void 0;
const DownloadInitiator_1 = require("./DownloadInitiator");
const utils_1 = require("./utils");
const node_path_1 = __importDefault(require("node:path"));
const fs = __importStar(require("node:fs"));
/**
 * This is used to solve an issue where multiple downloads are started at the same time.
 * For example, Promise.all([download1, download2, ...]) will start both downloads at the same
 * time. This is problematic because the will-download event is not guaranteed to fire in the
 * order that the downloads were started.
 *
 * So we use this to make sure that will-download fires in the order that the downloads were
 * started by executing the downloads in a sequential fashion.
 *
 * For more information see:
 * https://github.com/theogravity/electron-dl-manager/issues/11
 */
class DownloadQueue {
    promise = Promise.resolve();
    add(task) {
        this.promise = this.promise.then(() => task());
        return this.promise;
    }
}
/**
 * Enables handling downloads in Electron.
 */
class ElectronDownloadManager {
    downloadData;
    logger;
    downloadQueue = new DownloadQueue();
    constructor(params = {}) {
        this.downloadData = {};
        this.logger = params.debugLogger || (() => { });
    }
    log(message) {
        this.logger(message);
    }
    /**
     * Returns the current download data
     */
    getDownloadData(id) {
        return this.downloadData[id];
    }
    /**
     * Cancels a download
     */
    cancelDownload(id) {
        const data = this.downloadData[id];
        if (data?.item) {
            this.log(`[${id}] Cancelling download`);
            data.item.cancel();
        }
        else {
            this.log(`[${id}] Download ${id} not found for cancellation`);
        }
    }
    /**
     * Pauses a download
     */
    pauseDownload(id) {
        const data = this.downloadData[id];
        if (data?.item) {
            this.log(`[${id}] Pausing download`);
            data.item.pause();
        }
        else {
            this.log(`[${id}] Download ${id} not found for pausing`);
        }
    }
    /**
     * Resumes a download
     */
    resumeDownload(id) {
        const data = this.downloadData[id];
        if (data?.item?.isPaused()) {
            this.log(`[${id}] Resuming download`);
            data.item.resume();
        }
        else {
            this.log(`[${id}] Download ${id} not found or is not in a paused state`);
        }
    }
    /**
     * Returns the number of active downloads
     */
    getActiveDownloadCount() {
        return Object.values(this.downloadData).filter((data) => data.isDownloadInProgress()).length;
    }
    /**
     * Starts a download. If saveDialogOptions has been defined in the config,
     * the saveAs dialog will show up first.
     *
     * Returns the id of the download.
     */
    async download(params) {
        return this.downloadQueue.add(() => new Promise((resolve, reject) => {
            try {
                if (params.saveAsFilename && params.saveDialogOptions) {
                    return reject(Error("You cannot define both saveAsFilename and saveDialogOptions to start a download"));
                }
                const downloadInitiator = new DownloadInitiator_1.DownloadInitiator({
                    debugLogger: this.logger,
                    onCleanup: (data) => {
                        this.cleanup(data);
                    },
                    onDownloadInit: (data) => {
                        this.downloadData[data.id] = data;
                        resolve(data.id);
                    },
                });
                this.log(`[${downloadInitiator.getDownloadId()}] Registering download for url: ${(0, utils_1.truncateUrl)(params.url)}`);
                params.window.webContents.session.once("will-download", downloadInitiator.generateOnWillDownload(params));
                params.window.webContents.downloadURL(params.url, params.downloadURLOptions);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * restarts in interrupted download. The file at path must exist and is appended to.
     *
     * @param params
     */
    async continueDownload(params) {
        return this.downloadQueue.add(() => new Promise((resolve, reject) => {
            try {
                const filePath = node_path_1.default.join(params.directory, params.saveAsFilename);
                if (!fs.existsSync(filePath)) {
                    return reject(Error("Could not find file"));
                }
                const stats = fs.statSync(filePath);
                const fileOffset = stats.size;
                const downloadInitiator = new DownloadInitiator_1.DownloadInitiator({
                    debugLogger: this.logger,
                    onCleanup: (data) => {
                        this.cleanup(data);
                    },
                    onDownloadInit: (data) => {
                        this.downloadData[data.id] = data;
                        resolve(data.id);
                    },
                });
                const downloadOptions = {
                    path: filePath,
                    urlChain: params.urlChain,
                    offset: fileOffset,
                    length: params.length,
                    lastModified: params.lastModified,
                    eTag: params.eTag,
                };
                const initiateOptions = {
                    callbacks: params.callbacks,
                    directory: params.directory,
                    saveAsFilename: params.saveAsFilename,
                    overwrite: true,
                };
                this.log(`[${downloadInitiator.getDownloadId()}] continue Download of ${filePath} for ${(0, utils_1.truncateUrl)(params.urlChain[0])}`);
                const session = params.window.webContents.session;
                session.once("will-download", downloadInitiator.generateOnWillDownload(initiateOptions));
                session.createInterruptedDownload(downloadOptions);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    cleanup(data) {
        delete this.downloadData[data.id];
    }
    /**
     * Enables network throttling on a BrowserWindow. Settings apply to *all*
     * transfers in the window, not just downloads. Settings may be persistent
     * on application restart, so use `disableThrottle` to reset after you're done
     * testing.
     * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions
     * @see https://github.com/electron/electron/issues/21250
     */
    static async throttleConnections(window, conditions) {
        const dbg = window.webContents.debugger;
        dbg.attach();
        await dbg.sendCommand("Network.enable");
        await dbg.sendCommand("Network.emulateNetworkConditions", conditions);
    }
    /**
     * Disables network throttling on a BrowserWindow
     */
    static async disableThrottle(window) {
        const dbg = window.webContents.debugger;
        dbg.attach();
        await dbg.sendCommand("Network.enable");
        await dbg.sendCommand("Network.emulateNetworkConditions", {
            offline: false,
            downloadThroughput: -1,
            uploadThroughput: -1,
            latency: 0,
        });
        dbg.detach();
    }
}
exports.ElectronDownloadManager = ElectronDownloadManager;
//# sourceMappingURL=ElectronDownloadManager.js.map