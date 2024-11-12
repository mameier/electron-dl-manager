"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDownloadData = exports.DownloadData = void 0;
const node_events_1 = require("node:events");
const index_1 = require("../index");
exports.DownloadData = jest.fn().mockImplementation(() => {
    return createMockDownloadData().downloadData;
});
function createMockDownloadData() {
    const itemEmitter = new node_events_1.EventEmitter();
    const item = {
        setSaveDialogOptions: jest.fn(),
        setSavePath: jest.fn(),
        getSavePath: jest.fn().mockReturnValue("/path/to/save"),
        getReceivedBytes: jest.fn().mockReturnValue(900),
        getTotalBytes: jest.fn().mockReturnValue(1000),
        getCurrentBytesPerSecond: jest.fn(),
        getPercentComplete: jest.fn(),
        getStartTime: jest.fn(),
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        isPaused: jest.fn(),
        getState: jest.fn(),
        getFilename: jest.fn().mockReturnValue("filename.txt"),
        // @ts-ignore
        on: itemEmitter.on.bind(itemEmitter),
        // @ts-ignore
        once: itemEmitter.once.bind(itemEmitter),
        // @ts-ignore
        off: itemEmitter.off.bind(itemEmitter),
    };
    const downloadData = {
        id: (0, index_1.generateRandomId)(),
        cancelledFromSaveAsDialog: false,
        percentCompleted: 0,
        downloadRateBytesPerSecond: 0,
        estimatedTimeRemainingSeconds: 0,
        resolvedFilename: `${(0, index_1.generateRandomId)()}.txt`,
        webContents: {},
        event: {},
        isDownloadInProgress: jest.fn(),
        isDownloadCompleted: jest.fn(),
        isDownloadCancelled: jest.fn(),
        isDownloadInterrupted: jest.fn(),
        isDownloadResumable: jest.fn(),
        isDownloadPaused: jest.fn(),
        item,
    };
    return {
        downloadData,
        item,
        itemEmitter,
    };
}
exports.createMockDownloadData = createMockDownloadData;
//# sourceMappingURL=DownloadData.js.map