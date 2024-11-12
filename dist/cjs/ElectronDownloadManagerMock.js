"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronDownloadManagerMock = void 0;
const DownloadData_1 = require("./DownloadData");
/**
 * Mock version of ElectronDownloadManager
 * that can be used for testing purposes
 */
class ElectronDownloadManagerMock {
    async download(_params) {
        return "mock-download-id";
    }
    async continueDownload(_params) {
        return "mock-download-id";
    }
    cancelDownload(_id) { }
    pauseDownload(_id) { }
    resumeDownload(_id) { }
    getActiveDownloadCount() {
        return 0;
    }
    getDownloadData(id) {
        const downloadData = new DownloadData_1.DownloadData();
        downloadData.id = id;
        return downloadData;
    }
}
exports.ElectronDownloadManagerMock = ElectronDownloadManagerMock;
//# sourceMappingURL=ElectronDownloadManagerMock.js.map