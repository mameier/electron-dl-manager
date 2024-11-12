import * as path from "node:path";
import { CallbackDispatcher } from "./CallbackDispatcher";
import { DownloadData } from "./DownloadData";
import { calculateDownloadMetrics, determineFilePath } from "./utils";
export class DownloadInitiator {
    logger;
    /**
     * The handler for the DownloadItem's `updated` event.
     */
    onItemUpdated;
    /**
     * The handler for the DownloadItem's `done` event.
     */
    onItemDone;
    /**
     * When the download is initiated
     */
    onDownloadInit;
    /**
     * When cleanup is called
     */
    onCleanup;
    /**
     * The callback dispatcher for handling download events.
     */
    callbackDispatcher;
    /**
     * The data for the download.
     */
    downloadData;
    config;
    onUpdateHandler;
    constructor(config) {
        this.downloadData = new DownloadData();
        this.logger = config.debugLogger || (() => { });
        this.onItemUpdated = () => Promise.resolve();
        this.onItemDone = () => Promise.resolve();
        this.onCleanup = config.onCleanup || (() => { });
        this.onDownloadInit = config.onDownloadInit || (() => { });
        this.config = {};
        this.callbackDispatcher = {};
    }
    log(message) {
        this.logger(`[${this.downloadData.id}] ${message}`);
    }
    /**
     * Returns the download id
     */
    getDownloadId() {
        return this.downloadData.id;
    }
    /**
     * Returns the current download data
     */
    getDownloadData() {
        return this.downloadData;
    }
    /**
     * Generates the handler that attaches to the session `will-download` event,
     * which will execute the workflows for handling a download.
     */
    generateOnWillDownload(downloadParams) {
        this.config = downloadParams;
        this.callbackDispatcher = new CallbackDispatcher(this.downloadData.id, downloadParams.callbacks, this.logger);
        return async (event, item, webContents) => {
            item.pause();
            this.downloadData.item = item;
            this.downloadData.webContents = webContents;
            this.downloadData.event = event;
            if (this.onDownloadInit) {
                this.onDownloadInit(this.downloadData);
            }
            if (this.config.saveDialogOptions) {
                this.initSaveAsInteractiveDownload();
                return;
            }
            await this.initNonInteractiveDownload();
        };
    }
    /**
     * Flow for handling a download that requires user interaction via a "Save as" dialog.
     */
    initSaveAsInteractiveDownload() {
        this.log("Prompting save as dialog");
        const { directory, overwrite, saveDialogOptions } = this.config;
        const { item } = this.downloadData;
        const filePath = determineFilePath({ directory, item, overwrite });
        // This actually isn't what shows the save dialog
        // If item.setSavePath() isn't called at all after some tiny period of time,
        // then the save dialog will show up, and it will use the options we set it to here
        item.setSaveDialogOptions({ ...saveDialogOptions, defaultPath: filePath });
        // Because the download happens concurrently as the user is choosing a save location
        // we need to wait for the save location to be chosen before we can start to fire out events
        // there's no good way to listen for this, so we need to poll
        const interval = setInterval(async () => {
            // It seems to unpause sometimes in the dialog situation ???
            // item.getState() value becomes 'completed' for small files
            // before item.resume() is called
            item.pause();
            if (item.getSavePath()) {
                clearInterval(interval);
                this.log(`User selected save path to ${item.getSavePath()}`);
                this.log("Initiating download item handlers");
                this.downloadData.resolvedFilename = path.basename(item.getSavePath());
                this.augmentDownloadItem(item);
                await this.callbackDispatcher.onDownloadStarted(this.downloadData);
                // If for some reason the above pause didn't work...
                // We'll manually call the completed handler
                if (this.downloadData.isDownloadCompleted()) {
                    await this.callbackDispatcher.onDownloadCompleted(this.downloadData);
                }
                else {
                    this.onUpdateHandler = this.generateItemOnUpdated();
                    item.on("updated", this.onUpdateHandler);
                    item.once("done", this.generateItemOnDone());
                }
                if (!item["_userInitiatedPause"]) {
                    item.resume();
                }
            }
            else if (this.downloadData.isDownloadCancelled()) {
                clearInterval(interval);
                this.log("Download was cancelled");
                this.downloadData.cancelledFromSaveAsDialog = true;
                await this.callbackDispatcher.onDownloadCancelled(this.downloadData);
            }
            else {
                this.log("Waiting for save path to be chosen by user");
            }
        }, 1000);
    }
    augmentDownloadItem(item) {
        // This covers if the user manually pauses the download
        // before we have set up the event listeners on the item
        item["_userInitiatedPause"] = false;
        const oldPause = item.pause.bind(item);
        item.pause = () => {
            item["_userInitiatedPause"] = true;
            if (this.onUpdateHandler) {
                // Don't fire progress updates in a paused state
                item.off("updated", this.onUpdateHandler);
                this.onUpdateHandler = undefined;
            }
            oldPause();
        };
        const oldResume = item.resume.bind(item);
        item.resume = () => {
            if (!this.onUpdateHandler) {
                this.onUpdateHandler = this.generateItemOnUpdated();
                item.on("updated", this.onUpdateHandler);
            }
            oldResume();
        };
    }
    /**
     * Flow for handling a download that doesn't require user interaction.
     */
    async initNonInteractiveDownload() {
        const { directory, saveAsFilename, overwrite } = this.config;
        const { item } = this.downloadData;
        const filePath = determineFilePath({ directory, saveAsFilename, item, overwrite });
        this.log(`Setting save path to ${filePath}`);
        item.setSavePath(filePath);
        this.log("Initiating download item handlers");
        this.downloadData.resolvedFilename = path.basename(filePath);
        this.augmentDownloadItem(item);
        await this.callbackDispatcher.onDownloadStarted(this.downloadData);
        this.onUpdateHandler = this.generateItemOnUpdated();
        item.on("updated", this.onUpdateHandler);
        item.once("done", this.generateItemOnDone());
        if (!item["_userInitiatedPause"]) {
            item.resume();
        }
    }
    updateProgress() {
        const { item } = this.downloadData;
        const metrics = calculateDownloadMetrics(item);
        const downloadedBytes = item.getReceivedBytes();
        const totalBytes = item.getTotalBytes();
        if (downloadedBytes > item.getTotalBytes()) {
            // Note: This situation will happen when using data: URIs
            this.log(`Downloaded bytes (${downloadedBytes}) is greater than total bytes (${totalBytes})`);
        }
        this.downloadData.downloadRateBytesPerSecond = metrics.downloadRateBytesPerSecond;
        this.downloadData.estimatedTimeRemainingSeconds = metrics.estimatedTimeRemainingSeconds;
        this.downloadData.percentCompleted = metrics.percentCompleted;
    }
    /**
     * Generates the handler for hooking into the DownloadItem's `updated` event.
     */
    generateItemOnUpdated() {
        return async (_event, state) => {
            switch (state) {
                case "progressing": {
                    this.updateProgress();
                    await this.callbackDispatcher.onDownloadProgress(this.downloadData);
                    break;
                }
                case "interrupted": {
                    this.downloadData.interruptedVia = "in-progress";
                    await this.callbackDispatcher.onDownloadInterrupted(this.downloadData);
                    break;
                }
                default:
                    this.log(`Unexpected itemOnUpdated state: ${state}`);
            }
        };
    }
    /**
     * Generates the handler for hooking into the DownloadItem's `done` event.
     */
    generateItemOnDone() {
        return async (_event, state) => {
            switch (state) {
                case "completed": {
                    this.log(`Download completed. Total bytes: ${this.downloadData.item.getTotalBytes()}`);
                    await this.callbackDispatcher.onDownloadCompleted(this.downloadData);
                    break;
                }
                case "cancelled":
                    this.log(`Download cancelled. Total bytes: ${this.downloadData.item.getReceivedBytes()} / ${this.downloadData.item.getTotalBytes()}`);
                    await this.callbackDispatcher.onDownloadCancelled(this.downloadData);
                    break;
                case "interrupted":
                    this.log(`Download interrupted. Total bytes: ${this.downloadData.item.getReceivedBytes()} / ${this.downloadData.item.getTotalBytes()}`);
                    this.downloadData.interruptedVia = "completed";
                    await this.callbackDispatcher.onDownloadInterrupted(this.downloadData);
                    break;
                default:
                    this.log(`Unexpected itemOnDone state: ${state}`);
            }
            this.cleanup();
        };
    }
    cleanup() {
        const { item } = this.downloadData;
        if (item) {
            this.log("Cleaning up download item event listeners");
            item.removeListener("updated", this.onItemUpdated);
            item.removeListener("done", this.onItemDone);
        }
        if (this.onCleanup) {
            this.onCleanup(this.downloadData);
        }
        this.onUpdateHandler = undefined;
    }
}
//# sourceMappingURL=DownloadInitiator.js.map