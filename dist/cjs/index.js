"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateUrl = exports.generateRandomId = exports.getFilenameFromMime = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./ElectronDownloadManager"), exports);
__exportStar(require("./CallbackDispatcher"), exports);
__exportStar(require("./DownloadData"), exports);
__exportStar(require("./DownloadInitiator"), exports);
__exportStar(require("./ElectronDownloadManagerMock"), exports);
var utils_1 = require("./utils");
Object.defineProperty(exports, "getFilenameFromMime", { enumerable: true, get: function () { return utils_1.getFilenameFromMime; } });
var utils_2 = require("./utils");
Object.defineProperty(exports, "generateRandomId", { enumerable: true, get: function () { return utils_2.generateRandomId; } });
var utils_3 = require("./utils");
Object.defineProperty(exports, "truncateUrl", { enumerable: true, get: function () { return utils_3.truncateUrl; } });
//# sourceMappingURL=index.js.map