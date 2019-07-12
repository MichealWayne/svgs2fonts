# svgs2fonts

svg图标转字体图标库（svgs -> svg,ttf,eot,woff,woff2）。

> [引导文章-《svg、ttf、woff、woff2图标的研究及转换（svgs2fonts）》](http://blog.michealwayne.cn/2018/07/26/notes/%E3%80%90%E7%AC%94%E8%AE%B0%E3%80%91%E7%94%B1iconfont%E5%BC%95%E8%B5%B7%E7%9A%84svg%E3%80%81ttf%E3%80%81woff%E3%80%81woff2%E5%9B%BE%E6%A0%87%E7%9A%84%E7%A0%94%E7%A9%B6%E5%8F%8A%E5%85%B6%E8%BD%AC%E6%8D%A2/)

## 版本
1.0.4

## 安装
``` sh
npm i -g svgs2fonts
```

### 验证
``` sh
svgs2fonts -v
```

## 使用
``` sh
svgs2fonts {{srcpath}} {{distpath}} --options
```
其中参数：
- srcpath: svg源文件路径（相对当前窗口环境），传""时为当前窗口路径;
- distpath: 导出路径，默认在源文件路径下;

#### example
``` sh
svgs2fonts svg dist
```

### nodejs
``` js
    const svgs2fonts = require('svgs2fonts');
    const join = require('path').join;

    svgs2fonts.init({
        src: __dirname,		// svg path
        dist: join(__dirname, 'dest'),	// output path
        fontName: 'myIconfont',	// font name
        startNumber: 20000	// unicode start number
        nodemo: true        // no demo html files
    });
```

## 配置参数

### `-n` / `--name`
图标库的名字(default: "iconfont").

#### example
``` sh
svgs2fonts svg dist -n myiconfont
```

### `--number`
unicode起始编码(default: 10000).
#### example
``` 
svgs2fonts svg dist --number 50000
```

### `--nodemo`
不要demo html.
#### example
``` 
svgs2fonts svg dist --nodemo
```

## Author

Micheal Wayne

## Update time

2018.08.26