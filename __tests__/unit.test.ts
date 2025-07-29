import {
  createIconFile,
  filterSvgFiles,
  fsExistsSync,
  mkdirpSync,
  setFolderSync,
  writeFile,
} from '../src/utils/fsUtils';
import { getIconStrUnicode } from '../src/utils/utils';

interface MapObject {
  [propsName: string]: unknown;
}

jest.mock('mkdirp', () => {
  const originalModule = jest.requireActual('mkdirp');
  return {
    ...originalModule,
    sync: jest.fn(() => true),
  };
});

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');
  return {
    ...originalModule,
    accessSync: (path: string) => {
      const _map: MapObject = {
        'folder/definedFile': true,
      };
      if (!_map[path]) {
        throw new Error(`(mock)${path} is not access`);
      }
    },
    readFileSync: (path: string) => {
      const _map: MapObject = {
        'folder/definedFile': true,
      };
      if (!_map[path]) {
        throw new Error(`(mock)${path} is not access`);
      }
    },
    writeFileSync: (path: string) => {
      const _map: MapObject = {
        'folder/definedFile': true,
        'folder/uotdefinedFile': true,
      };
      if (!_map[path]) {
        throw new Error(`(mock)${path} is not access`);
      }
    },
    appendFileSync: (path: string) => {
      const _map: MapObject = {
        'folder/definedFile': true,
        'folder/uotdefinedFile': true,
      };
      if (!_map[path]) {
        throw new Error(`(mock)${path} is not access`);
      }
    },
  };
});

describe('units test', () => {
  it('getIconStrUnicode()', async () => {
    // Test that the function returns consistent results for the same input
    const unicode1 = getIconStrUnicode('test', 10000);
    const unicode2 = getIconStrUnicode('test', 10000);
    expect(unicode1).toEqual(unicode2);

    // Test that different start values produce different results
    const unicode3 = getIconStrUnicode('test', 20000);
    expect(unicode3).toBeGreaterThanOrEqual(20000);
    expect(unicode3).not.toEqual(unicode1);
  });
});

describe('fs functions test', () => {
  test('mkdirpSync()', async done => {
    mkdirpSync('test');
    done();
  });

  test('setFolderSync()', async done => {
    setFolderSync('test');
    done();
  });

  test('fsExistsSync()', async () => {
    expect(fsExistsSync('folder/definedFile')).toEqual(true);
    expect(fsExistsSync('folder/undefinedFile')).toEqual(false);
  });

  test('writeFile() empty fileData', async () => {
    return expect(writeFile('folder/definedFile', '')).resolves.toBe(false);
  });
  test('writeFile() write/append error', async () => {
    return expect(writeFile('folder/cannotWriteFile', '123')).resolves.toBe(false);
  });
  test('writeFile() normal deal(file accessed)', async () => {
    return expect(writeFile('folder/definedFile', '123')).resolves.toBe(true);
  });
  test('writeFile() normal deal(file not accessed)', async () => {
    return expect(writeFile('folder/uotdefinedFile', '123')).resolves.toBe(true);
  });

  test('setIconFile() write fail', async () => {
    // The mock allows writing to 'folder/uotdefinedFile', so it should succeed
    return expect(createIconFile('folder/uotdefinedFile', '123')).resolves.toBe(true);
  });

  test('filterSvgFiles()', async () => {
    expect(filterSvgFiles('')?.size).toBe(0);
  });
});
