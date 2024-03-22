# Electron File Download Manager

[![NPM version](https://img.shields.io/npm/v/electron-dl-manager.svg?style=flat-square)](https://www.npmjs.com/package/electron-dl-manager) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A simple and easy to use file download manager for Electron applications. 
Designed in response to the many issues around `electron-dl` and provides 
a more robust and reliable solution for downloading files in Electron.

Use cases:

- Download files from a URL
- Get an id associated with the download to track it
- Optionally show a "Save As" dialog
- Get progress updates on the download
- Be able to cancel / pause / resume downloads
- Support multiple downloads at once

Electron 26.0.0 or later is required.

```typescript
// In main process
// Not a working example, just a demonstration of the API
import { FileDownloadManager } from 'electron-dl-manager';

const manager = new FileDownloadManager();

// Start a download
manager.download({
  window: browserWindowInstance,
  url: 'https://example.com/file.zip',
  saveDialogOptions: {
    title: 'Save File',
  },
  callbacks: {
    onDownloadStarted: async ({ id, item, webContents }) => {
      // Do something with the download id
    },
    onDownloadProgress: async (...) => {},
    onDownloadCompleted: async (...) => {},
    onDownloadCancelled: async (...) => {},
    onDownloadInterrupted: async (...) => {},
    onError: (err, data) => {},
  }
});

manager.cancelDownload(id);
manager.pauseDownload(id);
manager.resumeDownload(id);
```

# Table of Contents

- [Installation](#installation)
- [Getting started](#getting-started)
- [API](#api)
  * [Class: `FileDownloadManager`](#class---filedownloadmanager-)
    + [`constructor()`](#-constructor---)
    + [`download()`](#-download---)
      - [Interface: `DownloadParams`](#interface---downloadparams-)
      - [Interface: `DownloadManagerCallbacks`](#interface---downloadmanagercallbacks-)
    + [`cancelDownload()`](#-canceldownload---)
    + [`pauseDownload()`](#-pausedownload---)
    + [`resumeDownload()`](#-resumedownload---)
    + [`getActiveDownloadCount()`](#-getactivedownloadcount---)
- [Acknowledgments](#acknowledgments)

# Installation

```bash
$ npm install electron-dl-manager
```

# Getting started

You'll want to use `electron-dl-manager` in the main process of your 
Electron application where you will be handling the file downloads.

In this example, we use [IPC handlers / invokers](https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way) 
to communicate between the main and renderer processes, but you can 
use any IPC strategy you want.

```typescript
// MainIpcHandlers.ts

import { FileDownloadManager } from 'electron-dl-manager';
import { ipcMain } from 'electron';

const manager = new FileDownloadManager();

// Renderer would invoke this handler to start a download
ipcMain.handle('download-file', async (event, args) => {
  const { url } = args;

  let downloadId
  const browserWindow = BrowserWindow.fromId(event.sender.id)

  downloadId = manager.download({
    window: browserWindow,
    url,
    callbacks: {
      // item is an instance of Electron.DownloadItem
      onDownloadStarted: async ({ id, item, resolvedFilename }) => {
        // Send the download id back to the renderer along
        // with some other data
        browserWindow.webContents.invoke('download-started', {
          id,
          // The filename that the file will be saved as
          filename: resolvedFilename,
          // Get the file size to be downloaded in bytes
          totalBytes: item.getTotalBytes(),
        });
      },
      onDownloadProgress: async ({ id, item, percentCompleted }) => {
        // Send the download progress back to the renderer
        browserWindow.webContents.invoke('download-progress', {
          id,
          percentCompleted,
          // Get the number of bytes received so far
          bytesReceived: item.getReceivedBytes(),
        });
      },
      onDownloadCompleted: async ({ id, item }) => {
        // Send the download completion back to the renderer
        browserWindow.webContents.invoke('download-completed', {
          id,
          // Get the path to the file that was downloaded
          filePath: item.getSavePath(),
        });
      },
      onError: (err, data) => {
        // ... handle any errors
      }
    }
  });
  
  // Pause the download
  manager.pauseDownload(downloadId);
});
```

# API 

## Class: `FileDownloadManager`

Manages file downloads in an Electron application.

### `constructor()`

```typescript
constructor(params: DownloadManagerConstructorParams)
```

```typescript
interface DownloadManagerConstructorParams {
  /**
   * If defined, will log out internal debug messages
   */
  debugLogger?: (message: string) => void
}
```

### `download()`

Starts a file download. Returns the `id` of the download.

```typescript
download(params: DownloadParams): string
```

#### Interface: `DownloadParams`

```typescript
interface DownloadParams {
  /**
   * The Electron.BrowserWindow instance
   */
  window: BrowserWindow
  /**
   * The URL to download
   */
  url: string
  /**
   * The callbacks to define to listen for download events
   */
  callbacks: DownloadManagerCallbacks
  /**
   * Electron.DownloadURLOptions to pass to the downloadURL method
   *
   * @see https://www.electronjs.org/docs/latest/api/session#sesdownloadurlurl-options
   */
  downloadURLOptions?: Electron.DownloadURLOptions
  /**
   * If defined, will show a save dialog when the user
   * downloads a file.
   * 
   * @see https://www.electronjs.org/docs/latest/api/dialog#dialogshowsavedialogbrowserwindow-options
   */
  saveDialogOptions?: SaveDialogOptions
  /**
   * The filename to save the file as. If not defined, the filename
   * from the server will be used.
   *
   * Only applies if saveDialogOptions is not defined.
   */
  saveAsFilename?: string
  /**
   * The directory to save the file to. Must be an absolute path.
   * @default The user's downloads directory
   */
  directory?: string
  /**
   * If true, will overwrite the file if it already exists
   * @default false
   */
  overwrite?: boolean
  /**
   * If true, will show a badge on the dock icon when the download is in progress
   * under MacOS and linux.
   * 
   * On macOS, you need to ensure that your application has the permission to display notifications for this method to work.
   *
   * @default false
   * @see https://www.electronjs.org/docs/latest/api/app#appsetbadgecountcount-linux-macos
   */
  showBadge?: boolean
}
```

#### Interface: `DownloadManagerCallbacks`

```typescript
interface DownloadManagerCallbacks {
  /**
   * When the download has started. When using a "save as" dialog,
   * this will be called after the user has selected a location.
   *
   * This will always be called first before the progress and completed events.
   */
  onDownloadStarted: (data: DownloadManagerCallbackData) => void
  /**
   * When there is a progress update on a download. Note: This
   * may be skipped entirely in some cases, where the download
   * completes immediately. In that case, onDownloadCompleted
   * will be called instead.
   */
  onDownloadProgress: (data: DownloadManagerCallbackData) => void
  /**
   * When the download has completed
   */
  onDownloadCompleted: (data: DownloadManagerCallbackData) => void
  /**
   * When the download has been cancelled. Also called if the user cancels
   * from the save as dialog.
   */
  onDownloadCancelled: (data: DownloadManagerCallbackData) => void
  /**
   * When the download has been interrupted. This could be due to a bad
   * connection, the server going down, etc.
   */
  onDownloadInterrupted: (data: DownloadManagerCallbackData) => void
  /**
   * When an error has been encountered.
   * Note: The signature is (error, <maybe some data>).
   */
  onError: (error: Error, data?: Partial<DownloadManagerCallbackData>) => void
}

interface DownloadManagerItem {
  /**
   * Generated id for the download
   */
  id: string
  /**
   * The percentage of the download that has been completed
   */
  percentCompleted: number
  /**
   * The name of the file that is being saved to the user's computer.
   * Recommended over Item.getFilename() as it may be inaccurate when using the save as dialog.
   */
  resolvedFilename: string
  /**
   * If true, the download was cancelled from the save as dialog
   */
  cancelledFromSaveAsDialog?: boolean
}

interface DownloadManagerCallbackData extends DownloadManagerItem {
  /**
   * The Electron.DownloadItem. Use this to grab the filename, path, etc.
   * @see https://www.electronjs.org/docs/latest/api/download-item
   */
  item: DownloadItem
  /**
   * The Electron.WebContents
   * @see https://www.electronjs.org/docs/latest/api/web-contents
   */
  webContents: WebContents
  /**
   * The Electron.Event
   * @see https://www.electronjs.org/docs/latest/api/event
   */
  event: Event
}
```

### `cancelDownload()`

Cancels a download.

```typescript
cancelDownload(id: string): void
```

### `pauseDownload()`

Pauses a download.

```typescript
pauseDownload(id: string): void
```

### `resumeDownload()`

Resumes a download.

```typescript
resumeDownload(id: string): void
```

### `getActiveDownloadCount()`

Returns the number of active downloads.

```typescript
getActiveDownloadCount(): number
```

# Mock class

If you need to mock out `ElectronDownloadManager` in your tests, you can use the `ElectronDownloadManagerMock` class.

`import { ElectronDownloadManagerMock } from 'electron-dl-manager'`

```typescript

# Acknowledgments

This code uses small portions from [`electron-dl`](https://github.com/sindresorhus/electron-dl) and is noted in the 
code where it is used.

`electron-dl` is licensed under the MIT License and is maintained by Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com).
