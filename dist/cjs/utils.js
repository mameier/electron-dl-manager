"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDownloadMetrics = exports.determineFilePath = exports.getFilenameFromMime = exports.generateRandomId = exports.truncateUrl = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
const ext_name_1 = __importDefault(require("ext-name"));
const unused_filename_1 = __importDefault(require("unused-filename"));
function truncateUrl(url) {
    if (url.length > 50) {
        return `${url.slice(0, 50)}...`;
    }
    return url;
}
exports.truncateUrl = truncateUrl;
function generateRandomId() {
    const currentTime = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    const combinedValue = currentTime.toString() + randomNum.toString();
    const hash = node_crypto_1.default.createHash("sha256");
    hash.update(combinedValue);
    return hash.digest("hex").substring(0, 6);
}
exports.generateRandomId = generateRandomId;
// Copied from https://github.com/sindresorhus/electron-dl/blob/main/index.js#L10
function getFilenameFromMime(name, mime) {
    const extensions = ext_name_1.default.mime(mime);
    if (extensions.length !== 1) {
        return name;
    }
    return `${name}.${extensions[0].ext}`;
}
exports.getFilenameFromMime = getFilenameFromMime;
/**
 * Determines the initial file path for the download.
 */
function determineFilePath({ directory, saveAsFilename, item, overwrite, }) {
    // Code adapted from https://github.com/sindresorhus/electron-dl/blob/main/index.js#L73
    if (directory && !node_path_1.default.isAbsolute(directory)) {
        throw new Error("The `directory` option must be an absolute path");
    }
    directory = directory || electron_1.app?.getPath("downloads");
    let filePath;
    if (saveAsFilename) {
        filePath = node_path_1.default.join(directory, saveAsFilename);
    }
    else {
        const filename = item.getFilename();
        const name = node_path_1.default.extname(filename) ? filename : getFilenameFromMime(filename, item.getMimeType());
        filePath = overwrite ? node_path_1.default.join(directory, name) : unused_filename_1.default.sync(node_path_1.default.join(directory, name));
    }
    return filePath;
}
exports.determineFilePath = determineFilePath;
/**
 * Calculates the download rate and estimated time remaining for a download.
 * @returns {object} An object containing the download rate in bytes per second and the estimated time remaining in seconds.
 */
function calculateDownloadMetrics(item) {
    const downloadedBytes = item.getReceivedBytes();
    const totalBytes = item.getTotalBytes();
    const startTimeSecs = item.getStartTime();
    const currentTimeSecs = Math.floor(new Date().getTime() / 1000);
    const elapsedTimeSecs = currentTimeSecs - startTimeSecs;
    // Avail in Electron 30.3.0+
    let downloadRateBytesPerSecond = item.getCurrentBytesPerSecond ? item.getCurrentBytesPerSecond() : 0;
    let estimatedTimeRemainingSeconds = 0;
    if (elapsedTimeSecs > 0) {
        if (!downloadRateBytesPerSecond) {
            downloadRateBytesPerSecond = downloadedBytes / elapsedTimeSecs;
        }
        if (downloadRateBytesPerSecond > 0) {
            estimatedTimeRemainingSeconds = (totalBytes - downloadedBytes) / downloadRateBytesPerSecond;
        }
    }
    let percentCompleted = 0;
    // Avail in Electron 30.3.0+
    if (item.getPercentComplete) {
        percentCompleted = item.getPercentComplete();
    }
    else {
        percentCompleted =
            totalBytes > 0 ? Math.min(Number.parseFloat(((downloadedBytes / totalBytes) * 100).toFixed(2)), 100) : 0;
    }
    return {
        percentCompleted,
        downloadRateBytesPerSecond,
        estimatedTimeRemainingSeconds,
    };
}
exports.calculateDownloadMetrics = calculateDownloadMetrics;
//# sourceMappingURL=utils.js.map