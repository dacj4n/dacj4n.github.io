---
title: 使用PythonNmap模块进行主机探测
published: 2025-02-24 17:07
category: 工具
draft: false
tags: [Python, Nmap, 主机探测]
---

# 使用PythonNmap模块进行主机探测

在现代网络安全和信息搜集中，网络扫描是一项关键任务。Nmap（Network Mapper）作为一款功能强大的开源网络扫描工具，被广泛用于主机发现和安全审计，其已成为网络管理员和安全专家信息搜集与主机发现的首选。将Nmap与Python结合使用，可以大大提升自动化和灵活性。本文将深入探讨如何使用 python-nmap库，通过实际示例展示如何在Python脚本中调用Nmap的功能，进行网络扫描和分析任务。

![](/images/posts/python-nmap-host-discovery/0.jpg)

通过PythonNmap模块我们可以在Python程序中灵活地使用Nmap进行网络扫描和分析。在使用 `python-nmap` 之前，读者需要先自行下载并安装`Nmap`扫描软件。可以通过访问`Nmap`的官方网站进行下载。以`Windows`平台为例，读者可以点击以下链接获取最新版本的安装。

- 点击下载Nmap软件：[nmap-7.95-setup.exe](https://nmap.org/dist/nmap-7.95-setup.exe)

在完成`Nmap`安装后，可以在命令行中执行 `pip install python-nmap` 来安装对应的开发工具包，该库的使用非常简单且直观。

## 主机存活探测

对于端口扫描，我们可以通过 `nmap.PortScanner()` 来初始化并创建一个同步模式的端口扫描对象。在同步模式下，扫描任务会按顺序执行，直到所有任务完成后才会返回结果，例如我们以探测网段存活主机为例，在调用`scan`扫描函数时通过使用`hosts`可用于指定一个主机地址或主机组，使用`ports`则用于指定一个端口或端口范围，而使用`arguments`则可用于指定传递给`Nmap`的命令行参数。

```python
import nmap

# 解析并打印主机信息
def parse_host_info(host_info):
    hostnames = host_info.get('hostnames', [{'name': '', 'type': ''}])
    addresses = host_info.get('addresses', {'ipv4': '', 'mac': ''})
    vendor = host_info.get('vendor', {})
    status = host_info.get('status', {'state': '', 'reason': ''})

    hostname = hostnames[0].get('name', '')
    hostname_type = hostnames[0].get('type', '')
    ipv4_address = addresses.get('ipv4', '')
    mac_address = addresses.get('mac', '')
    vendor_info = vendor.get(mac_address, '')
    state = status.get('state', '')
    reason = status.get('reason', '')

    print(f"主机名: {hostname}")
    print(f"主机名类型: {hostname_type}")
    print(f"IPv4 地址: {ipv4_address}")
    print(f"MAC 地址: {mac_address}")
    print(f"设备品牌: {vendor_info}")
    print(f"状态: {state}")
    print(f"响应: {reason}")
    print("-" * 40)

if __name__ == "__main__":
    # 创建一个PortScanner对象
    nm = nmap.PortScanner()

    # 执行扫描
    nm.scan("192.168.0.0/24", arguments="-sn")

    # 遍历所有主机
    for host in nm.all_hosts():
        host_info = nm[host]
        parse_host_info(host_info)
```

此外，也可以通过 `nmap.PortScannerYield()` 来创建一个异步的扫描对象。在异步模式下，扫描任务会并行执行，允许在任务执行的过程中实时获取扫描结果。

```python
import nmap

if __name__ == "__main__":
    # 使用 PortScannerYield
    nmy = nmap.PortScannerYield()
    for progressive_result in nmy.scan('192.168.0.0/24', arguments="-sn"):
        print(progressive_result)
```

运行后这段代码，则可以输出`192.168.0.0/24`网段内所有的存活主机，参数中使用了`-sn`代表对内网进行`Ping`批量探测。

```
----------------------------------------
主机名: LyShark
主机名类型: Router
IPv4 地址: 192.168.0.1
MAC 地址: 18:1A:4C:5B:6F:8A
设备品牌: TP-Link Technologies
状态: up
响应: arp-response
----------------------------------------
```

## 主机扫描与探测

Nmap 提供了多种复杂的扫描方式来满足不同的网络探测需求，其中`-sT` 是最基本的`TCP`连接扫描方式，通过完整的三次握手来检测开放端口，但易被目标主机记录和发现。相比之下`-sS` 采用`TCP SYN`包进行半开放扫描，仅完成部分握手过程，其扫描更为隐蔽。通过`-sF`、`-sX` 和 `-sN` 采用特殊的 TCP FIN、Xmas Tree 和 Null 数据包进行扫描，通过检测关闭端口返回的`RST`包来推测开放端口，具备相比于SYN扫描更高的隐蔽性。`-sU` 通过发送`UDP`数据包来检测开放的`UDP`服务端口，尽管速度较慢且不可靠，但对识别`UDP`服务非常有用。`-sA` 和 `-sW` 扫描方法用于穿透防火墙，前者发送`ACK`包检测防火墙规则，后者通过检查`TCP`窗口大小推测端口状态。最后`-sR` 与其他扫描方法结合使用，专门用于识别和枚举`RPC`服务。根据具体需求和目标环境，选择合适的扫描方式可以达到最佳效果。

### 使用TCP-SYN扫描

我们以`-sS`参数为例，通过指定`arguments`参数为`-sS`将本次扫描限定为`TCP SYN`扫描模式，当扫描结束后通过`nm.all_hosts()`可获取到所有的主机扫描结果，并依次循环在遍历数组中所需元素并打印即可，如下代码所示；

```python
import nmap

if __name__ == "__main__":
    # 创建一个PortScanner对象
    nm = nmap.PortScanner()

    # 执行扫描
    nm.scan("127.0.0.1", arguments="-sS")

    # 遍历所有主机
    for host in nm.all_hosts():
        print(f"主机地址列表: {host}")

        # 打印主机状态
        if 'status' in nm[host]:
            print(f"主机状态: {nm[host]['status']['state']}")

        # 打印主机名信息
        if 'hostnames' in nm[host]:
            for hostname in nm[host]['hostnames']:
                print(f"主机名称: {hostname['name']} ({hostname['type']})")

        # 打印地址信息
        if 'addresses' in nm[host]:
            for addr_type, addr in nm[host]['addresses'].items():
                print(f"{addr_type.capitalize()} 地址: {addr}")

        # 打印供应商信息
        if 'vendor' in nm[host]:
            for mac, vendor_name in nm[host]['vendor'].items():
                print(f"MAC 地址: {mac} ({vendor_name})")

        # 打印 TCP 端口信息
        if 'tcp' in nm[host]:
            for port in nm[host]['tcp']:
                port_info = nm[host]['tcp'][port]
                print(f"开放端口: {port}")
                print(f"  状态: {port_info['state']}")
                print(f"  响应: {port_info['reason']}")
                print(f"  服务名称: {port_info['name']}")
                print(f"  结果: {port_info['product']}")
                print(f"  版本: {port_info['version']}")
                print(f"  额外信息: {port_info['extrainfo']}")
                print(f"  可信级别: {port_info['conf']}")
                print(f"  CPE: {port_info['cpe']}")
        print("-" * 50)
```

运行后这段代码，则可针对`127.0.0.1`这台主机进行半开放扫描，通过该扫描可获取到目标主机 的开放端口信息，服务名称等，其他扫描方式同理，只需要依次解析关键字段内容即可；

```
主机地址列表: 127.0.0.1
主机状态: up
主机名称:  ()
Ipv4 地址: 127.0.0.1
开放端口: 135
  状态: open
  响应: syn-ack
  服务名称: msrpc
  结果: 
  版本: 
  额外信息: 
  可信级别: 3
  CPE: 
开放端口: 445
  状态: open
  响应: syn-ack
  服务名称: microsoft-ds
  结果: 
  版本: 
  额外信息: 
  可信级别: 3
  CPE: 
```

### 识别目标系统

Nmap 使用了一种称为`TCP/IP`堆栈指纹识别的技术来识别操作系统，其自身包含一个庞大的操作系统指纹数据库，每个指纹条目包含一组特征和其对应的操作系统版本信息。在扫描过程中，通过发送一系列精心设计的网络探测数据包，Nmap 能够生成一个指纹，与其数据库中的已知指纹进行比较，从而推断出目标操作系统。

在进行目标指纹识别时，通过使用`-O`参数来指定此操作，当识别结束后将会返回一个特定的`JSON`格式数组，我们只需要解析这个数组来判定即可，需要注意的是，扫描结果仅能参考并非一定是特定的系统。

```python
import nmap

if __name__ == "__main__":
    # 创建一个PortScanner对象
    nm = nmap.PortScanner()

    # 执行扫描
    nm.scan("127.0.0.1", arguments="-O")

    # 遍历所有主机
    for host in nm.all_hosts():
        print("主机地址: {}".format(host))
        # 打印操作系统版本识别信息及准确度
        if 'osmatch' in nm[host]:
            for osmatch in nm[host]['osmatch']:
                print(f"操作系统大类: {osmatch['name']}")
                print(f"准确率: {osmatch['accuracy']}%")

                if 'osclass' in osmatch:
                    for osclass in osmatch['osclass']:
                        print(f"  系统类别: {osclass['type']}")
                        print(f"  系统厂商: {osclass['vendor']}")
                        print(f"  操作系统系列: {osclass['osfamily']}")
                        print(f"  操作系统版本: {osclass['osgen']}")
                        print(f"  准确率: {osclass['accuracy']}%")
                        if 'cpe' in osclass:
                            for cpe in osclass['cpe']:
                                print(f"  CPE: {cpe}")
```

通过运行上述代码，我们将对本机`127.0.0.1`进行操作系统的识别，识别结果如下所示；

```
主机地址: 127.0.0.1
操作系统大类: Microsoft Windows 10 1809 - 21H2
准确率: 100%
  系统类别: general purpose
  系统厂商: Microsoft
  操作系统系列: Windows
  操作系统版本: 10
  准确率: 100%
  CPE: cpe:/o:microsoft:windows_10
```

## 使用内置脚本

Nmap Scripting Engine（NSE）是`Nmap`的一个强大功能，通过`Lua`脚本实现自动化网络扫描和分析任务，NSE脚本分为多种类别，其涵盖了从服务检测、漏洞扫描到暴力破解等广泛用途。用户可以运行单个或多个脚本、甚至编写自定义脚本来满足特定需求。NSE 脚本使 Nmap 不再仅仅是一个端口扫描工具，而成为一个全面的网络安全评估工具。

### 枚举网站目录

通过网站目录枚举，我们可以获取到网站内部存在的隐藏文件等，在`NSE`脚本中枚举目录可以使用`http-enum`脚本，网站主页标题识别则可使用`http-title`脚本，通过两者结合我们就可以有效地枚举网站目录和获取网站主页标题，这对于网站安全性测试和信息收集非常有帮助。

```python
import nmap

def extract_scripts(scan_data):
    scripts_output = []

    for host in scan_data.all_hosts():
        for protocol in scan_data[host].all_protocols():
            ports = scan_data[host][protocol].keys()
            for port in ports:
                port_info = scan_data[host][protocol][port]
                scripts = port_info.get('script', {})
                if scripts:
                    scripts_output.append({
                        "host": host,
                        "port": port,
                        "protocol": protocol,
                        "scripts": scripts
                    })

    return scripts_output

if __name__ == "__main__":
    # 创建一个PortScanner对象
    nm = nmap.PortScanner()

    # 执行带有NSE脚本的扫描
    target = "www.lyshark.com"
    nm.scan(target, arguments="-p 80 --script=banner,http-title,http-enum")

    # 提取scripts字段的内容
    scripts_output = extract_scripts(nm)

    # 打印scripts字段的内容
    for entry in scripts_output:
        print(f"扫描主机: {entry['host']}")
        print(f"扫描端口: {entry['port']}/{entry['protocol']}")
        print("脚本输出:")
        for script_name, script_output in entry['scripts'].items():
            print(f"  {script_name}: {script_output.encode('utf-8').decode('utf-8')}")
        print("\n")
```

### 识别主机漏洞

主机漏洞识别是进一步渗透测试的基础，使用 `vuln` 脚本进行漏洞检测是发现和识别网络中已知漏洞的有效方法，这些脚本可以帮助渗透测试人员和安全专家快速了解目标系统的安全状况，并为进一步的漏洞利用和修复提供基础信息。

```python
import nmap
import json

def generate_report(scan_data):
    report = []
    for host in scan_data.all_hosts():
        host_info = {
            "host": host,
            "state": scan_data[host]['status']['state'],
            "addresses": scan_data[host].get('addresses', {}),
            "hostnames": scan_data[host].get('hostnames', []),
            "osmatch": scan_data[host].get('osmatch', []),
            "scripts": scan_data[host].get('hostscript', []),
            "ports": []
        }

        for protocol in scan_data[host].all_protocols():
            ports = scan_data[host][protocol].keys()
            for port in ports:
                port_info = scan_data[host][protocol][port]
                host_info["ports"].append({
                    "port": port,
                    "protocol": protocol,
                    "state": port_info['state'],
                    "service": port_info['name'],
                    "product": port_info.get('product', ''),
                    "version": port_info.get('version', ''),
                    "extrainfo": port_info.get('extrainfo', ''),
                    "cpe": port_info.get('cpe', []),
                    "scripts": port_info.get('script', {})
                })
        
        report.append(host_info)
    
    return report

if __name__ == "__main__":
    # 创建一个PortScanner对象
    nm = nmap.PortScanner()

    # 执行带有NSE脚本的扫描
    target = "127.0.0.1"
    nm.scan(target, arguments="-O --script=vuln")

    # 生成扫描报告
    report = generate_report(nm)

    # 打印扫描报告（以JSON格式）
    print(json.dumps(report, indent=4))
```

Nmap中针对脚本的定义还有许多，读者可自行尝试并理解。本章内容仅用于参考和理解。通过使用和编写`NSE`脚本，用户可以极大地扩展`Nmap`的功能，以满足各种网络安全和系统管理的需求。希望本文对你有所帮助，并能激发你在网络安全领域的进一步探索和应用。