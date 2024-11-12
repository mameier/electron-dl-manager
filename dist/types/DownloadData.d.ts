import type { DownloadItem, Event, WebContents } from "electron";
/**
 * Contains the data for a download.
 */
export declare class DownloadData {
    /**
     * Generated id for the download
     */
    id: string;
    /**
     * The Electron.DownloadItem. Use this to grab the filename, path, etc.
     * @see https://www.electronjs.org/docs/latest/api/download-item
     */
    item: DownloadItem;
    /**
     * The Electron.WebContents
     * @see https://www.electronjs.org/docs/latest/api/web-contents
     */
    webContents: WebContents;
    /**
     * The Electron.Event
     * @see https://www.electronjs.org/docs/latest/api/event
     */
    event: Event;
    /**
     * The name of the file that is being saved to the user's computer.
     * Recommended over Item.getFilename() as it may be inaccurate when using the save as dialog.
     */
    resolvedFilename: string;
    /**
     * If true, the download was cancelled from the save as dialog. This flag
     * will also be true if the download was cancelled by the application when
     * using the save as dialog.
     */
    cancelledFromSaveAsDialog?: boolean;
    /**
     * The percentage of the download that has been completed
     */
    percentCompleted: number;
    /**
     * The download rate in bytes per second.
     */
    downloadRateBytesPerSecond: number;
    /**
     * The estimated time remaining in seconds.
     */
    estimatedTimeRemainingSeconds: number;
    /**
     * If the download was interrupted, the state in which it was interrupted from
     */
    interruptedVia?: "in-progress" | "completed";
    constructor();
    isDownloadInProgress(): boolean;
    isDownloadCompleted(): boolean;
    isDownloadCancelled(): boolean;
    isDownloadInterrupted(): boolean;
    isDownloadResumable(): boolean;
    isDownloadPaused(): boolean;
}
