import { DownloadData } from "./DownloadData";
import type {ContinueConfig, DownloadConfig, IElectronDownloadManager} from "./types";

/**
 * Mock version of ElectronDownloadManager
 * that can be used for testing purposes
 */
export class ElectronDownloadManagerMock implements IElectronDownloadManager {
  async download(_params: DownloadConfig): Promise<string> {
    return "mock-download-id";
  }

  async continueDownload(_params: ContinueConfig): Promise<string> {
    return "mock-download-id";
  }

  cancelDownload(_id: string): void {}

  pauseDownload(_id: string): void {}

  resumeDownload(_id: string): void {}

  getActiveDownloadCount(): number {
    return 0;
  }

  getDownloadData(id: string) {
    const downloadData = new DownloadData();
    downloadData.id = id;
    return downloadData;
  }
}
