"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadData = void 0;
const utils_1 = require("./utils");
/**
 * Contains the data for a download.
 */
class DownloadData {
    /**
     * Generated id for the download
     */
    id;
    /**
     * The Electron.DownloadItem. Use this to grab the filename, path, etc.
     * @see https://www.electronjs.org/docs/latest/api/download-item
     */
    item;
    /**
     * The Electron.WebContents
     * @see https://www.electronjs.org/docs/latest/api/web-contents
     */
    webContents;
    /**
     * The Electron.Event
     * @see https://www.electronjs.org/docs/latest/api/event
     */
    event;
    /**
     * The name of the file that is being saved to the user's computer.
     * Recommended over Item.getFilename() as it may be inaccurate when using the save as dialog.
     */
    resolvedFilename;
    /**
     * If true, the download was cancelled from the save as dialog. This flag
     * will also be true if the download was cancelled by the application when
     * using the save as dialog.
     */
    cancelledFromSaveAsDialog;
    /**
     * The percentage of the download that has been completed
     */
    percentCompleted;
    /**
     * The download rate in bytes per second.
     */
    downloadRateBytesPerSecond;
    /**
     * The estimated time remaining in seconds.
     */
    estimatedTimeRemainingSeconds;
    /**
     * If the download was interrupted, the state in which it was interrupted from
     */
    interruptedVia;
    constructor() {
        this.id = (0, utils_1.generateRandomId)();
        this.resolvedFilename = "testFile.txt";
        this.percentCompleted = 0;
        this.cancelledFromSaveAsDialog = false;
        this.item = {};
        this.webContents = {};
        this.event = {};
        this.downloadRateBytesPerSecond = 0;
        this.estimatedTimeRemainingSeconds = 0;
    }
    isDownloadInProgress() {
        return this.item.getState() === "progressing";
    }
    isDownloadCompleted() {
        return this.item.getState() === "completed";
    }
    isDownloadCancelled() {
        return this.item.getState() === "cancelled";
    }
    isDownloadInterrupted() {
        return this.item.getState() === "interrupted";
    }
    isDownloadResumable() {
        return this.item.canResume();
    }
    isDownloadPaused() {
        return this.item.isPaused();
    }
}
exports.DownloadData = DownloadData;
//# sourceMappingURL=DownloadData.js.map