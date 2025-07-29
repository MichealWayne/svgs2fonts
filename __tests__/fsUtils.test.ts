/**
 * @module fsUtils.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for file system utilities
 */

import fs from 'fs';
import path from 'path';
import {
  createIconFile,
  filterSvgFiles,
  fsExistsSync,
  mkdirpSync,
  setFolderSync,
  writeFile,
} from '../src/utils/fsUtils';

// Mock fs module
jest.mock('fs');
jest.mock('mkdirp');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMkdirp = require('mkdirp');

describe('FSUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mkdirpSync', () => {
    it('should create directory successfully', () => {
      mockMkdirp.sync.mockReturnValue(true);

      const result = mkdirpSync('/test/path');

      expect(result).toBe(true);
      expect(mockMkdirp.sync).toHaveBeenCalledWith('/test/path');
    });

    it('should return error when directory creation fails', () => {
      const error = new Error('Permission denied');
      mockMkdirp.sync.mockImplementation(() => {
        throw error;
      });

      const result = mkdirpSync('/test/path');

      expect(result).toBeInstanceOf(Error);
      expect(result).toBe(error);
    });
  });

  describe('setFolderSync', () => {
    it('should return true if folder already exists', () => {
      mockFs.existsSync.mockReturnValue(true);

      const result = setFolderSync('/existing/path');

      expect(result).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/existing/path');
    });

    it('should create folder if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockMkdirp.sync.mockReturnValue(true);

      const result = setFolderSync('/new/path');

      expect(result).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/new/path');
      expect(mockMkdirp.sync).toHaveBeenCalledWith('/new/path');
    });

    it('should return error if folder creation fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      const error = new Error('Creation failed');
      mockMkdirp.sync.mockImplementation(() => {
        throw error;
      });

      const result = setFolderSync('/new/path');

      expect(result).toBe(error);
    });
  });

  describe('fsExistsSync', () => {
    it('should return true if file/folder exists', () => {
      mockFs.accessSync.mockReturnValue(undefined);

      const result = fsExistsSync('/existing/file');

      expect(result).toBe(true);
      expect(mockFs.accessSync).toHaveBeenCalledWith('/existing/file', fs.constants.F_OK);
    });

    it('should return false if file/folder does not exist', () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = fsExistsSync('/nonexistent/file');

      expect(result).toBe(false);
    });
  });

  describe('writeFile', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockReturnValue(undefined);
      mockMkdirp.sync.mockReturnValue(true);
    });

    it('should return false for empty file data', async () => {
      const result = await writeFile('/test/file.txt', '');

      expect(result).toBe(false);
    });

    it('should write to new file successfully', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockFs.appendFileSync.mockReturnValue(undefined);

      const result = await writeFile('/test/new-file.txt', 'content');

      expect(result).toBe(true);
      expect(mockFs.appendFileSync).toHaveBeenCalledWith('/test/new-file.txt', 'content');
    });

    it('should append to existing file by default', async () => {
      mockFs.accessSync.mockReturnValue(undefined); // file exists
      mockFs.readFileSync.mockReturnValue(Buffer.from('existing'));
      mockFs.writeFileSync.mockReturnValue(undefined);

      const result = await writeFile('/test/existing-file.txt', 'new content');

      expect(result).toBe(true);
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/test/existing-file.txt');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/existing-file.txt',
        Buffer.from('existing') + 'new content'
      );
    });

    it('should replace existing file when replaceExisting is true', async () => {
      mockFs.accessSync.mockReturnValue(undefined); // file exists
      mockFs.readFileSync.mockReturnValue(Buffer.from('existing'));
      mockFs.writeFileSync.mockReturnValue(undefined);

      const result = await writeFile('/test/existing-file.txt', 'new content', true);

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/existing-file.txt', 'new content');
    });

    it('should return false when write operation fails', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockFs.appendFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const result = await writeFile('/test/file.txt', 'content');

      expect(result).toBe(false);
    });

    it('should create directory if it does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false); // directory doesn't exist
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockFs.appendFileSync.mockReturnValue(undefined);

      const result = await writeFile('/test/subdir/file.txt', 'content');

      expect(result).toBe(true);
      expect(mockMkdirp.sync).toHaveBeenCalledWith('/test/subdir');
    });
  });

  describe('createIconFile', () => {
    it('should create icon file successfully with string data', async () => {
      mockFs.writeFileSync.mockReturnValue(undefined);

      const result = await createIconFile('/test/icon.ttf', 'font data', 'TTF');

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/icon.ttf', 'font data');
    });

    it('should create icon file successfully with buffer data', async () => {
      const buffer = Buffer.from('font data');
      mockFs.writeFileSync.mockReturnValue(undefined);

      const result = await createIconFile('/test/icon.woff', buffer, 'WOFF');

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/icon.woff', buffer);
    });

    it('should handle missing icon type parameter', async () => {
      mockFs.writeFileSync.mockReturnValue(undefined);

      const result = await createIconFile('/test/icon.svg', '<svg></svg>');

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/icon.svg', '<svg></svg>');
    });

    it('should return false when file creation fails', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const result = await createIconFile('/test/icon.ttf', 'font data', 'TTF');

      expect(result).toBe(false);
    });
  });

  describe('filterSvgFiles', () => {
    it('should return empty set for empty folder path', () => {
      const result = filterSvgFiles('');

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should filter SVG files from directory', () => {
      const mockFiles = ['icon1.svg', 'icon2.svg', 'readme.txt', 'icon3.png'];
      mockFs.readdirSync.mockReturnValue(mockFiles as any);

      const result = filterSvgFiles('/test/svgs');

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(2);
      expect(result.has(path.join('/test/svgs', 'icon1.svg'))).toBe(true);
      expect(result.has(path.join('/test/svgs', 'icon2.svg'))).toBe(true);
      expect(result.has(path.join('/test/svgs', 'readme.txt'))).toBe(false);
      expect(result.has(path.join('/test/svgs', 'icon3.png'))).toBe(false);
    });

    it('should handle directory read errors', () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Directory not found');
      });

      const result = filterSvgFiles('/nonexistent/path');

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should handle mixed file types', () => {
      const mockFiles = [
        'icon.svg',
        'image.SVG', // Different case
        'document.pdf',
        'style.css',
        'another-icon.svg',
        'folder', // Directory (should be ignored)
      ];
      mockFs.readdirSync.mockReturnValue(mockFiles as any);

      const result = filterSvgFiles('/mixed/files');

      expect(result.size).toBe(2); // Only .svg files (case sensitive)
      expect(result.has(path.join('/mixed/files', 'icon.svg'))).toBe(true);
      expect(result.has(path.join('/mixed/files', 'another-icon.svg'))).toBe(true);
    });

    it('should handle non-string file entries', () => {
      const mockFiles = ['icon.svg', null, undefined, 123, 'valid.svg'];
      mockFs.readdirSync.mockReturnValue(mockFiles as any);

      const result = filterSvgFiles('/test/path');

      expect(result.size).toBe(2);
      expect(result.has(path.join('/test/path', 'icon.svg'))).toBe(true);
      expect(result.has(path.join('/test/path', 'valid.svg'))).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in paths', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.appendFileSync.mockReturnValue(undefined);

      const specialPath = '/test/path with spaces/file-name_with.special@chars.txt';
      const result = await writeFile(specialPath, 'content');

      expect(result).toBe(true);
    });

    it('should handle very long file paths', () => {
      const longPath = '/test/' + 'a'.repeat(200) + '.svg';
      mockFs.readdirSync.mockReturnValue([longPath.split('/').pop()] as any);

      const result = filterSvgFiles('/test');

      expect(result.size).toBe(1);
    });

    it('should handle empty directory', () => {
      mockFs.readdirSync.mockReturnValue([]);

      const result = filterSvgFiles('/empty/dir');

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });
  });
});
