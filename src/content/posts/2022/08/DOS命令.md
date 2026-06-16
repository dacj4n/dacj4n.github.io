---
title: DOS命令
published: 2022-08-21 17:28
tags: 命令
category: 工具
draft: false
---

# DOS命令

- 快捷键win+R，调出“运行”对话框，输入cmd(推荐) 或%comspec%打开，回车。
- 双击C:\Windows\System32\cmd.exe
- 资源管理器地址栏前面加上cmd +空格+ 路径

说明：①在没有特殊要求的场合下，字母的大小写并不影响命令的执行

​			②CMD窗口下，命令行是不支持换行的

​			③程序右键以管理员身份运行（获得最高权限）



## 一、基础命令

### 1、查看帮助

```assembly
命令 /?

ver			#查看Microsoft windows版本号
exit		#退出终端
start		#启动一个单独的窗口运行指定的程序或命令
```

### 2、关机

（win2003 弹框不能取消，win7、10可以点×取消弹框，但别忘记取消定时关机）

```assembly
C:\>shutdown -s -t 100 			# -s 代表要关机  -t 时间  代表过多久关机
C:\>shutdown -a					#取消一切定时
C:\>shutdown -s -f -t 100 -c "认命把，最后吃好点"     # -f 强制执行 -c 加字符串
```

### 3、文件、文件夹操作


```assembly
#1\盘符切换 
盘符名+: （英文输入法）
d:

#2\查看当前目录下的所有文件
dir
   > dir/p          #分页查看             #这里的很实用的
   > dir/a          #查看所有文件包括隐藏文件   dir c:\windows /a 

tree	#以树形结构显示出目录，用参数-f 将列出第个文件夹中文件名称


#3\切换目录
cd   (chang directory)
cd+空格+/d+空格+盘符名+:   (/参数斜杠，/d参数实现跨盘符切换）
	> cd /d d:
cd+空格+/d+空格+盘符名+:\属目录  (\文件斜杠）
	> cd /d d:\soft
	> cd .		##当前目录
	> cd ..		##返回上一级目录
	> chdir		##显示当前目录名


#4\查看路径
chdir	显示当前目录名或改变当前目录。


#6\查看文件树
tree	以图形显示驱动器或路径的文件夹结构。
   /F   显示每个文件夹中文件的名称。
   /A   使用 ASCII 字符，而不使用扩展字符。


#5\清除屏幕
cls  （clear screen）


#6\文件、文件夹操作
创建目录：md+空格+目录名  （make directory）
删除目录：rd  （remove directory）
	>md  anban\1\2	 #新建目录
	>rd /s anban	 #删除多层目录   /s 递归删除  /q  不提示

创建文件：cd >+文件名+扩展名			# > 作为输出符号，为覆盖输出  >> 为追加输出
创建文件：echo hello > 文件名+扩展名
创建文件：dir >  文件名+扩展名
创建文件：copy con 文件名.扩展名       	#可输入多行，回车换行，ctl+c，然后回车 结束并保存编写

删除文件：del+空格+文件名+扩展名
	>del anban.txt       	 #删除指定文件  
	>del *.txt				#删除指定扩展名的文件  *为通配符，代表任意字符，任意长度
	>del *.*				#删除所有文件 

复制文件：copy  源文件路径 目标文件路径
移动文件：move  源文件路径 目标文件路径
重命名：ren 源文件名 新文件名

查看文件：type
	>type 文件名.扩展名 | more   #分页查看
	#回车下翻一行，空格翻页，ctrl+c退出
查找字符串：findstr	
	>findstr "Hello" aa.txt ##在aa.txt文件中寻找字符串hello
    
在文件中搜索字符串:find或findstr

除非参数有 /C 前缀，请使用空格隔开搜索字符串。
eg: FINDSTR "hello there" x.y' 在文件 x.y 中寻找 "hello" 或"there"
FINDSTR /C:"hello there" x.y' 文件 x.y  寻找"hello there"。
```

### 4、隐藏文件

```assembly
attrib +s +h +a 文件名		#系统及隐藏

D:\studnet>attrib +h qinngshu.txt        #隐藏指定文件/夹

# +s 提升为受保护的系统级的文件/夹 +a 只读属性
D:\studnet>attrib +h +s +a qinngshu.txt  
```

