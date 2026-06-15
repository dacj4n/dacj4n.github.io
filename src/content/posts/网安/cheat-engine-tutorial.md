---
title: Cheat Engine 教程（1-9通关）x64
published: 2023-04-11 10:28
tags: [安全, Cheat Engine, 逆向]
category: 网安
draft: false
---

# Cheat Engine 教程（ 1 - 9 通关 ）x64

工具包：https://down.52pojie.cn/Tools/Debuggers/
Cheat Engine 官网：https://www.cheatengine.org/
Cheat Engine v7.5汉化：https://pan.aoe.top/Tools

【Cheat Engine 、CrySearch、ReClassEx】【无视一切内核保护】：https://www.52pojie.cn/thread-1314107-1-1.html

那么，让我们来看看作弊引擎教程 （x64）。

因此**，打开 Cheat Engine**，然后在主菜单中选择 **help**，然后选择 **Cheat Engine Tutorial**。

![](/images/posts/cheat-engine/1.jpg)

然后附加到 *Cheat Engine Tutorial* 进程，它应该是 'Tutorial-x86_64.exe'。



## 第 1 步：欢迎

当教程启动时，您应该会看到类似这样的东西，您只需**在阅读帮助文本后单击 \*下一步\* 按钮**。

在后续步骤中保存密码，以防崩溃（因注入）和稍后重新启动。

![](/images/posts/cheat-engine/2.jpg)



## 第 2 步：精确值扫描

因此，对于第 2 步，您将看到类似这样的东西。

![](/images/posts/cheat-engine/3.jpg)

我们需要找到的是 health 值，这里它是一个整数。

因此**，设置内存扫描器以查找整数并进行精确值扫描，然后将值设置为当前运行状况值**，大多数整数将存储在 4 字节的变量中，因此让我们从此处开始。

注： 整数可以存储在 1 字节变量 （byte）、2 字节变量 （int16/short）、4 字节变量 （int32/int） 或 8 字节变量 （int64/long） 中。

准备好后**，单击\*第一个扫描\*按钮**。

![](/images/posts/cheat-engine/4.jpg)

您应该在找到的地址列表中看到一个地址列表，如下所示。

![](/images/posts/cheat-engine/5.jpg)

现在**点击 \*打我\* 按钮**，然后**重新输入当前值并单击 \*下次扫描\* 按钮**。

请注意列表中的红色值，这表明该值已更改。

![](/images/posts/cheat-engine/6.jpg)

单击*“下次扫描*”后，您可能需要继续单击*“打我*并重新扫描”，告诉找到的地址列表足够小，可以使用。

![](/images/posts/cheat-engine/7.jpg)

只需**双击找到列表中的地址，即可将其添加到作弊表中**。 然后**更改值并冻结地址**，双击地址列表中的值进行编辑，单击启用器/冻结框冻结它。

![](/images/posts/cheat-engine/8.jpg)

现在**应该启用\*下一步\*按钮，单击它以转到下一步**。 如果尚未启用*下一步*按钮，请再次单击 hit me 按钮。



# 第 3 步：未知的初始值

当您开始第 3 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/9.jpg)

如帮助文本所示，请确保在开始新扫描之前**单击\*新扫描\*按钮**。

![](/images/posts/cheat-engine/10.png)

这将清除找到的结果以开始扫描新值。

在这里，我建议继续**单击 \*hit me\* 按钮**，看看该值是如何减少的，以帮助确定要扫描的值类型。

![](/images/posts/cheat-engine/11.png)

**请注意，该值减少了一个整数**，即非小数。

因此，我将**扫描仪设置为 \*4 个字节\*和\*未知的初始值\***。 然后点击 ***第一次扫描\* 按钮**。

![](/images/posts/cheat-engine/12.png)

现在**点击 \*hit me\* 按钮**。

然后将**扫描类型设置为 \*reduced 值\***，**然后单击 \*nest scan\* 按钮**。

