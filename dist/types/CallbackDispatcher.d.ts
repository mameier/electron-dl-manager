import type { DownloadData } from "./DownloadData";
import type { DebugLoggerFn, DownloadManagerCallbacks } from "./types";
/**
 * Wraps around the callbacks to handle errors and logging
 */
export declare class CallbackDispatcher {
    protected logger: DebugLoggerFn;
    callbacks: DownloadManagerCallbacks;
    downloadDataId: string;
    constructor(downloadDataId: string, callbacks: DownloadManagerCallbacks, logger: (message: string) => void);
    protected log(message: string): void;
    onDownloadStarted(downloadData: DownloadData): Promise<void>;
    onDownloadCompleted(downloadData: DownloadData): Promise<void>;
    onDownloadProgress(downloadData: DownloadData): Promise<void>;
    onDownloadCancelled(downloadData: DownloadData): Promise<void>;
    onDownloadInterrupted(downloadData: DownloadData): Promise<void>;
    handleError(error: Error, downloadData?: DownloadData): void;
}