（win7，win10需要管理员运行cmd，win2003 可以直接cmd执行）

```assembly
创建空文件并隐藏
fsutil file createnew 文件名 大小	#单位字节

C:\Windows\system32>fsutil file createnew c:\system.ini 5120000000 #单位字节5G
C:\Windows\system32>attrib +h +s +a c:\system.ini
```

### 5、NTFS权限

```assembly
常见的文件系统：
FAT  	#windows FAT32  ExFAT
NTFS	#windows  
EXT 	#linx ext2/3/4，btrfs

FAT32转NTFS：
convert d: /fs:ntfs		###其中d: 要转换的盘符
```

文件夹权限详情介绍:

```assembly
文件夹权限		#文件夹权限内容

完全控制		 #拥有对文件夹读取、写入、修改、删除文件、及特殊权限
修改		  	  #拥有对文件夹及文件读取、写入、修改、删除的权限
读取和执行		#拥有对文件夹中的文件下载、读取、及执行的权限
列出文件夹内容	   #可以列出文件夹的内容
读取			  #拥有对文件夹中的文件下载、读取的权限
写入			  #拥有在文件夹内创建新文件的权限
特殊权限	     #控制文件权限列表的权限
```

```assembly
cacls.exe工具：

cacls /?    查看帮助
cacls xxx /t /e /c /g xgk:f    ## 赋予用户xgk对xxx目录及子目录完全控制权
cacls xxx /t /e /c /p xgk:r	   ##替换用户访问权限
cacls xxx /t /e /c /r xgk	   ##撤销用户访问权限
cacls xxx /t /e /c /d xgk	   ##拒绝用户xgk对xxx目录及子目录访问
```

```assembly
icacls.exe工具：
icacls是cacls的加强版，能够存储acl列表到文件做备份

icacls /?    查看帮助
```

```assembly
takeown		#该工具以重新分配文件所有权的方式允许管理员重新获取先前被拒绝访问的文件访问权。
```



## 二、用户管理

### 1、命令行操作账户

```assembly
net user					#查看所有的用户名
net user 用户名			#查看指定用户的详细信息
net user 用户名  密码		#修改用户密码，只有管理员可使用此命令
net user  用户名  密码 /add  #新建账户
net user  用户名  密码 /delete  #删除账户
net user  用户名 /active:yes  # 激活用户
net user  用户名 /active:no  # 禁用用户

query user   查看当前在线用户
```

### 2、组管理命令

```assembly
net localgroup					#查看组列表
net localgroup 组名			  #查看指定组信息
net localgroup 组名 /add		  #新增组
net localgroup 组名 /del		  #删除组
net localgroup 组名 用户名 /add	#经指定用户加入组中
net localgroup 组名 用户名 /del	#经指定用户从组中删除
```



## 三、网络命令

### 1、查看电脑的ip 

```assembly
ipconfig

ipconfig /all                  ##显示详细信息
ipconfig /renew                ##更新所有适配器
ipconfig /release         		##释放指定适配器的 IPv4 地址。
ipconfig /displaydns      		##显示 DNS 解析程序缓存的内容。
ipconfig /flushdns        		##清除 DNS 解析程序缓存。
```

### 2、ping 命令

```assembly
#用来检测网络的连通情况和分析网络速度；
#根据域名得到服务器IP；
#根据ping返回的TTL值来判断对方所使用的操作系统及数据包经过路由器数量。
#如ping www.baibu.com

    -t             #持续Ping 指定的主机，直到停止若要停止，请键入 Ctrl+C。               
    -n count       #要发送的回显请求数。
    -l size        #发送缓冲区大小。
    -f             #在数据包中设置“不分段”标记(仅适用于 IPv4)。
    -i TTL         #生存时间。
```

### 3、arp命令    

```assembly
arp -a  			#显示静态项   

arp -s 157.55.85.212   00-aa-00-62-c6-09 ##添加静态项。
```

### 4、nslookup命令

```assembly
#查询DNS的记录，查看域名解析是否正常，在网络故障的时候用来诊断网络问题,可指定dns服务器

nslookup www.baidu.com
nslookup -qt=a www.baidu.com 8.8.8.8   ##指定解析的域名服务器
```