![](/images/posts/cheat-engine/13.png)

请注意找到的地址数量，这对于当今的大多数游戏来说有点小，对于大多数游戏来说，找到的结果很容易达到数百万。

现在，只需**使用 \*hit me\* 按钮继续减小值，并扫描\*减小的值\***，直到找到的结果足够小，可以使用为止。

![](/images/posts/cheat-engine/14.png)

现在我们**只需选择一个地址并更改值以查看它是否具有所需的效果**，这就是它的工作原理。

**在这里，我建议您在更改值之前始终记下这些值（或只是 \*Ctrl+C\*），如果它们不是正确的值，请将其设置回**去，以防止在游戏中执行此作时更改一堆未知地址并损坏您的保存文件。

**将值设置为 5000 后，\*Next （下一步\*） 按钮应立即变为启用**状态。 更改值并单击 hit me 按钮后，进度条应填充，但这不是必需的。

![](/images/posts/cheat-engine/15.png)

现在**应该启用\*下一步\*按钮，单击它以转到下一步**。 如果尚未启用*下一步*按钮，请再次单击 hit me 按钮。



# 第 4 步：浮点

当您开始第 4 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/16.png)

所以**点击 \*新扫描\* 按钮**。 然后**，将扫描程序设置为\*浮点\**数、精确值\*，输入当前运行状况值**。

设置后**，单击\*第一个扫描\*按钮**。

![](/images/posts/cheat-engine/17.png)

因此**，只需像以前一样扫描以查找运行状况地址**，然后将其**添加到地址列表中**。


现在**再次单击\*新扫描\*按钮**。 然后将**扫描仪设置为\*双倍\*的\*精确值\*，输入当前弹药值**。

设置后**，单击\*第一个扫描\*按钮**。

![](/images/posts/cheat-engine/18.png)

因此**，只需像以前一样扫描以找到弹药地址**，然后将其**添加到地址列表中**。

现在**将值更改为 5000**，然后 Next （下一步） 按钮应变为启用状态。 然后点击 ***下一步\* 按钮进行下一步**。



# 第 5 步：代码查找器

当您开始第 5 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/19.png)

因此，首先**找到该值，然后将其添加到地址列表中**。

此时请继续**保存表和密码**，以防 debugger 设置不正确。



**在地址列表中找到地址后，右键单击它，然后选择 \*find out what accesses this address\***。

![](/images/posts/cheat-engine/20.png)

作弊引擎将提示您附加调试器，**只需单击 \*yes\* 按钮**即可。

![](/images/posts/cheat-engine/21.png)

然后将打开一个调试器表单，**现在单击 \*change value\* 按钮**，您应该会获得显示在调试器表单中的代码。

我们想要的是 write 指令。因此，我们将寻找类似以下内容之一的东西：

```
mov [**]，** add [**]，** sub [**]，**  [**]，**
```

**选择写指令的代码行**，可以点击 show disassembler 按钮查看内存中的代码，然后点击 ***replace\* 按钮**。

不要忘记**单击\*停止\*按钮**。

![](/images/posts/cheat-engine/22.png)

替换按钮会将该代码行替换为 [NOP](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:NOP)。

作弊引擎将提示您为它将添加到高级选项列表中的条目命名。

**输入名称，然后单击 \*OK\* 按钮**。

![](/images/posts/cheat-engine/23.png)

现在**，单击教程上的 \*change value\* 按钮**。

下一步 按钮应变为启用状态，**然后单击 \*下一步\* 按钮**前进到下一步。


当高级选项列表中的条目被替换时，它们将显示为红色文本。

![](/images/posts/cheat-engine/24.png)

可以通过单击 Cheat Engine 主表单左下角状态栏中的 *advanced options* 按钮来查看高级选项列表。

要恢复列表中某个条目的原始代码，请右键单击该条目，然后选择 *restore with original code （使用原始代码恢复*）。

![](/images/posts/cheat-engine/25.png)

请注意，恢复后文本为黑色。

