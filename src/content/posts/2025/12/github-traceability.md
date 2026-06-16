---
title: GitHub 的正反向溯源方式
published: 2025-12-15 11:10
tags: [安全, GitHub, 溯源]
category: 工具
draft: false
---

# GitHub的正反向溯源方式

在很多溯源场景里，GitHub 是一个极其稳定的信号源。无论是 APT 相关人员分析、数据泄露事件溯源，还是企业外部风险筛查，GitHub 都经常出现在调查链条的关键位置。原因并不复杂：代码提交是长期行为，具有明确时间线，而且很难在不影响正常使用的情况下完全抹除历史痕迹。而且 GitHub 的溯源是很方便的，这里介绍两种正反方向溯源的方式，一种是有知道账号找邮箱，一种是知道邮箱找账号。 GitHub 溯源的本质是查询公开的历史提交行为。

## **一、通过 GitHub 账号反向查找邮箱**

砸开原理为通过已知 GitHub 用户名找注册邮箱，用户就算在 GitHub Profile 页面隐藏邮箱，只要其曾向公开仓库提交代码，提交记录中的 `commit.author.email` 字段就会被长期保留。如果用户没有始终使用 `noreply.github.com`，那么这些历史邮箱是可以被稳定提取的。

有两种获取方式，一是在这个开发者项目中找commit记录，随便打开一个，在URL末尾加.patch，就可以看到文本版的记录，邮箱就在页面最开头，效果如下：

![1](/images/posts/github-traceability/1.png)

第二种获取用`GitHub`自己的api获取目标开发者`repo（api.github.com/users/{username}/repos）`，筛选其中`author email`部分就行，写脚本的话过滤掉`noreply.`会更方便。

## 二、通过邮箱正向查找 GitHub 账号

已知一个邮箱地址，希望确认其是否对应真实的 GitHub 技术账号。GitHub 提供了 commit 搜索接口，允许按照 `author-email` 查询历史提交。只要某个邮箱曾被用于公开仓库的提交，就可以直接返回对应的提交记录和作者对象。这里的关键点在于：返回的 GitHub 用户并不是模糊匹配，而是`GitHub`已经建立好的历史关联关系。

使用方式也是通过`GitHub`官方`api`搜索`commits`，查询条件指定目标邮箱，查看回包信息就行

```
https://api.github.com/search/commits?q=author-email:{email}
```

后续就可以直接围绕账号展开行为分析，例如技术方向、参与项目、组织关联和活跃时间线。而且`GitHub api`的返回结构稳定，字段清晰，天然适合脚本循环和结果结构化存储。也很适合自动化或批量化。

## 三、查找 Commit URL

在`Github`项目页进入`commit`查看历史提交记录

![2](/images/posts/github-traceability/2.png)

可以`F12`搜索`commit`也可以直接复制历史提交记录`URL`

![3](/images/posts/github-traceability/3.png)