### 5、tracert

```assembly
##路由追踪命令

tracert -参数 ip(或计算机名) 	#跟踪路由（数据包），参数：“-w数字”用于设置超时间隔。
tracert www.baidu.com
```

### 6、netsh命令

```assembly
##windows查看曾经连接过的WiFi密码（win10测试）
netsh wlan show profiles							#查看所有连接过的无线网络名称
netsh wlan show profiles 无线名称 key=clear				#查看无线网络名称、密码

############循环脚本###################
for /f "skip=9 tokens=1,2 delims=:" %i in ('netsh wlan show profiles') do  @echo %j | findstr -i -v echo | netsh wlan show profiles %j key=clear 
```



## 四、进程与线程、端口与服务

### 1、查看进程

```assembly
tasklist
#该工具显示在本地或远程机器上当前运行的进程列表


##关闭进程命令
taskkill /pid 14396 -t -f		  #杀死PID对应的服务(-f 用来强制执行)

tskill PID
tskill 进程名		#杀死进程

ntsd -c q -p pid 		##用户态进程调试工具,可终止进程等

wmic process where name="explorer.exe" call terminate

```

### 2、查看TCP/IP连接

```assembly
netstat
##显示协议统计信息和当前 TCP/IP 网络连接。
netstat -a 查看开启了哪些端口,常用netstat -an
netstat -n 查看端口的网络连接情况，常用netstat -an
netstat -v 查看正在进行的工作
netstat -p 协议名 例：netstat -p tcq/ip 查看某协议使用情况（查看tcp/ip协议使用情况）
netstat -s 查看正在使用的所有协议使用情况
netstat -ano |findstr "端口号"		#端口的占用情况
netstat -ano | findstr "PID值"	 #查看PID对应的服务


#nbtstst
#显示协议统计和当前使用 NBI 的 TCP/IP 连接
nbtstat -A ip 对方136到139其中一个端口开了的话，就可查看对方最近登陆的用户名（03前的为用户名）-注意：参数-A要大写
eg:nbtstat -A 192.168.1.42  列出指定IP地址的远程机器的名称表。
```

```assembly
##通过端口查对应的进程和服务：

netstat -ano 端口 |find "端口"		#得到PID
tasklist |find "PID"		#查询到对应的进程

可以在任务管理器或第三方进程工具procexp中查看对应的服务
```

### 3、sc命令

```assembly
##是用来与服务控制管理器和服务进行通信
用法:
	sc <server> [command] [service name] <option1> <option2>...
	 query -----------查询服务的状态，
	 start -----------启动服务。
	 create ----------创建服务(并将其添加到注册表中)。
	 delete ----------(从注册表中)删除服务。

sc config 服务名 start auto	#在注册表中修改为自启

#替换服务：
1、先找一个目标服务
比如：BITS服务，删除对系统正常运行影响不大
2、命令行删除服务：
sc delete BITS		#命令行删除服务
3、执行：
sc create BITS binpath= "C:\WINDOWS\system32\xgk.exe" type= share start= auto displayname= "Background Intelligent Transfer Service"
4、添加描述：
sc description BITS "使用空闲网络带宽在后台传送文件。如果该服务被禁用，则依赖于 BITS 的任何应用程序(如 Windows 更新或 MSN Explorer)将无法自动下载程序和其他信息。"


#关闭服务
```



## 五、定时

### 1、at命令

```assembly
##不太好用，有时候调不起来
#创建：
at 22:30 shutdown -s 		#在今天 22:30 关闭计算机
at 16:20 /every:Monday "C:\Users\Administrator\Desktop\mkdir.bat" 		#每周一16:20运行脚本

#查看：
at 			#查看所有的计划任务
at id号 		#开启已注册的某个计划任务

#删除：
at /delete 		#停止所有计划任务，用参数/yes则不需要确认就直接停止
at id号 /delete  #停止某个已注册的计划任务
```

### 2、schtasks命令

