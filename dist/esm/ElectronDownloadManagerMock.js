import { DownloadData } from "./DownloadData";
/**
 * Mock version of ElectronDownloadManager
 * that can be used for testing purposes
 */
export class ElectronDownloadManagerMock {
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
        const downloadData = new DownloadData();
        downloadData.id = id;
        return downloadData;
    }
}
//# sourceMappingURL=ElectronDownloadManagerMock.js.map