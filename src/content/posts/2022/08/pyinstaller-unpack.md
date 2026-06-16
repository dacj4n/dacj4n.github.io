---
title: Pyinstaller打包exe进行解包
published: 2022-08-24 21:24
category: 工具
draft: false
tags: [Pyinstaller, 逆向, Python]
---

# Pyinstaller打包exe进行解包



## 1、打包生成

```
pyinstaller -F 1.py

其中 参数 -F 是为了将程序打包为一个exe文件，而且不产生其他的文件
打包完成之后，本地会生成一个dist的文件夹，在这个文件夹里就有一个打包好的exe文件
```

```
单文件打包
pyinstaller --onefile --name=portscan port_scanner.py
```



## 2、解包

```
下载链接：https://sourceforge.net/projects/pyinstallerextractor/

pyinstxtractor 1.exe
```



## 3、找到源文件名和struct文件

pyinstaller在打包的时候，会将pyc文件的前8个字节清除，所以后期需要自己添加上去，前四个字节为python编译的版本，后四个字节为时间戳。（四个字节的magic number、四个字节的timestamp）

```
简单粗暴，可以使用：550D0D0A000000007079693010010000
```



## 4、保存为pyc文件

```
可以到在线平台进行反编译：https://tool.lu/pyc
```

有时候无法反编译成功，可以使用uncompyle6，但是此工具目前仅支持到3.9版本

```
pip install uncompyle6

uncompyle6 1.pyc

uncompyle6 1.pyc > 1.py
```


![](/images/posts/pyinstaller-unpack/1.png)