```assembly
/tn TaskName：指定任务的名称
/tr TaskRun：指定任务运行的程序或命令。键入可执行文件、脚本文件或批处理文件的完全合格的路径和文件名。如果忽略该路径，SchTasks.exe 将假定文件在Systemroot\System32 目录下。
/sc schedule：指定计划类型。有效值为 MINUTE、HOURLY、DAILY、WEEKLY、MONTHLY、ONCE、ONSTART、ONLOGON、ONIDLE。


#例如：指定时间运行
schtasks /create /sc ONCE /st 15:16 /tr c:\123.bat  /tn test1	##指定时间运行脚本
schtasks /create /sc minute /mo 1  /tr calc.exe /tn test		##指定周期运行程序
#参数详解：
/create   创建任务
/st startTime   以 HH:MM:SS 24 小时格式指定时间。默认值是命令完成时的当前本地时间。/st 参数只对于 MINUTE、HOURLY、DAILY、WEEKLY、MONTHLY 和 ONCE 计划有效。它只对于 ONCE 计划是必需的。


#例如：查看指定任务
schtasks /Query /tn test

#例如：删除指定任务
schtasks /Delete /TN 任务名称 /F


schtasks /create /sc ONCE /st 12:22 /tr "net user test$ 168753294Qq /add"  /tn test2
schtasks /create /sc ONCE /st 12:23 /tr "net localgroup administrators test /add"  /tn test3
```



## 六、系统命令

### 1、文件关联性

```assembly
assoc	#显示或修改文件扩展名关联
  .ext      指定跟文件类型关联的文件扩展名
  fileType  指定跟文件扩展名关联的文件类型

C:\>assoc                  #键入 ASSOC 而不带参数，显示当前文件关联
C:\>assoc .txt=exefile
.txt=exefile

C:\>assoc .txt=txtfile
.txt=txtfile

#在设置中也可以修改文件类型的默认打开方式
```

### 2、systeminfo

```assembly
##Systeminfo（命令行）显示关于计算机及其操作系统的详细配置信息，包括操作系统配置、安全信息、产品 ID 和硬件属性，如 RAM、磁盘空间和网卡。

systeminfo > C:\Users\lym\Desktop\123.txt

systeminfo 可以获取一部分补丁安装信息
```

### 3、wmic

```assembly
##wmic和cmd一样在所有的windows版本中都存在，同时wmic有很多cmd下不方便使用的部分

#在powershell也可以和cmd命令行一样的操作。
wmic /?		#显示全局开关和别名语法（win10提示弃用，微软将来可能停用该命令，替代品powershell中的Get-WmiObject）  

##以进程为例展示用法
wmic process /?	#进程管理
wmic process get caption,executablepath,processid	#获取系统当前正在运行的进程信息
wmic service where (state="running") get caption,name,startmode	#获取正在运行的服务列表

wmic product get name #系统安装软件情况
wmic environment get Description,VariableValue	#系统环境变量
wmic computersystem get Name,Domain,Manufacturer,Model,Username,Roles/format:list	#枚举目标系统信息，主机、域名、制造商及设备型号等
wmic sysdriver get Caption,name,pathname,ServiceType,State,Status /format:list	#枚举驱动名称、路径和服务类型

wmic /node:ip /user:用户名 process		#远程查看主机的进程，需要打开RPC
```

```assembly
#WMI利用实例：
1）利用WMIC列出远程计算机上所有进程
WMIC /node:192.168.1.2 /user:administrator process
2）利用WMIC关闭远程程序
wmic /node:192.168.168.129 /user:administrator process where name="explorer.exe" call terminate
###注意explorer.exe有守护进程，基于进程关闭，一会还会重新启动
3）利用WMIC启停服务
wmic service		##获取所有服务  wmic service list brief|more 避免排版乱
wmic service where /?		##WMI WQL 查询功能帮助
wmic service where "caption = 'Windows Time'" call stopService	#关闭服务win2003
wmic service where "caption = 'Windows Update'" call stopService  #关闭服务win10
wmic service where "caption = 'Windows Update'" call startService  #开启服务

wmic qfe list full /format:table > d:\qfe.txt
wmic qfe list full /format:htable > d:\qfe.html		#快速修复工程
```

### 4、Get-Wmiobject

