"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackDispatcher = void 0;
/**
 * Wraps around the callbacks to handle errors and logging
 */
class CallbackDispatcher {
    logger;
    callbacks;
    downloadDataId;
    constructor(downloadDataId, callbacks, logger) {
        this.downloadDataId = downloadDataId;
        this.callbacks = callbacks;
        this.logger = logger;
    }
    log(message) {
        this.logger(`[${this.downloadDataId}] ${message}`);
    }
    async onDownloadStarted(downloadData) {
        const { callbacks } = this;
        if (callbacks.onDownloadStarted) {
            this.log("Calling onDownloadStarted");
            try {
                await callbacks.onDownloadStarted(downloadData);
            }
            catch (e) {
                this.log(`Error during onDownloadStarted: ${e}`);
                this.handleError(e);
            }
        }
    }
    async onDownloadCompleted(downloadData) {
        const { callbacks } = this;
        if (callbacks.onDownloadCompleted) {
            this.log("Calling onDownloadCompleted");
            try {
                await callbacks.onDownloadCompleted(downloadData);
            }
            catch (e) {
                this.log(`Error during onDownloadCompleted: ${e}`);
                this.handleError(e);
            }
        }
    }
    async onDownloadProgress(downloadData) {
        const { callbacks } = this;
        if (callbacks.onDownloadProgress) {
            this.log(` Calling onDownloadProgress ${downloadData.percentCompleted}%`);
            try {
                await callbacks.onDownloadProgress(downloadData);
            }
            catch (e) {
                this.log(`Error during onDownloadProgress: ${e}`);
                this.handleError(e);
            }
        }
    }
    async onDownloadCancelled(downloadData) {
        const { callbacks } = this;
        if (callbacks.onDownloadCancelled) {
            this.log("Calling onDownloadCancelled");
            try {
                await callbacks.onDownloadCancelled(downloadData);
            }
            catch (e) {
                this.log(`Error during onDownloadCancelled: ${e}`);
                this.handleError(e);
            }
        }
    }
    async onDownloadInterrupted(downloadData) {
        const { callbacks } = this;
        if (callbacks.onDownloadInterrupted) {
            this.log("Calling onDownloadInterrupted");
            try {
                await callbacks.onDownloadInterrupted(downloadData);
            }
            catch (e) {
                this.log(`Error during onDownloadInterrupted: ${e}`);
                this.handleError(e);
            }
        }
    }
    handleError(error, downloadData) {
        const { callbacks } = this;
        if (callbacks.onError) {
            callbacks.onError(error, downloadData);
        }
    }
}
exports.CallbackDispatcher = CallbackDispatcher;
//# sourceMappingURL=CallbackDispatcher.js.map