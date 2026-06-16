---
title: K8s 命令
published: 2026-04-24 19:35
category: 工具
draft: false
tags: [K8s, Linux]
---

## 0x00 查看 Pod

### 1、查看当前命名空间的 Pod

```
kubectl get pods
```

默认是当前 context 的 namespace（通常是 `default`）

------

### 2、查看所有命名空间的 Pod（排障必用）

```
kubectl get pods -A
```

等价写法：

```
kubectl get pods --all-namespaces
```

------

### 3、查看指定命名空间的 Pod

```
kubectl get pods -n infra
```

你刚才那个 postgres 就属于这种情况

------

### 4、显示更多信息（建议习惯用）

```
kubectl get pods -A -o wide
```

会多出：

- Pod IP
- Node 节点
- 调度位置

------

## 0x01 查看命名空间

### 1、列出所有 namespace

```
kubectl get ns
```

或：

```
kubectl get namespaces
```

------

### 2、查看当前使用的 namespace

```
kubectl config view --minify | grep namespace
```

如果没输出，默认就是：

```
default
```

------

## 0x02 切换命名空间

### 1、切换当前 context 的默认 namespace

```
kubectl config set-context --current --namespace=infra
```

切完之后你再执行：

```
kubectl get pods
```

就等价于：

```
kubectl get pods -n infra
```

------

### 2、临时指定 namespace

```
kubectl get pods -n infra
kubectl exec -it xxx -n infra -- /bin/sh
```

不污染全局配置

## 0x03 进入 Pod

### 1、基础进入

```
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash
```

如果失败（常见）：

```
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh
```

------

### 2、你的实际例子

```
kubectl exec -it postgres-6b74766bdc-gh5hh -n infra -- /bin/bash
```

如果报错 `/bin/bash: not found`：

```
kubectl exec -it postgres-6b74766bdc-gh5hh -n infra -- /bin/sh
```

------

### 3、多容器 Pod（必须指定）

```
kubectl exec -it <pod-name> -c <container-name> -n <namespace> -- /bin/sh
```

查看容器名：

```
kubectl describe pod <pod-name> -n <namespace>
```

------

### 4、不进入 shell，直接执行命令（更高效）

```
kubectl exec <pod-name> -n <namespace> -- ls /
kubectl exec <pod-name> -n <namespace> -- env
```

------

## 0x04 文件传输

### 1、从 Pod 下载文件 → 本地

```
kubectl cp <namespace>/<pod-name>:/path/in/container /local/path
```

### 示例：

```
kubectl cp infra/postgres-6b74766bdc-gh5hh:/var/log/postgresql.log ./pg.log
```

------

### 2、本地上传文件 → Pod

```
kubectl cp /local/file <namespace>/<pod-name>:/path/in/container
```

示例：

```
kubectl cp ./test.sql infra/postgres-6b74766bdc-gh5hh:/tmp/test.sql
```

------

### 3、指定容器（多容器场景）

```
kubectl cp <file> <namespace>/<pod-name>:/path -c <container-name>
```

------

## 0x05 底层原理

`kubectl cp` 本质上：

```
tar | kubectl exec | tar
```

所以会有两个坑：

------

### 常见坑 1：容器里没有 tar

报错类似：

```
tar: not found
```

解决：

```
kubectl exec -it <pod> -n <ns> -- apt update && apt install -y tar
```

或用替代方案（见下面）

------

### 常见坑 2：权限问题

```
permission denied
```

解决：

- 拷贝到 `/tmp`
- 或用 root 用户容器

------

## 0x06 进阶：无 tar 也能传文件

### 方法：base64（渗透/极限环境常用）

#### 本地 → Pod

```
base64 test.txt | kubectl exec -i <pod> -n <ns> -- sh -c "base64 -d > /tmp/test.txt"
```

------

#### Pod → 本地

```
kubectl exec <pod> -n <ns> -- base64 /tmp/test.txt | base64 -d > test.txt
```

------

## 0x07 常用

### 1、进入容器排查问题

```
kubectl exec -it <pod> -n <ns> -- sh
```

然后：

```
ps aux
netstat -tulnp
cat /etc/config/*
```

------

### 2、批量进入（调试多个 Pod）

```
kubectl get pods -n infra -o name | xargs -I {} kubectl exec {} -n infra -- hostname
```

------

### 3、临时调试容器（推荐）

```
kubectl run debug -it --rm --image=busybox -- sh
```

用于：

- 网络测试
- DNS 测试
- 探测服务

### 4、排查

```
# 1. 查看 Pod 的上一次终止原因
kubectl describe pod astp-core-677858c449-nm9jz -n daily | grep -A 20 "Last State"

# 2. 查看 Pod 事件中是否有 OOMKilled 记录
kubectl describe pod astp-core-677858c449-nm9jz -n daily | grep -i -A 5 "oom\|kill\|restart"

# 3. 查看容器的资源限制配置
kubectl get pod astp-core-677858c449-nm9jz -n daily -o jsonpath='{.spec.containers[0].resources}'
```

```
# 容器实际被分配和使用的内存量
echo "容器实际使用: $(( $(cat /sys/fs/cgroup/memory/memory.usage_in_bytes) / 1024 / 1024 ))Mi" && echo "容器内存限制: $(( $(cat /sys/fs/cgroup/memory/memory.limit_in_bytes) / 1024 / 1024 ))Mi"

# cgroup v2 环境
echo "容器实际使用: $(( $(cat /sys/fs/cgroup/memory.current) / 1024 / 1024 ))Mi" && echo "容器内存限制: $(( $(cat /sys/fs/cgroup/memory.max) / 1024 / 1024 ))Mi"
```

