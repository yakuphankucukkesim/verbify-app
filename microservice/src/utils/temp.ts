import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export async function createTempDirectory(prefix: string): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function cleanupTempDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true });
  } catch (error) {
    console.error('Error cleaning up temporary directory:', error);
  }
}