# svgs2fonts

svg图标转字体图标库（svgs -> svg,ttf,eot,woff,woff2）。

## 版本
1.0.0

## 安装
```
    $ npm i -g svgs2fonts
```

### 验证
```
	$ svgs2fonts -v
```

## 使用
```
    svgs2fonts {{srcpath}} {{distpath}} --options
```
- srcpath: svg源文件路径（相对当前窗口环境），传""时为当前窗口路径;
- distpath: 导出路径，默认在源文件路径下;

#### example
``` 
    svgs2fonts svg dist
```

## 参数

### -n / --name
图标库的名字(default: "iconfont").

#### example
``` 
    svgs2fonts svg dist -n myiconfont
```

### --number
unicode起始编码(default: 10000).
#### example
``` 
    svgs2fonts svg dist --number 50000
```

### --nodemo
不要demo html.
#### example
``` 
    svgs2fonts svg dist --nodemo
```

## Author

Micheal Wayne

## Update time

2018.07.30