---
title: 探测资产
published: 2024-03-12 16:27
category: 工具
draft: false
tags: [资产探测, Bash, Python, Nmap]
---

## bash脚本

```
利用telnet连接来判断端口开放
```

demo.sh

```sh
#!/bin/bash

# 检查是否传入了参数
if [ -z "$1" ]; then
    echo "错误：未传入参数 IP，请传入参数并重新运行脚本。"
    exit 1
fi

# 总的IP参数
IP=$1

# 总的输出文件
TOTAL_OUTPUT_FILE="total_scan_results.txt"

# 创建一个目录来存放子脚本的输出文件
mkdir -p child_scripts_output

# 循环生成80个子脚本，并调用它们
for ((i=1; i<=80; i++)); do
    # 每个子脚本负责扫描端口范围的一部分
    start_port=$((($i - 1) * 819 + 1))  # 计算起始端口
    if [ $i -eq 80 ]; then
        # 如果是最后一个子任务，则将剩余的端口分配给它
        end_port=65535
    else
        end_port=$(($i * 819))              # 计算结束端口
    fi
    # echo $start_port 'to' $end_port
    ./child_script.sh "$IP" "$start_port" "$end_port" &
    # fi 是 Bash 中的关键字，用于结束 if 结构。在这种结构中，if 关键字用于开始一个条件语句块，而 fi 则用于结束该语句块
done

# 等待所有子脚本执行完成
wait

# 汇总所有子脚本的输出到一个文件中
#cat child_scripts_output/* > "$TOTAL_OUTPUT_FILE"

cat child_scripts_output/*| awk '{print $2 ":" $4, $0}'| sort -t: -k1,1V -k2,2n | cut -d' ' -f2- > "$TOTAL_OUTPUT_FILE"
# awk '{print $2 ":" $4, $0}'   打印出以":"进行分列后的第2列和第4列
# -t:：指定冒号作为字段分隔符
# -k1,1V：按照冒号前的字段按照版本号排序（即按照IP地址的大小排序）
# -k2,2n：在IP地址相同时，按照冒号后的字段进行数字排序（即按照端口号的大小排序）
# -d' '：指定分隔符为空格
# -f2-：表示选取从第二列到最后一列的内容
# 输入的每一行内容按空格进行分割，并输出从第二列开始到最后一列的内容。

rm -rf child_scripts_output

echo "Scan completed. Results saved in $TOTAL_OUTPUT_FILE"
```

child_script.sh

```sh
#!/bin/bash

# 子脚本获取IP参数
IP=$1
# 子脚本获取起始端口参数
start_port=$2
# 子脚本获取结束端口参数
end_port=$3

# 子脚本的输出文件
OUTPUT_FILE="child_scripts_output/scan_results_${start_port}_${end_port}.txt"

# 循环遍历端口范围
for ((port=$start_port; port<=$end_port; port++)); do
    # 使用telnet进行端口探测，0.05秒超时
    if timeout 0.1 telnet "$IP" "$port" 2>/dev/null | grep ']' &>/dev/null; then
        result="IP $IP Port $port is alive (telnet)"
        echo "$result" >> "$OUTPUT_FILE"
    fi
done

echo "Child script for ports $start_port to $end_port completed."
```

## 批量python脚本

```python
# !/usr/bin/python3
# -*- coding:utf-8 -*-
# @Time : 2024/2/28 15:51
# @Author : 大C菌
# @File : 批量.py
# @Software: PyCharm
import os

import nmap
import csv
import concurrent.futures


class PortScanner:
    def __init__(self):
        pass

    def scan_host(self, ip, writer):
        nm = nmap.PortScanner()
        print(f"Starting scan for {ip}...")
        nm.scan(hosts=ip, arguments='-sT -min-rate 10000 -p-')

        for host in nm.all_hosts():
            hostname = nm[host].hostname()
            state = nm[host].state()
            print(f"Scanning host {host} ({hostname}), state: {state}")

            for proto in nm[host].all_protocols():
                lport = list(nm[host][proto].keys())
                lport.sort()

                for port in lport:
                    port_state = nm[host][proto][port]['state']
                    port_name = nm[host][proto][port]['name']
                    print(f"    port {port}/{proto} is {port_state} ({port_name})")
                    writer.writerow({
                        'host': host,
                        'hostname': hostname,
                        'state': state,
                        'protocol': proto,
                        'port': port,
                        'port_state': port_state,
                        'port_name': port_name
                    })

    def scan_ips_from_file(self, file_path):
        with open(file_path) as f, open('results2.csv', 'w', newline='') as csvfile:
            fieldnames = ['host', 'hostname', 'state', 'protocol', 'port', 'port_state', 'port_name']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            with concurrent.futures.ThreadPoolExecutor() as executor:
                futures = [executor.submit(self.scan_host, line.strip(), writer) for line in f]
                concurrent.futures.wait(futures)


if __name__ == '__main__':
    dirlist = os.listdir()
    config = 'ip.txt'
    if config not in dirlist:
        with open('ip.txt', 'w') as f:
            pass
        print(config + '创建成功')
    else:
        # 创建端口扫描器对象
        scanner = PortScanner()
        # 读取IP地址文件，并对其中的所有IP地址进行扫描
        scanner.scan_ips_from_file('ip.txt')
```
