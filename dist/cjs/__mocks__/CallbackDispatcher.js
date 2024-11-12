"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackDispatcher = void 0;
exports.CallbackDispatcher = jest.fn().mockImplementation(() => {
    return {
        onDownloadStarted: jest.fn(),
        onDownloadCompleted: jest.fn(),
        onDownloadCancelled: jest.fn(),
        onDownloadProgress: jest.fn(),
        onDownloadInterrupted: jest.fn(),
        handleError: jest.fn(),
    };
});
//# sourceMappingURL=CallbackDispatcher.js.map