![](/images/posts/cheat-engine/26.png)



# 第 6 步：指针

当您开始第 6 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/27.png)

因此，首先**找到该值，然后将其添加到地址列表中**。

**在地址列表中找到地址后，右键单击它，然后选择 \*find out what accesses this address\***。

![](/images/posts/cheat-engine/28.png)

然后单击 ***change value\* 按钮**，让进程访问该地址。

在选择代码以查找指针的基址时，请尝试选择不写入与基址相同的 register 的指令。

这里我们感兴趣的是方括号（'[' 和 ']'）之间的值，所以这里我们需要 RDX 的值。

指令

```
mov [rdx]，eax
```

表示它将 EAX 寄存器的内容写入 RDX 寄存器指向的内存地址。我们应该选择这条指令，因为我们正在寻找谁在修改内存地址 012348D0 的内容，我们可以看到它存储在 RDX 寄存器中。

![](/images/posts/cheat-engine/29.png)

如果指令有这样的内容，那么这里的偏移量是 0：

```
mov [rdx+12C]，eax
```

那么偏移量将是 '12C' （0x12C），请注意这是十六进制的。

现在我们想要找出哪个指针指向我们之前找到的感兴趣地址 012348D0。**将扫描器设置为 \*8 个字节\*，\*精确值\*，选中\*十六进制\*复选框，然后获取找到的值并将其作为要扫描的值**。

准备好后**，单击\*第一个扫描\*按钮**。

**在找到的地址列表中查找带有绿色文本的地址**，这些是静态地址。

![](/images/posts/cheat-engine/30.png)

现在我们想要跟踪这个指针，这样每当它的内容发生变化（这意味着它指向不同的内存位置）时，我们就能修改新的内存地址。**将我们刚刚找到的指针添加到作弊表中**，双击添加到地址列表中的**内存记录的\*地址\***，复制地址，然后选中指针复选框，并将地址粘贴到指针基址中。



因此，我的指针将如下所示。

```
["Tutorial-x86_64.exe"+XXXXXX]+0
```

应该设置类似这样的东西，记得将 offset 设置为你找到的 offset。

![](/images/posts/cheat-engine/31.png)

**单击\*确定\* 设置指针时的按钮**。

现在**将值冻结在 5000 并单击\*更改指针\*按钮**，下一步按钮应变为启用状态。

如果下一步按钮未启用，则从找到的列表中选择另一个地址，查找已更改其值的绿色地址，并像上一个一样进行设置，看看它是否指向正确的值，如果是，请更改值冻结并单击*更改指针*按钮。

**单击 \*下一步\* 按钮**前进到下一步。

# 第 7 步：代码注入

当您开始第 7 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/32.png)

在这里**，我们将遵循与步骤 5 相同的过程**，但不要单击 replace，**而是单击 \*show disassembler\* 按钮**。

![](/images/posts/cheat-engine/33.png)

这将在指令的地址打开反汇编器视图表单。

![](/images/posts/cheat-engine/34.png)

**选择指令后，按 \*Crtl+A\*** 打开一个自动汇编器表单。

在 auto assembler 表单菜单中**，选择 *template*，然后选择 *full injection***。

![](/images/posts/cheat-engine/35.png)

这将生成一些脚本来开始。

![](/images/posts/cheat-engine/36.png)

现在我们需要**添加一些代码，将值增加 2**，然后**删除减小值的原始代码**。

为了增加价值，我们可以使用 [INC](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:INC) 或 [ADD](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:ADD)。

所以让我们尝试一下这样的事情。

```
... newmem： 添加 dword ptr [rsi+780]，2  代码： sub dword ptr [rsi+00000780]，01 jmp 返回地址： JMP newmem nop  nop 返回： ...
```

现在**，将脚本添加到作弊表中**。



然后**启用脚本并单击 *hit me* 按钮**。

这应该会启用 next 按钮，因此**单击 *next* 按钮**转到下一步。



