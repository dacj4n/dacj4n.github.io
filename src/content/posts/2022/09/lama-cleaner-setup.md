---
title: lama-cleaner安装
published: 2022-09-15 15:21
category: 工具
draft: false
tags: [lama-cleaner, 图像处理, Docker]
---

## 1、更新pip

```
python3 -m pip install --upgrade pip
```

## 2、安装工具

```
pip install lama-cleaner
```

## 3、启动项目

```
lama-cleaner --model=lama --device=cpu --port=8888 --host=10.1.239.128
```

```
初次启动会安装github项目

注：
若需要代理，可在proxychains.conf中配置socks5代理
socks5 192.168.18.142 7890	//配置代理，vpn等均可
```

```
然后使用命令：
proxychains4 python3 -m pip install --upgrade pip
proxychains4 pip install lama-cleaner
proxychains4 lama-cleaner --model=lama --device=cpu --port=8888 --host=10.1.239.128
```

```
之后使用：
lama-cleaner --model=lama --device=cpu --port=8888 --host=10.1.239.128
开启即可
```

## PS：docker启动

```
docker run -p 8080:8080 \
-v /path/to/torch_cache:/root/.cache/torch \
-v /path/to/huggingface_cache:/root/.cache/huggingface \
--rm cwq1913/lama-cleaner:cpu-0.26.1 \
lama-cleaner --device=cpu --port=8080 --host=0.0.0.0
```

```
docker run -p 8080:8080 -v /path/to/torch_cache:/root/.cache/torch -v /path/to/huggingface_cache:/root/.cache/huggingface --rm cwq1913/lama-cleaner:cpu-0.26.1 lama-cleaner --device=cpu --port=8080 --host=0.0.0.0
```
