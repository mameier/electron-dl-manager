import { type DownloadItem } from "electron";
export declare function truncateUrl(url: string): string;
export declare function generateRandomId(): string;
export declare function getFilenameFromMime(name: string, mime: string): string;
/**
 * Determines the initial file path for the download.
 */
export declare function determineFilePath({ directory, saveAsFilename, item, overwrite, }: {
    directory?: string;
    saveAsFilename?: string;
    item: DownloadItem;
    overwrite?: boolean;
}): string;
/**
 * Calculates the download rate and estimated time remaining for a download.
 * @returns {object} An object containing the download rate in bytes per second and the estimated time remaining in seconds.
 */
export declare function calculateDownloadMetrics(item: DownloadItem): {
    percentCompleted: number;
    downloadRateBytesPerSecond: number;
    estimatedTimeRemainingSeconds: number;
};
