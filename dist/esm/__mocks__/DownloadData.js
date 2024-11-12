import { EventEmitter } from "node:events";
import { generateRandomId } from "../index";
export const DownloadData = jest.fn().mockImplementation(() => {
    return createMockDownloadData().downloadData;
});
export function createMockDownloadData() {
    const itemEmitter = new EventEmitter();
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
        id: generateRandomId(),
        cancelledFromSaveAsDialog: false,
        percentCompleted: 0,
        downloadRateBytesPerSecond: 0,
        estimatedTimeRemainingSeconds: 0,
        resolvedFilename: `${generateRandomId()}.txt`,
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
//# sourceMappingURL=DownloadData.js.map