# 第 8 步：多级指针

当您开始第 8 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/37.png)

## 手动迭代

因此，在这里，我们将**遵循与步骤 6 相同的步骤，只是我们将看到什么访问了我们找到的基址**，并且我们将**不断重复此作，直到找到静态基**址。

所以这是我的第一个调试器输出。

```
10002D8D1 - B9 A00F0000 - mov ecx,00000FA0
10002D8D6 - E8 3522FEFF - call Tutorial-x86_64.exe+XXXXXX
10002D8DB - 89 46 18  - mov [rsi+18],eax  <<<<<<
10002D8DE - 89 C2  - mov edx,eax
10002D8E0 - 48 8D 4D F8  - lea rcx,[rbp-08]

RAX=00000000000007F7
RBX=000000000125CD60
RCX=0000000000000FA0
RDX=00000000828087F3
RSI=0000000001287960  <<<<<<
RDI=0000000100258308
RSP=000000000102F070
RBP=000000000102F0B0
RIP=000000010002D8DE
R8=0000000100161BA0
R9=00000000008E06A0
R10=0000000000000002
R11=0000000000000206
R12=00000000012607C0
R13=0000000100161BA0
R14=0000000100258300
R15=0000000100257A18
```

我确实在第一次扫描基址时发现了一个静态基，但我记得这是一个假基。 所以这里我们想要的是 'process.exe+offset' 形式的基址，你可以尝试其他看起来像 'module.dll+offset' 的地址，但我想说的是，这里它们将被证明是假指针。是的，大多数较新的游戏都会有很多 false 值和指针。

以及地址 hold： 0000000001287960 的调试器输出

```
10002D88B - E8 90961200 - call Tutorial-x86_64.exe+XXXXXX
10002D890 - E9 65000000 - jmp Tutorial-x86_64.exe+XXXXXX
10002D895 - 48 83 3E 00 - cmp qword ptr [rsi],00  <<<<<<
10002D899 - 74 5F - je Tutorial-x86_64.exe+XXXXXX
10002D89B - 48 8B 36  - mov rsi,[rsi]

RAX=0000000000013117
RBX=000000000125CD60
RCX=000000000125CD60
RDX=0000000000003CE3
RSI=0000000002D6D540  <<<<<<
RDI=0000000100258308
RSP=000000000102F070
RBP=000000000102F0B0
RIP=000000010002D899
R8=0000000100161BA0
R9=00000000008E06A0
R10=0000000000000002
R11=0000000000000206
R12=00000000012607C0
R13=0000000100161BA0
R14=0000000100258300
R15=0000000100257A18
```

以及来自地址 holding： 0000000002D6D540 的调试器输出

```
10002D845 - E8 D6961200 - call Tutorial-x86_64.exe+XXXXXX
10002D84A - E9 AB000000 - jmp Tutorial-x86_64.exe+XXXXXX
10002D84F - 48 83 7E 18 00 - cmp qword ptr [rsi+18],00  <<<<<<
10002D854 - 0F84 A0000000 - je Tutorial-x86_64.exe+XXXXXX
10002D85A - 48 8B 76 18  - mov rsi,[rsi+18]

RAX=00000000000166D2
RBX=000000000125CD60
RCX=000000000125CD60
RDX=000000000000302E
RSI=0000000002D6CE40  <<<<<<
RDI=0000000100258308
RSP=000000000102F070
RBP=000000000102F0B0
RIP=000000010002D854
R8=0000000100161BA0
R9=00000000008E06A0
R10=0000000000000002
R11=0000000000000206
R12=00000000012607C0
R13=0000000100161BA0
R14=0000000100258300
R15=0000000100257A18
```

以及来自地址 holding： 00000000002D6CE40 的调试器输出