```assembly
##注意：此命令在powershell中用

#Get-WmiObject和wmic相比，可以说是一个升级版
Get-Wmiobject -list   #获取windows上支持哪些WMI类
Get-Wmiobject -class win32_process	#本地计算机获取进程
```

### 5、cscript

```assembly
#脚本运行命令
cscript ok.vbs
```

### 6、记录cmd操作命令

```assembly
doskey /history
```

### 7、常见系统命令

当我们的windows2003服务器上超出最大连接数以后，我们除了重启服务器外，还有一个最好的方法就是使用/console
控制台方式开启远程：mstsc    /console     /v:IP:终端端口
当我们加了这个参数以后，会自动的踢掉其中一个用户，并允许你登录。当远程服务器并没有超出最大连接时，它判断服务器本地是否登陆在桌面，如果登录，则锁定本地登录，桌面被console占用，如果没有登录就开启个本地登录一样的窗口。

```assembly
1、查询用户
query user   					#快速查看当前在线用户
logoff 回话ID 				# 上个命令的回话ID，快速踢掉用户
query process&query session  ##快速查看进程和会话

2、关闭程序或服务
net stop  服务名			##停止服务 或者  sc stop

3、行关闭进程
方法一：
tskill命令,可与tasklist（显示当前进程命令）参照使用。
命令格式:TSKILL processid | processname [/SERVER:servername] [/ID:sessionid | /A] [/V]

方法二：
taskkill命令，主要的好处是带很多筛选器,可以批量结束进程

方法三：
ntsd 命令 
有一些高优先级的进程,tskill和taskkill可能无法结束,可以用系统调试工具ntsd,除了WINDOWS系统自己的管理进程,绝大多数进程ntsd都可以Kill掉，因为功能强大，所以定义为系统管理员级的工具，要小心使用.

命令格式:ntsd -c q -p pid 		##用户态进程调试工具,可终止进程等
命令范例: ntsd -c q -p 1332 (结束PID为1332的explorer.exe进程)
		

4、文件属性、查看与文件共享
attrib     				 ##显示设置文件属性
dir /S  			##显示当前目录及子目录下所有文件
dir /a				##查看文件包括隐藏文件
dir /p  			##分页查看
del 				##删除文件
rd  				##删除文件夹
net share 					##查看共享
```

### 8、DEP

**如何确认硬件 DEP 在 Windows**

```assembly
##方法一：wmic 命令查看

#如果输出为"TRUE"，则硬件强制 DEP 可用
wmic OS Get DataExecutionPrevention_Available  

#若要确定当前的 DEP 支持策略。
wmic OS Get DataExecutionPrevention_SupportPolicy 
返回的值将为 0、1、2 或 3。 此值对应于下表中所述的 DEP 支持策略之一。
```

**开启与关闭DEP**

```assembly
##在cmd中直接执行bcdedit命令，查看当前的启动配置，最后一行nx OptIn,表示DEP保护级别为1；若显示为OptOut则表示保护级别为2。

##注意执行命令要 以管理员权限运行cmd
bcdedit /set nx alwaysoff     ##关闭DEP，需重启计算机
bcdedit /set nx alwayson	  ##开启DEP，需重启计算机
```



## 七、注册表

注册表是计算机中最重要的一个数据库，包含存储了系统和应用程序的设置信息。

### 1、IPC$实验：

```assembly
##环境 win7连win2k3（win10默认smb版本过高）
##注意：需要知道对方ip地址、管理员账户和密码且该端口服务正常开放。

1、建立IPC$通道
命令 net use \\ip\ipc$ "passwd" /user:"name"
2、查看远程主机共享的资源，即目标文件、文件夹右键属性共享出来的
命令 net view \\ip
3、查看目标服务器时间
命令 net time \\ip
4、查看远程主机的NetBIOS用户类别
命令  nbtstat -A ip
5、映射网络驱动器
命令 net use z: \\ip\c$
断开映射命令  net use z: /del
6、删除IPC$通道
命令 net use \\ip\ipc$ /del
7、上传文件,将本地c盘下3389.txt传到对方c盘根目录下
命令 copy c:\3389.txt  \\ip\c$
```

### 2、reg命令

