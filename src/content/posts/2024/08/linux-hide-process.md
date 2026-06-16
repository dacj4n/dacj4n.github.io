---
title: Linux 隐藏进程
published: 2024-08-13 20:19
tags: [Linux, 进程隐藏]
category: 系统
draft: false
---

# Linux 隐藏进程

## 一、概述

Linux 系统中的进程隐藏是攻击者在入侵后维持持久化和规避检测的常用手段。隐藏进程的方法从简单的用户态技巧到复杂的内核级 rootkit，层次各异。本文梳理常见的隐藏技术及对应的检测方法。

---

## 二、进程隐藏的常见方法

### 2.1 用户态隐藏

#### 2.1.1 LD_PRELOAD Hook

通过 `LD_PRELOAD` 注入共享库，劫持 `readdir`、`fopen` 等 libc 函数，使 `ps`、`top`、`ls /proc` 等命令无法看到指定进程。

```bash
# 示例：注入恶意 so
export LD_PRELOAD=/tmp/libhide.so
```

**特点**：仅对使用动态链接 libc 的程序生效，对静态编译的工具（如 busybox）无效。

#### 2.1.2 Mount Namespace 隔离

利用 mount namespace 将 `/proc` 替换为伪造的 procfs，使同一个 namespace 内的工具无法看到真实进程。

```bash
# 创建新的 mount namespace
unshare -m /bin/bash
# 挂载伪造的 /proc
mount -t proc none /proc
```

**特点**：docker/k8s 环境下较常见，仅隔离当前 namespace 的视图。

#### 2.1.3 进程名伪装 (argv[0] Spoof)

修改进程的 `argv[0]`，使进程在 `ps` 输出中显示为系统正常进程名。

```c
// 伪代码：修改 argv[0]
memset(argv[0], 0, strlen(argv[0]));
strcpy(argv[0], "[kworker/0:0]");
```

#### 2.1.4 /proc/PID 隐藏 — 利用 prctl

使用 `prctl(PR_SET_MM, ...)` 等接口修改进程属性，或利用 `/proc` 文件系统的特性干扰枚举。

### 2.2 内核态隐藏

#### 2.2.1 内核模块 Rootkit

通过可加载内核模块（LKM）直接挂钩内核函数，是最彻底的隐藏方式：

- **Syscall Table Hook**：替换 `getdents64`、`kill`、`read` 等系统调用
- **VFS Hook**：挂钩 `/proc` 文件系统的 `readdir` 操作，过滤特定进程
- **Netfilter Hook**：隐藏特定端口和网络连接

```c
// 伪代码：hook getdents64 过滤隐藏进程
asmlinkage long hooked_getdents64(unsigned int fd, struct linux_dirent64 *dirp,
                                   unsigned int count) {
    long ret = original_getdents64(fd, dirp, count);
    // 遍历 dirp，删除包含指定 PID 的目录项
    return ret;
}
```

#### 2.2.2 常见公开 Rootkit

| Rootkit | 隐藏能力 | 特点 |
|---------|---------|------|
| Diamorphine | 进程、文件、模块、端口 | 开源，支持 Linux 5.x+ |
| Reptile | 进程、文件、网络 | 支持反弹 shell、端口 knocking |
| Suterusu | 进程、网络 | ARM/x86 均支持 |
| khook | 通用框架 | 通过 kprobe 方式挂钩 |

#### 2.2.3 BPF/eBPF 隐藏

利用 eBPF 程序挂钩内核函数，实现无 LKM 的进程隐藏：

- 通过 `bpf_probe_write_user` 修改用户态返回数据
- 利用 TC / XDP hook 过滤网络流量
- 无需加载内核模块，绕过部分检测

---

## 三、检测方法

### 3.1 交叉比对 /proc 扫描

遍历所有 PID 与 `ps` 输出对比：

```bash
# 遍历 /proc 下所有数字目录
for pid in /proc/[0-9]*/; do
    pid=$(basename $pid)
    if [ -f /proc/$pid/comm ]; then
        echo "$pid $(cat /proc/$pid/comm)"
    fi
done > /tmp/proc_list.txt

# 与 ps 输出对比
ps aux > /tmp/ps_list.txt
diff <(sort /tmp/proc_list.txt) <(awk '{print $2, $11}' /tmp/ps_list.txt | sort)
```

此方法可发现用户态 LD_PRELOAD 隐藏，但对内核级 rootkit（直接 hook getdents）无效。

### 3.2 使用 busybox（静态编译工具）

ubuntu 的 `ps`、`top` 等命令动态链接 libc，容易被 LD_PRELOAD 劫持。busybox 是静态编译的，不受影响。

```bash
# 安装 busybox
wget https://busybox.net/downloads/binaries/1.21.1/busybox-x86_64
chmod +x busybox-x86_64
mv busybox-x86_64 /usr/bin/busybox

# 若上面下载地址失效，可使用如下地址：
curl -o /usr/bin/busybox https://blog.tag.gg/soft/busybox-x86_64
chmod +x /usr/bin/busybox

# 执行如下命令即可运行 busybox：
busybox top
busybox ps
busybox ls /proc
busybox netstat -anp
```