```
10002D800 - E8 1B971200 - call Tutorial-x86_64.exe+XXXXXX
10002D805 - E9 F0000000 - jmp Tutorial-x86_64.exe+XXXXXX
10002D80A - 48 83 7E 10 00 - cmp qword ptr [rsi+10],00  <<<<<<
10002D80F - 0F84 E5000000 - je Tutorial-x86_64.exe+XXXXXX
10002D815 - 48 8B 76 10  - mov rsi,[rsi+10]

RAX=000000000000B567
RBX=000000000125CD60
RCX=000000000125CD60
RDX=00000000000050A1
RSI=000000000123F1C0  <<<<<<
RDI=0000000100258308
RSP=000000000102F070
RBP=000000000102F0B0
RIP=000000010002D80F
R8=0000000100161BA0
R9=00000000008E06A0
R10=0000000000000002
R11=0000000000000206
R12=00000000012607C0
R13=0000000100161BA0
R14=0000000100258300
R15=0000000100257A18
```


现在我们扫描那个基地 '0000000000123F1C0'，你应该找到一个静态地址，但在实际游戏中，你会继续前进，直到找到一个静态基地。

以该静态地址为基础，我的指针将如下所示。

```
[[[["Tutorial-x86_64.exe"+XXXXXX]+10]+18]+0]+18
```

![](/images/posts/cheat-engine/38.png)

## 指针扫描

