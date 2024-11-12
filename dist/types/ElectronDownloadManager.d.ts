import type { BrowserWindow } from "electron";
import type { DownloadData } from "./DownloadData";
import type { ContinueConfig, DebugLoggerFn, DownloadConfig, DownloadManagerConstructorParams, IElectronDownloadManager } from "./types";
/**
 * Enables handling downloads in Electron.
 */
export declare class ElectronDownloadManager implements IElectronDownloadManager {
    protected downloadData: Record<string, DownloadData>;
    protected logger: DebugLoggerFn;
    private downloadQueue;
    constructor(params?: DownloadManagerConstructorParams);
    protected log(message: string): void;
    /**
     * Returns the current download data
     */
    getDownloadData(id: string): DownloadData;
    /**
     * Cancels a download
     */
    cancelDownload(id: string): void;
    /**
     * Pauses a download
     */
    pauseDownload(id: string): void;
    /**
     * Resumes a download
     */
    resumeDownload(id: string): void;
    /**
     * Returns the number of active downloads
     */
    getActiveDownloadCount(): number;
    /**
     * Starts a download. If saveDialogOptions has been defined in the config,
     * the saveAs dialog will show up first.
     *
     * Returns the id of the download.
     */
    download(params: DownloadConfig): Promise<string>;
    /**
     * restarts in interrupted download. The file at path must exist and is appended to.
     *
     * @param params
     */
    continueDownload(params: ContinueConfig): Promise<string>;
    protected cleanup(data: DownloadData): void;
    /**
     * Enables network throttling on a BrowserWindow. Settings apply to *all*
     * transfers in the window, not just downloads. Settings may be persistent
     * on application restart, so use `disableThrottle` to reset after you're done
     * testing.
     * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions
     * @see https://github.com/electron/electron/issues/21250
     */
    static throttleConnections(window: BrowserWindow, conditions: {
        offline?: boolean;
        latency?: number;
        downloadThroughput?: number;
        uploadThroughput?: number;
        connectionType?: string;
        packetLoss?: number;
        packetQueueLength?: number;
        packetReordering?: number;
    }): Promise<void>;
    /**
     * Disables network throttling on a BrowserWindow
     */
    static disableThrottle(window: BrowserWindow): Promise<void>;
}
