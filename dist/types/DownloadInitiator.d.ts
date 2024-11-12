import type { DownloadItem, Event, SaveDialogOptions, WebContents } from "electron";
import { DownloadData } from "./DownloadData";
import type { DownloadManagerCallbacks } from "./types";
interface DownloadInitiatorConstructorParams {
    debugLogger?: (message: string) => void;
    onCleanup?: (id: DownloadData) => void;
    onDownloadInit?: (id: DownloadData) => void;
}
interface WillOnDownloadParams {
    /**
     * The callbacks to define to listen for download events
     */
    callbacks: DownloadManagerCallbacks;
    /**
     * If defined, will show a save dialog when the user
     * downloads a file.
     *
     * @see https://www.electronjs.org/docs/latest/api/dialog#dialogshowsavedialogbrowserwindow-options
     */
    saveDialogOptions?: SaveDialogOptions;
    /**
     * The filename to save the file as. If not defined, the filename
     * from the server will be used.
     *
     * Only applies if saveDialogOptions is not defined.
     */
    saveAsFilename?: string;
    /**
     * The directory to save the file to. Must be an absolute path.
     * @default The user's downloads directory
     */
    directory?: string;
    /**
     * If true, will overwrite or append the file if it already exists
     * @default false
     */
    overwrite?: boolean;
}
export declare class DownloadInitiator {
    protected logger: (message: string) => void;
    /**
     * The handler for the DownloadItem's `updated` event.
     */
    private onItemUpdated;
    /**
     * The handler for the DownloadItem's `done` event.
     */
    private onItemDone;
    /**
     * When the download is initiated
     */
    private onDownloadInit;
    /**
     * When cleanup is called
     */
    private onCleanup;
    /**
     * The callback dispatcher for handling download events.
     */
    private callbackDispatcher;
    /**
     * The data for the download.
     */
    private downloadData;
    private config;
    private onUpdateHandler?;
    constructor(config: DownloadInitiatorConstructorParams);
    protected log(message: string): void;
    /**
     * Returns the download id
     */
    getDownloadId(): string;
    /**
     * Returns the current download data
     */
    getDownloadData(): DownloadData;
    /**
     * Generates the handler that attaches to the session `will-download` event,
     * which will execute the workflows for handling a download.
     */
    generateOnWillDownload(downloadParams: WillOnDownloadParams): (event: Event, item: DownloadItem, webContents: WebContents) => Promise<void>;
    /**
     * Flow for handling a download that requires user interaction via a "Save as" dialog.
     */
    protected initSaveAsInteractiveDownload(): void;
    private augmentDownloadItem;
    /**
     * Flow for handling a download that doesn't require user interaction.
     */
    protected initNonInteractiveDownload(): Promise<void>;
    protected updateProgress(): void;
    /**
     * Generates the handler for hooking into the DownloadItem's `updated` event.
     */
    protected generateItemOnUpdated(): (_event: Event, state: "progressing" | "interrupted") => Promise<void>;
    /**
     * Generates the handler for hooking into the DownloadItem's `done` event.
     */
    protected generateItemOnDone(): (_event: Event, state: "completed" | "cancelled" | "interrupted") => Promise<void>;
    protected cleanup(): void;
}
export {};
