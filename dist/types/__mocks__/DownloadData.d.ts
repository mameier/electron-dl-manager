/// <reference types="jest" />
/// <reference types="node" />
import { EventEmitter } from "node:events";
import { type DownloadData as ActualDownloadData } from "../index";
export declare const DownloadData: jest.Mock<any, any, any>;
export declare function createMockDownloadData(): {
    downloadData: jest.Mocked<ActualDownloadData>;
    item: jest.Mocked<Electron.DownloadItem>;
    itemEmitter: EventEmitter<[never]>;
};