### 3.3 unhide 系列工具

专门用于检测隐藏进程的工具，支持多种检测方法：

```bash
# 安装
apt install unhide

# brute 模式：遍历所有可能的 PID
unhide brute

# proc 模式：对比 /proc、/bin/ps、系统调用
unhide proc

# procall 模式：通过系统调用的不同方式交叉验证
unhide procall

# sys 模式：检查被劫持的系统调用
unhide sys

# 反向模式：检测哪些 PID 只出现在 ps 中但 /proc 中不存在
unhide reverse
```

**同类工具补充**：

```bash
# unhide-tcp：检测隐藏的 TCP/UDP 端口
unhide-tcp

# unhide-linux：Linux 专用
unhide-linux -v
```

### 3.4 Rootkit 扫描工具

```bash
# rkhunter：检查 rootkit 签名、文件完整性
rkhunter --check --sk

# chkrootkit：检测已知 rootkit
chkrootkit

# 更新特征库
rkhunter --update
chkrootkit --update
```

### 3.5 Sysdig / SystemTap 动态追踪

对 eBPF/内核级 rootkit 更有效的检测手段：

```bash
# sysdig 查看所有进程事件
sysdig -c topprocs_cpu
sysdig -c lscontainers

# 查看隐藏进程产生的系统调用
sysdig proc.name!="ps" and evt.type=execve

# 列出通过内核事件获取的进程列表
sysdig -p"%proc.pid %proc.name" evt.type=execve | sort -u
```

### 3.6 内核模块对比

```bash
# 列出已加载模块
lsmod > /tmp/lsmod.txt

# 读取内核模块链表
cat /proc/modules > /tmp/proc_modules.txt

# 检测异常：名字随机、无签名、未使用、来源可疑
modinfo <module_name>
```

### 3.7 进程记账 (psacct)

```bash
# 安装
apt install acct

# 启动记账
accton /var/log/account/pacct

# 查看最近执行的命令
lastcomm | head -50

# 汇总统计
sa
```

记账在进程创建/退出时记录，rootkit 很难完全阻止，可作为事后追溯手段。

### 3.8 网络连接交叉验证

```bash
# 多个工具对比网络连接
ss -tunap  > /tmp/ss.txt
netstat -anp > /tmp/netstat.txt
lsof -i -n -P > /tmp/lsof_net.txt

# busybox netstat 对比
busybox netstat -anp > /tmp/busybox_net.txt

# diff 对比差异
diff /tmp/ss.txt /tmp/busybox_net.txt
```

---

## 四、应急响应检测流程

### 4.1 快速筛查

```bash
# 1. 使用 busybox 快速对比
busybox ps auxf

# 2. 检查 /proc 是否完整
busybox ls /proc | grep -E '^[0-9]+$' | wc -l
ls /proc | grep -E '^[0-9]+$' | wc -l
# 两者数量应一致

# 3. 检查可疑进程
busybox ps aux | grep -vE '^root|^daemon|^www|^mysql' | grep -v '^\['

# 4. 高 CPU 进程排查
busybox top -b -n 1 | head -20
```

### 4.2 深入排查

```bash
# 5. 运行 unhide
unhide brute
unhide procall

# 6. Rootkit 扫描
rkhunter --check --sk

# 7. 检查 LD_PRELOAD
cat /proc/self/maps | grep -i ld_preload
cat /proc/1/environ | tr '\0' '\n' | grep -i ld_preload

# 8. 检查可疑内核模块
lsmod | sort | while read mod size used; do
    echo "=== $mod ==="
    modinfo $mod 2>/dev/null | grep -E 'description|author|license|version'
done

# 9. 检查异常计划任务和自启动
crontab -l 2>/dev/null
ls -la /etc/cron.* 2>/dev/null
systemctl list-units --type=service --state=running | grep -vE '^(●|  )'
```

### 4.3 内存取证

```bash
# 使用 avml 或 LiME 采集内存镜像
# avml: https://github.com/microsoft/avml
avml /tmp/memory.dmp

# 用 volatility3 分析
vol -f /tmp/memory.dmp linux.pslist
vol -f /tmp/memory.dmp linux.psscan   # 与 pslist 对比找隐藏
vol -f /tmp/memory.dmp linux.check_afinfo
vol -f /tmp/memory.dmp linux.hidden_modules
```

---

## 五、注意事项

1. **busybox 不是万能**：如果 rootkit 在内核层面 hook 了 `getdents64`，busybox 也无法看到隐藏进程。
2. **交叉验证是关键**：单一工具不可靠，必须用多个独立工具交叉比对。
3. **疑似挖矿进程**：重点排查高 CPU 占用、伪装成系统进程名的进程。用 `busybox top` 和 `cat /proc/*/comm` 对比。
4. **内存取证是最后手段**：对于高级内核 rootkit，只有通过内存取证（volatility）才能发现。
5. **保留现场**：在检测前先保存 `ps`、`lsmod`、`/proc` 等快照，避免 rootkit 感知后自行销毁。
