---
title: SNMP查询OID
published: 2026-01-16 15:54
category: 工具
draft: false
tags: [SNMP, OID, 网络管理]
---

# SNMP查询OID

## 0x00 安装

```bash
apt install snmp snmpd                  # ubuntu
yum install net-snmp net-snmp-utils     # centos
```

## 0x01 配置

```assembly
在下面的配置中添加，然后重启snmpd服务
rocommunity public default

cat /etc/snmp/snmpd.conf
```

## 0x02 查询

### 1、系统

Linux系统

```assembly
# CPU负载
.1.3.6.1.4.1.2021.10.1.3.1  # 1分钟负载
.1.3.6.1.4.1.2021.10.1.3.2  # 5分钟负载
.1.3.6.1.4.1.2021.10.1.3.3  # 15分钟负载

# CPU使用率
.1.3.6.1.4.1.2021.11.9.0    # 用户CPU使用率%
.1.3.6.1.4.1.2021.11.10.0   # 系统CPU使用率%
.1.3.6.1.4.1.2021.11.11.0   # 空闲CPU百分比%

# 内存
.1.3.6.1.4.1.2021.4.5.0     # 总内存（KB）
.1.3.6.1.4.1.2021.4.6.0     # 空闲内存（KB）
.1.3.6.1.4.1.2021.4.11.0    # 内存缓存（KB）
```

Windows系统

```assembly
# CPU
.1.3.6.1.2.1.25.3.3.1.2     # CPU使用率（每个CPU核心）

# 内存
.1.3.6.1.2.1.25.2.3.1.6     # 内存大小
.1.3.6.1.2.1.25.2.3.1.5     # 内存使用量
```

### 2、命令

```assembly
# 从根开始逐级查看
snmpwalk -v 2c -c public 192.168.1.1 .1.3.6.1.4.1

# 查看企业分支
snmpwalk -v 2c -c public 192.168.1.1 .1.3.6.1.4.1.2021

# 查看系统资源分支
snmpwalk -v 2c -c public 192.168.1.1 .1.3.6.1.4.1.2021.11
```

```assembly
# 查找包含特定关键词的OID
snmpwalk -v 2c -c public 192.168.1.1 | grep -i "cpu\|load\|usage"

# 查看返回值的单位
snmpwalk -v 2c -c public 192.168.1.1 .1.3.6.1.4.1.2021.11 | head -20
```

```assembly
# 测试疑似CPU OID
snmpget -v 2c -c public 192.168.1.1 .1.3.6.1.4.1.2021.11.9.0
# 返回值示例：INTEGER: 12  # 表示12%的CPU使用率

# 测试疑似内存OID
snmpget -v 2c -c public 192.168.1.1 .1.3.6.1.4.1.2021.4.5.0
# 返回值示例：INTEGER: 8123456  # 表示8123456KB空闲内存
```

### 3、常用

```assembly
# CPU
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.11

# 1分钟平均负载
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.10.1.3.1

# 5分钟平均负载  
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.10.1.3.2

# 15分钟平均负载
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.10.1.3.3

# 用户态CPU使用率
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.11.9.0

# 系统态CPU使用率  
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.11.10.0

# 空闲CPU百分比
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.11.11.0
```

```assembly
# 内存
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.4

# 总内存 memTotalReal
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.4.5.0

# 可用内存 memAvailReal
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.4.6.0

# 缓冲区内存 memBuffer
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.4.14.0

# 缓存内存 memCached
snmpwalk -v 2c -c public 127.0.0.1 .1.3.6.1.4.1.2021.4.15.0
```

