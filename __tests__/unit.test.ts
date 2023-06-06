import { getIconStrUnicode } from '../src/lib/utils';
import {
  mkdirpSync,
  setFolderSync,
  fsExistsSync,
  writeFile,
  createIconFile,
  filterSvgFiles,
} from '../src/lib/fsUtils';

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
    expect(getIconStrUnicode('test', 10000)).toEqual(15629);
    expect(getIconStrUnicode('test', 20000)).toEqual(35629);
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
    return expect(createIconFile('folder/uotdefinedFile', '123')).resolves.toBe(false);
  });

  test('filterSvgFiles()', async () => {
    expect(filterSvgFiles('')?.size).toBe(0);
  });
});
