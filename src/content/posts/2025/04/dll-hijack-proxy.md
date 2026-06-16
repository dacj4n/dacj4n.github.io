---
title: C/C++ 通过中转函数实现DLL劫持
published: 2025-04-15 17:08
tags: [C++, DLL劫持, 免杀]
category: 系统
draft: false
---

# C_C＋ 通过中转函数实现DLL劫持

```
当我们运行程序时，一般情况下会默认加载Ntdll.dll和Kernel32.dll这两个链接库，在进程未被创建之前Ntdll.dll库就被默认加载了，三环下任何对其劫持都是无效的，除了该Dll外，其他的Dll都是在程序运行时，在输入表中查找到对应关系后才会被装载到内存中的，理论上来说对除NtDll以外的其他库都是可操作的。
```

而DLL的装载是存在先后顺序的，当系统开机时smss.exe会将系统中常用的DLL缓存到注册表`计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\KnownDLLs`中的位置上，我们可以跳转过去看看里面存放的内容，都是一些常用的函数库。

![](/images/posts/dll-hijack-proxy/14.png)

当指定DLL需要加载时，系统会首先查询该表中是否存在有缓存数据，如果有则就直接调用NtMapViewOfSection函数将其映射到特定进程的内存中，如果没有则就需要根据如下顺序动态的查找。

> 1. 先查找，正在加载DLL进程的可执行目录。
> 2. 查找系统的system32目录下是否存在。
> 3. 查找，正在加载DLL进程的当前目录。
> 4. Path环境变量中的定义。

这里就先来演示一下简单的Dll劫持，首先我们必须指定要劫持的Dll文件，将其中的导出函数全部导出来，导出的输入表项目只能比原来的多，不能少，导出的方式有很多，比如可以使用AheadLib等工具，快速生成利用代码，通常可用于劫持的DLL有 lpk.dll,version.dll 等系统DLL，当前程序的第三方DLL同样可以，本教程并不适用AheadLib工具，而是使用GenEAT.exe工具：

1.先来创建一个DLL并导出两个函数，然后创建主程序动态的加载这个DLL。

lyshark.cpp 编译生成为DLL

```c++
#include <Windows.h>

extern "C" int __declspec(dllexport)add(int x, int y)
{
	return x + y;
}

extern "C" int __declspec(dllexport)sub(int x, int y)
{
	return x - y;
}

extern "C" int __declspec(dllexport)mul(int x, int y)
{
	return x * y;
}

extern "C" int __declspec(dllexport)divs(int x, int y)
{
	return x / y;
}

BOOL APIENTRY DllMain(HANDLE handle, DWORD dword, LPVOID lpvoid)
{

	return true;
}
```

编译后使用上次制作的PETools工具，执行命令`PETools c://lyshark.dll --ShowExport` 可看到其导出的函数。

![](/images/posts/dll-hijack-proxy/15.png)

编译main.cpp 动态加载函数，将lyshark.dll放入同一个目录下即可，程序运行后会动态调用DLL中的导出函数。

```c++
#include <stdio.h>
#include <Windows.h>

typedef int(*lpAdd)(int, int);
typedef int(*lpSub)(int, int);
typedef int(*lpMul)(int, int);
typedef int(*lpDiv)(int, int);

int main(int argc, char *argv[])
{
	HINSTANCE DllAddr;
	lpAdd addFun;

	DllAddr = LoadLibrary(L"lyshark.dll");

	addFun = (lpAdd)GetProcAddress(DllAddr, "add");
	if (NULL != addFun)
	{
		int res = addFun(100, 200);
		printf("结果: %d \n", res);
	}

	FreeLibrary(DllAddr);
	system("pause");
	return 0;
}
```

下面就来实现函数转发功能，当程序访问原DLL时直接将请求转发到我们自己的DLL中，我们的DLL再将请求转发到真实的DLL上面，使用本节课的小工具可以快速构建转发函数表，执行如下命令即可：`GenEAT.exe -d c://lyshark.dll -c inject.cpp -n Lok`

![](/images/posts/dll-hijack-proxy/16.png)

![](/images/posts/dll-hijack-proxy/17.gif)

默认会生成如下样子，直接在里面加上一个弹窗，然后编译DLL。

![](/images/posts/dll-hijack-proxy/18.png)

将生成的Dll改名为lyshark.dll把原来的lyshark.dll改为lok.dll

![](/images/posts/dll-hijack-proxy/19.png)

当再次打开时，会先加载弹窗，然后才会完成计算功能，也算是中转成功了。

![](/images/posts/dll-hijack-proxy/20.png)

你可以对其导出函数进行Hook转向，读取参数啥的都没问题，自由发挥吧。