```assembly
reg /?					##常用的reg add 和reg delete
reg add /?
reg delete /?

语法：
REG ADD KeyName [/v ValueName | /ve] [/t Type] [/s Separator] [/d Data] [/f]
        [/reg:32 | /reg:64]

添加命令：reg add "HKEY_CURRENT_USER\SOFTWARE\Microsoft\Command Processor" /v "123" /f

--Keyname:键名
--所选根键直接子健的完整名字 /v "valuename",
想注册表中加入新键值的名称，如果包含空格，使用引号 /ve
--v 所选项之下要添加的值名
--加入空键值名称 /t type
--/f允许覆盖现存的注册表项
--/d Data向注册表中指定键赋值

删除命令：reg delete "HKEY_CURRENT_USER\SOFTWARE\Microsoft\Command Processor" /v "AutoRun" /f

eg：关闭135端口：
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Rpc\Internet" /f
```

```assembly
reg的其他参数

REG EXPORT /?		将注册表导出到本地文件，仅适用本地计算机
REG IMPORT /?      将注册表文件导入到计算机，仅适用本地计算机

REG LOAD /?       从备份注册表中临时载入指定键值。

REG QUERY /?    查询项目信息
REG RESTORE /?   恢复注册表
```

```assembly
##注销相关ocx文件并设置权限
regsvr32 /u C:\WINDOWS\system32\wshom.ocx
--或者 不带 /u参数重新注册
regsvr32  C:\WINDOWS\system32\wshom.ocx


禁用Guest用户使用shell32.shell来防止调用此组件
cacls C:\WINDOWS\system32\wshom.ocx /e /d guests
```



## 八、环境变量

```assembly
#set
#显示、设置或删除 cmd.exe 环境变量。
SET [variable=[string]]
  variable  指定环境变量名。
  string    指定要指派给变量的一系列字符串。
  
set 显示当前所有的环境变量


path  路径可执行文件的文件名 为可执行文件设置一个路径。
```

```assembly
系统变量

##不区分大小写
%USERPROFILE% 			C:\Documents and Settings\当前用户名 
%HOMEPATH% 				C:\Documents and Settings\当前用户名 
%SYSTEMROOT% 			C:\WINDOWS 
%WINDIR% 				C:\WINDOWS 
%ComSpec% 				C:\WINDOWS\System32\cmd.exe 
%APPDATA% 				C:\Documents and Settings\当前用户名\Application Data 
%TEMP% 和 %TMP% 			C:\Documents and Settings\当前用户名\Local Settings\Temp 
%ProgramFiles% 			C:\Program Files 
%CommonProgramFiles% 	C:\Program Files\Common Files 
```

```assembly
用户软件命令

##打开应用，cmd中或者运行中均可执行
计算器：calc
记事本:notepad 
画图工具:mspaint
DVD播放器：dvdplay
资源管理器：explorer
任务管理器： taskmgr
打开注册表：regedit
打开服务：services.msc
打开本地组策略编辑器：gpedit.msc
```



## 九、磁盘分区

如果不是用强制保护参数设置，则无法删除受保护的分区

win+r输入diskpart出现磁盘管理运行窗口

或使用cmd直接输入diskpart

```assembly
DISKPART> list disk

  磁盘 ###  状态           大小     可用     Dyn  Gpt
  --------  -------------  -------  -------  ---  ---
  磁盘 0    联机              476 GB  2048 KB        *
  磁盘 1    联机              931 GB      0 B

DISKPART> select disk 0

磁盘 0 现在是所选磁盘。

DISKPART> list part

  分区 ###       类型              大小     偏移量
  -------------  ----------------  -------  -------
  分区      1    系统                 260 MB  1024 KB
  分区      2    保留                  16 MB   261 MB
  分区      3    主要                 150 GB   277 MB
  分区      4    主要                 200 GB   150 GB
  分区      5    主要                 126 GB   350 GB

DISKPART> select part 1

分区 0 现在是所选分区。

DISKPART> delete part

DiskPart 成功地删除了所选分区。

DISKPART> select part 0

指定的分区无效。请选择一个有效分区。

没有选择分区。

DISKPART> select part 2

分区 1 现在是所选分区。

DISKPART> delete part

虚拟磁盘服务错误:如果不使用强制保护参数设置，则无法删除受保护的分区。

DISKPART> delete part override

DiskPart 成功地删除了所选分区。

DISKPART> list part

这个磁盘上没有显示的分区。

DISKPART> exit

退出 DiskPart...
```



