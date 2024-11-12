"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadInitiator = void 0;
const CallbackDispatcher_1 = require("./CallbackDispatcher");
const DownloadData_1 = require("./DownloadData");
exports.DownloadInitiator = jest.fn().mockImplementation((config) => {
    const initator = {
        logger: jest.fn(),
        onItemUpdated: jest.fn(),
        onItemDone: jest.fn(),
        onDownloadInit: jest.fn(),
        onCleanup: jest.fn(),
        callbackDispatcher: new CallbackDispatcher_1.CallbackDispatcher(),
        downloadData: new DownloadData_1.DownloadData(),
        config: { callbacks: {} },
        log: jest.fn(),
        getDownloadId: jest.fn(),
        getDownloadData: jest.fn(),
        generateOnWillDownload: jest.fn(() => async () => {
            config.onDownloadInit(new DownloadData_1.DownloadData());
        }),
        initSaveAsInteractiveDownload: jest.fn(),
        initNonInteractiveDownload: jest.fn(),
        generateItemOnUpdated: jest.fn(),
        generateItemOnDone: jest.fn(),
        cleanup: jest.fn(),
        updateProgress: jest.fn(),
    };
    return initator;
});
//# sourceMappingURL=DownloadInitiator.js.map