指针扫描可用于快速解决此问题，首先找到所需值的地址，保存生成的指针映射，重新启动游戏，再次搜索地址，保存另一个指针映射，然后将两者进行比较。更多信息可以在 [Help_File：Pointer_scan](https://wiki.cheatengine.org/index.php?title=Help_File:Pointer_scan) 中找到。

## 最后

**找到指针后，将其冻结在 5000 处，然后单击\*更改指针\*按钮**。 如果您找到了正确的底座，则 Next （下一步） 按钮应在大约 2 秒后变为启用状态。 所以**点击 \*下一步\* 按钮**进入下一步。

# 第 9 步：共享代码

当您开始第 9 步时，您应该会看到如下所示的表单。

![](/images/posts/cheat-engine/39.png)

所以这里就像帮助文本所说的那样，解决方案远不止一个。

首先，我们需要**找到其中一个地址并将其添加到表中**。

如果您在查找地址时遇到问题，请记得尝试不同的值类型，并且不要忘记开始*新的扫描*。

然后，就像在步骤 7 中一样，我们想**看看什么访问了地址**，以找到写入 actor 生命值的函数。

如果您想尝试不同的方法，请继续**保存密码**，这是本教程的最后一步。

因此，在这里，最好了解我们实际上在寻找什么来区分盟友和战斗人员。

编写游戏或引擎时，Actor 和 Players 可能会像这样编写。

```c++
 # Actor，所有 Actor 的基础
 class Actor（object）{
 	string Name = 'Actor';
 	坐标坐标 = new Coord（0， 0， 0）;
 	浮生命值 = 100.0;...
 }
 Player class Player（Actor）{
 	Player 继承形式 Actor string Name = 'Player';int团队 = 1;...
 }
```

团队本身可能是一个结构，比如说，如果它被声明为一个对象类，比如 'Coords' 变量，我们想寻找一个指向参与者团队结构的指针。

因此，我们可以做到这一点的一种方法是在玩家结构中查找团队 ID 或团队结构。

## 在玩家结构中找到团队 ID

找到降低生命值的函数后。

**右键单击反汇编器视图表单中的指令，然后选择 \*find out what addresses this instruction accesss（找出此指令访问的地址\***）。

![](/images/posts/cheat-engine/40.png)

然后点击**所有 4 个值的 *attack* 按钮**。

调试器列表中应包含所有 4 个地址。

![](/images/posts/cheat-engine/41.png)

因此，请继续**将它们添加到地址列表中**。

![](/images/posts/cheat-engine/42.png)

然后，让我们打开 dissect 数据结构表单。

![](/images/posts/cheat-engine/43.png)

你会得到一些弹出窗口，经过思考，你应该会看到这样的表单。 请注意，我必须扩展表单的宽度才能移动列。

现在，在我的偏移量上，0x10被猜测为一个指针，在 64 位进程中是 8 字节宽的。我看到 0x10 处的指针的值看起来真的不像指针。

所以我不得不将其切换到 4 字节，并添加一个新的元素集，将其偏移量设置为 4 字节值类型的 0x14。这通常是它的工作方式。

![](/images/posts/cheat-engine/44.png)

所以在这里我们可以看到 team 变量位于结构的偏移量0x14。

现在我们需要**向脚本添加一些注入代码**，然后**添加一些代码来检查结构的 team 变量**，以确定哪些角色是盟友，哪些是战斗人员。

所以我们想要一些这样的。

![](/images/posts/cheat-engine/45.png)


因此，启用此脚本后， 当游戏写入 Actor 生命值时，以下是跳转到 Hook 代码后将发生的情况：

1. 保存 （[PUSH](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:PUSH)） RFLAGS 寄存器，不是完全需要的，但在比较时仍然是一个好习惯。
2. 检查 actor 是否在团队 1 中。
   1. 如果 actor 在团队 1 中，则我们将新值设置为浮点格式的 5000。
3. 检查 actor 是否在团队 2 中。
   1. 如果 actor 在团队 2 中，则我们将新值以十六进制格式设置为 0。（浮点数 0 == int 0 == 十六进制 0）
4. 恢复 （[POP](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:POP)） RFLAGS 寄存器，如果寄存器被 [PUSH 化](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:PUSH)，则完全需要这样做。


**启用此脚本后，单击 \*restart game and autoplay\* 按钮**，然后您应该会看到表单发生变化，如下所示。

![](/images/posts/cheat-engine/46.png)

因此**，单击\*下一步\*按钮**完成本教程。

然后，您应该会看到一个表单，告诉您已完成本教程。



## 在寄存器中查找差异

找到降低生命值的函数后。

**右键单击反汇编器视图表单中的指令，然后选择 \*find out what addresses this instruction accesss（找出此指令访问的地址\***）。

![](/images/posts/cheat-engine/47.png)

然后点击**所有 4 个值的 *attack* 按钮**。

调试器列表中应包含所有 4 个地址。

![](/images/posts/cheat-engine/48.png)

现在让我们看看寄存器，看看我们是否能找到盟友和战斗人员的不同之处。

**单独选择每个地址，然后按 *Ctrl+R***。

排列表单以使其更易于比较。

![](/images/posts/cheat-engine/49.png)

所以在这里我们可以看到 Fighterants 的 RSI 为 1。

所以像这样的脚本应该可以工作。

![](/images/posts/cheat-engine/50.png)


因此，启用此脚本后， 当游戏写入 Actor 生命值时，以下是跳转到 Hook 代码后将发生的情况：

1. 保存 （[PUSH](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:PUSH)） RFLAGS 寄存器，不是完全需要的，但在比较时仍然是一个好习惯。
2. 检查 RSI register 是否为 1。
   1. 如果 RSI register 为 1，则我们将新值以十六进制格式设置为 0。（浮点数 0 == int 0 == 十六进制 0）
   2. 如果 RSI register 不为 1，则我们假设参与者是盟友，因此我们将新值设置为浮点格式的 5000。
3. 恢复 （[POP](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:POP)） RFLAGS 寄存器，如果寄存器被 [PUSH 化](https://wiki.cheatengine.org/index.php?title=Assembler:Commands:PUSH)，则完全需要这样做。

**启用此脚本后，单击 *restart game and autoplay* 按钮**，然后您应该会看到表单发生变化，如下所示。

![](/images/posts/cheat-engine/51.png)

因此**，单击\*下一步\*按钮**完成本教程。

然后，您应该会看到一个表单，告诉您已完成本教程。

PS：

```
提示1: 健康是一个单浮点数
提示2: 解法不只一种
```

![](/images/posts/cheat-engine/52.png)

![](/images/posts/cheat-engine/53.gif)