## 十、powershell&cmd

**区别：**

最浅显的区别就是：CMD写的BAT脚本我们看作是面向过程的，直白点说就是你是从计算机执行的流程来编写脚本的。而PowerShell则是面向对象的,是一种站在使用者的角度进行脚本的编写.

功能上：

CMD只能执行基本的任务，本身并没有集成太多的功能,大多依赖于第三方的程序,比如PING命令，其实是一个单独的应用程序，而不是CMD本身的一条命令。

PowerShell因为是基于.NET面向对象的,而且本身就内置了非常多的命令。使得它不管从功能上还是性能上都要比CMD要强大得多。

总结：CMD能办的事,PowerShell基本都就能办，但PowerShell能办的事,CMD遥不可及。

目前唯一CMD比PowerShell强的一点就是所有版本的Windows中都自带有CMD，包括XP和2003这些很老的操作系统。





# 工具类

### 1、smbcrack2

```assembly
smbcrack2 -i 192.168.168.129 -u user.txt -p pass.txt -P 1

##  smbcrack2.exe  -h   查看帮助
```

### 2、dumpel

```assembly
dumpel -e 529 -f ok.txt -l security -m security -t

-e 事件id nn的e nn过滤器（最多可指定10个）
-f file输出文件名（默认标准输出）
-l <name>转储指定的日志（system, application, security）
-m<name>筛选按名称记录的事件
-t使用制表符分隔字符串（默认值为空格）
```

### 3、IPseccmd

```assembly
IPseccmd的命令解析：
常用参数：
-w reg 表明将配置写入注册表，重启仍有效
-p 指定策略名称，若存在将规则加入此策略，否则新建
-r 制定规则名
-n 指定操作 可以是BLOCK、PASS或者INPASS必须大写
-x 激活该策略
-y 使之无效
-0 删除-p指定的策略


高级参数
-f 设置过滤规则  格式如下：
A.B.C.D/mask:port=A.B.C.D/mask:port:protocol
其中=号前是源地址，后是目的地址。如果用+表示规则是双向的；如果ip地址用*表示任意IP地址；0代表我自己的IP地址。还可使用通配符例如： 144.92.*.*等效于 144.92.0.0/255.255.0.0

+ 表示双向

* 表示所有ip地址
  0 表示自己的ip
```

```assembly
--  禁止以任何协议访问某IP的任意端口
ipseccmd -w REG -p "clxp safe policy1" -r "disable connect ip" -f 0/255.255.255.255=202.108.22.5/255.255.255.255:: -n BLOCK -x

含义：名称为clxp safe policy的策略，添加名为disable connect ip的规则，写入注册表
对象：我的ip和202.108.22.5
端口：全部
协议：全部
筛选器操作：禁止访问
作用：202.108.22.5是百度的ip地址，此规则以我任意ip都不能访问这个百度地址。
```

```assembly
-- 禁PING
ipseccmd -w REG -p "clxp safe policy" -r "disable out ping" -f *=0::icmp -n BLOCK -x
```

### 4、Sysinternals Suite

微软Sysinternals Suite免费工具包

```assembly
- AccessEnum.exe    ##扫描文件权限
- autoruns.exe    	##各种随机启动、驱动、映像劫持
- EFSDump.exe    		##查找efs加密文件
- procexp.exe   Tcpvcon.exe    ##查看进程
- Procmon.exe  ##实时监控文件系统、注册表、进程、线程、DLL活动
- Psfile	##查看远程打开的文件，IPC$ 或者rdp连接的
- PsGetSid	## 显示计算机或用户的SID
- PsInfo	##获取有关系统的信息
- PsService	##查看和控制服务 类似 sc query
- Rootkitrevealer.exe	##扫描系统以找到基于 Rootkit 的恶意软件
- shareEnum	##扫描网络上的文件共享并查看安全设置
- Tcpview.exe	##活动套接字查看器
```

# 骚命令

## **信息收集**

```
for /r C:\ %i in (xxx.aspx) do echo %i> %i\..\path1.txt
```

