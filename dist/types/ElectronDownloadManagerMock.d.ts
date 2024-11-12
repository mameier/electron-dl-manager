import { DownloadData } from "./DownloadData";
import type { ContinueConfig, DownloadConfig, IElectronDownloadManager } from "./types";
/**
 * Mock version of ElectronDownloadManager
 * that can be used for testing purposes
 */
export declare class ElectronDownloadManagerMock implements IElectronDownloadManager {
    download(_params: DownloadConfig): Promise<string>;
    continueDownload(_params: ContinueConfig): Promise<string>;
    cancelDownload(_id: string): void;
    pauseDownload(_id: string): void;
    resumeDownload(_id: string): void;
    getActiveDownloadCount(): number;
    getDownloadData(id: string): DownloadData;
}
