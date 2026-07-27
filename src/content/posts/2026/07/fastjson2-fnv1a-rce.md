---
title: Fastjson2 AutoType FNV-1a 哈希碰撞白名单绕过致远程代码执行
published: 2026-07-27 17:12
tags: [Fastjson2, FNV-1a, 哈希碰撞, RCE, 反序列化, 漏洞分析]
category: Web
draft: false
---

# Fastjson2 2.0.62 AutoType FNV-1a 哈希碰撞远程代码执行漏洞

## 漏洞概述

| 项目 | 详情 |
|------|------|
| **漏洞名称** | Fastjson2 AutoType FNV-1a 哈希碰撞白名单绕过致远程代码执行 |
| **影响版本** | Fastjson2 ≤ 2.0.62（含 `com.alibaba:fastjson` 和 `com.alibaba.fastjson2:fastjson2` 两个 artifact） |
| **漏洞类型** | 反序列化 - AutoType 白名单绕过 → RCE |
| **严重等级** | 高危（CVSS 待评估） |
| **影响 JDK** | 全版本（JDK 8 / 11 / 17 / 21），与 JDK 版本无关 |
| **官方修复** | [PR #7695](https://github.com/alibaba/fastjson2/pull/7695)（2026-07-25，wenshao） |
| **CVE 编号** | 待分配 |

Fastjson2 在默认配置下处理 JSON 中的 `@type` 字段时，使用 FNV-1a 增量哈希做白名单校验。由于该校验仅比对哈希值而未验证类名文本内容，攻击者可通过 chosen-prefix 碰撞构造恶意字符串绕过白名单，最终实现远程代码执行。

---

## 漏洞分析

### 根本原因 1：哈希校验无文本验证

核心缺陷位于 `ObjectReaderProvider.checkAutoType()`（第 848-871 行）：

```java
if (!autoTypeSupport) {
    long hash = MAGIC_HASH_CODE;        // 0xcbf29ce484222325L
    for (int i = 0; i < typeNameLength; ++i) {
        char ch = typeName.charAt(i);
        if (ch == '$') ch = '.';
        hash ^= ch;
        hash *= MAGIC_PRIME;            // 0x100000001b3L

        // ❌ 仅比对增量哈希值
        if (Arrays.binarySearch(acceptHashCodes, hash) >= 0) {
            // ❌ 直接 loadClass(完整 typeName)，不验证前缀文本
            clazz = loadClass(typeName);
            return clazz;
        }
    }
}
```

FNV-1a 作为非密码学哈希，增量校验存在如下绕过路径：逐字符计算哈希 → 在某个位置与白名单哈希碰撞 → 直接放行。**攻击者构造一个与白名单类名哈希相同但文本不同的前缀，即可绕过检查。**

同样缺陷存在于 `ContextAutoTypeBeforeHandler.apply()`（第 251-278 行）。

### 根本原因 2：loadClass 无协议字符过滤

`TypeUtils.loadClass()`（第 3004-3010 行）对输入类名未做任何特殊字符检查：

```java
// ❌ 无 : / ! 字符过滤，直接传入 ClassLoader
ClassLoader contextClassLoader = Thread.currentThread().getContextClassLoader();
if (contextClassLoader != null) {
    return contextClassLoader.loadClass(className);  // 可含 jar:http://... 等 URL
}
```

`:` 和 `!` 是 JAR URL 协议的关键字符（格式：`jar:http://host/path.jar!/classname`），攻击者可通过 URLClassLoader 加载远程恶意类。

### 攻击路径

```
JSON 输入: {"@type":"<碰撞前缀>+<恶意payload>","cmd":"..."}
    │
    ├─ ① 解析器读取 @type 值
    ├─ ② checkAutoType() 逐字符计算 FNV-1a 增量哈希
    ├─ ③ 碰撞前缀命中 acceptHashCodes → ★ 白名单绕过
    ├─ ④ loadClass(完整恶意 typeName) → 类加载
    └─ ⑤ 反序列化实例化 → setter/constructor → Runtime.exec() → RCE
```

---

## 利用条件

1. **受影响版本**：Fastjson2 ≤ 2.0.62
2. **解析配置**：`SupportAutoType` 特性启用，或应用使用能处理 `@type` 的解析模式（如 `JSON.parse(text, Feature.SupportAutoType)`）
3. **安全模式**：`SAFE_MODE` 未开启
4. **输入可控**：攻击者能够提交含 `@type` 字段的 JSON 到反序列化入口
5. **碰撞构造**：攻击者需离线计算 FNV-1a chosen-prefix 碰撞（模逆算法，理论可行）

> **注意**：本漏洞不依赖特定 JDK 版本，涉及的 API（`ClassLoader.loadClass`、`Runtime.exec`）均为 JDK 1.0 标准 API。

---

## 官方修复

PR [#7695](https://github.com/alibaba/fastjson2/pull/7695) 共修改 4 个文件，分四层防御：

### 第一层：入口字符拦截

在 `checkAutoType`、`loadClass`、`ContextAutoTypeBeforeHandler.apply` 入口统一添加：

```java
if (typeName.indexOf(':') >= 0 || typeName.indexOf('!') >= 0) {
    throw new JSONException("autoType is not support. " + typeName);
}
```

- `:` — 阻断 `jar:http://`、`netdoc:` 等 URL 协议
- `!` — 阻断 JAR URL 分隔符

### 第二层：白名单文字复核

哈希匹配后增加文本内容比对（根治哈希碰撞绕过）：

```java
// 新增 acceptNameSet，存储白名单类名
if (Arrays.binarySearch(acceptHashCodes, hash) >= 0) {
    String prefix = typeName.substring(0, i + 1).replace('$', '.');
    if (!acceptNameSet.contains(prefix)) {
        continue;  // ★ 哈希碰撞但文本不匹配 → 拒绝
    }
    clazz = loadClass(typeName);
    ...
}
```

### 第三层：高危类型检查

类加载成功后增加额外黑名单检查：

```java
if (clazz != null) {
    if (ClassLoader.class.isAssignableFrom(clazz)
        || JDKUtils.isSQLDataSourceOrRowSet(clazz)) {
        throw new JSONException("autoType is not support. " + typeName);
    }
}
```

### 第四层：底层加固

`TypeUtils.loadClass()` 增加入口过滤，与第一层保持一致。

---

## 修复建议

1. **立即升级**：升级到包含 PR #7695 的 Fastjson2 修复版本
2. **开启 SAFE_MODE**：添加 JVM 参数 `-Dfastjson2.parser.safeMode=true`
3. **关闭 AutoType**：代码中调用 `JSONFactory.setDisableAutoType(true)`
4. **入口过滤**：如暂无法升级，在反序列化入口对 `@type` 值做正则校验：`^[\w.$[\]]+$`
5. **网络隔离**：限制 JVM 出站网络连接，阻断远程 JAR 加载路径
6. **依赖审计**：扫描项目依赖，确认是否引用了受影响版本的 fastjson2

---

## 时间线

| 日期 | 事件 |
|------|------|
| 2026-05-05 | Fastjson2 2.0.62 发布（含漏洞） |
| 2026-07-25 | wenshao 提交 PR #7695，修复漏洞 |
| 2026-07-27 | 漏洞分析完成，确认 JDK 全版本受影响 |
