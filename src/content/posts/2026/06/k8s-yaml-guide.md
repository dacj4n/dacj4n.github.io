---
title: K8s YAML 编写指南：Deployment 与 Service
published: 2026-06-02 09:52
category: 工具
draft: false
tags: [K8s, YAML, 容器]
---

## 一、核心概念

K8s 中部署一个应用，通常需要两个 YAML 文件：

| 文件         | 作用                   | 类比      |
| ---------- | -------------------- | ------- |
| Deployment | 定义"跑什么"（镜像、副本数、容器配置） | 决定开几家店  |
| Service    | 定义"怎么访问"（端口映射、网络暴露）  | 决定怎么找到店 |

```
用户请求 → Service (端口映射) → Pod (容器运行应用)
```

---

## 二、Deployment 编写详解

### 2.1 完整模板

```yaml
apiVersion: apps/v1          # API 版本（Deployment 固定写 apps/v1）
kind: Deployment             # 资源类型
metadata:                    # 元数据（名称、标签等）
  name: java-chains          # Deployment 名称（全局唯一）
  labels:                    # Deployment 级别的标签
    app: java-chains
spec:                        # 规格说明
  replicas: 1                # 运行几个 Pod 副本
  selector:                   # 选择器（匹配哪些 Pod 属于这个 Deployment）
    matchLabels:
      app: java-chains       # 必须与 template.metadata.labels 一致
  template:                   # Pod 模板（定义 Pod 的内容）
    metadata:
      labels:
        app: java-chains     # Pod 的标签（selector 通过这个匹配）
    spec:                    # Pod 的规格
      containers:
        - name: java-chains  # 容器名称
          image: java-chains-1.4.1:latest  # 镜像名称:标签
          imagePullPolicy: IfNotPresent    # 镜像拉取策略
          ports:
            - containerPort: 8011         # 容器监听的端口
```

### 2.2 各字段详解

#### metadata（元数据）

```yaml
metadata:
  name: java-chains    # 名称，kubectl get/deploy/logs 时用这个名字
  labels:              # 键值对标签，用于 Service 选择和分类
    app: java-chains   # 自定义标签名，通常用 app=<应用名>
  namespace: default   # 可选，指定命名空间，默认 default
```

#### spec（规格）

```yaml
spec:
  replicas: 1          # Pod 副本数量，高可用设为 3
  selector:             # Pod 选择器，必须与 template.labels 匹配
    matchLabels:
      app: java-chains
```

#### template（Pod 模板）

```yaml
  template:
    metadata:
      labels:
        app: java-chains     # ⚠️ 必须与 selector.matchLabels 一致
    spec:
      containers:
        - name: java-chains
          image: java-chains-1.4.1:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8011
```

### 2.3 imagePullPolicy 镜像拉取策略

| 策略 | 含义 | 适用场景 |
|------|------|---------|
| `IfNotPresent` | 本地有就用本地的，没有才拉取 | 本地开发的镜像 |
| `Always` | 每次创建 Pod 都拉取最新镜像 | 使用 `latest` 标签时 |
| `Never` | 从不拉取，只用本地镜像 | 离线环境 |

### 2.4 多容器示例

一个 Pod 可以运行多个容器（通常一个主容器 + 多个边车容器）：

```yaml
spec:
  containers:
    - name: java-chains
      image: java-chains-1.4.1:latest
      ports:
        - containerPort: 8011
    - name: log-collector    # 边车容器：收集日志
      image: log-collector:latest
      volumeMounts:
        - name: logs
          mountPath: /app/logs
  volumes:
    - name: logs
      emptyDir: {}
```

---

## 三、Service 编写详解

### 3.1 Service 类型对比

| 类型 | 外部可访问 | 适用场景 |
|------|-----------|---------|
| `ClusterIP` | ❌ 仅集群内部 | 微服务间通信、内部 API |
| `NodePort` | ✅ 通过 `节点IP:端口` | 开发测试、简单对外暴露 |
| `LoadBalancer` | ✅ 通过云厂商负载均衡 | 生产环境（需要云支持） |

### 3.2 ClusterIP（默认，仅内部访问）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: java-chains
spec:
  type: ClusterIP             # 默认值，可省略
  selector:
    app: java-chains           # 通过标签选择 Pod
  ports:
    - port: 8011               # Service 对外暴露的端口
      targetPort: 8011         # 转发到 Pod 的 containerPort
```

访问方式：集群内其他 Pod 通过 `java-chains.default.svc.cluster.local:8011` 访问。

### 3.3 NodePort（对外暴露端口）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: java-chains
spec:
  type: NodePort
  selector:
    app: java-chains
  ports:
    - port: 8011               # 集群内部访问端口
      targetPort: 8011         # Pod 容器端口
      nodePort: 30011          # 外部访问端口（范围 30000-32767）
```

访问方式：浏览器通过 `http://localhost:30011` 访问。

### 3.4 多端口 Service

一个 Service 可以暴露多个端口：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: java-chains
spec:
  type: NodePort
  selector:
    app: java-chains
  ports:
    - name: http               # 端口名称（必须）
      port: 8011
      targetPort: 8011
      nodePort: 30011
    - name: metrics            # 第二个端口
      port: 9090
      targetPort: 9090
      nodePort: 30090
```

> ⚠️ 多端口时，每个端口必须有 `name` 字段。

### 3.5 多个 Service 合并写法

多个 Service 可以写在同一个 YAML 文件中，用 `---` 分隔：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: java-chains
spec:
  type: NodePort
  selector:
    app: java-chains
  ports:
    - port: 8011
      targetPort: 8011
      nodePort: 30011
---
apiVersion: v1
kind: Service
metadata:
  name: java-sec-code
spec:
  type: ClusterIP
  selector:
    app: java-sec-code
  ports:
    - port: 8080
      targetPort: 8080
```

---

## 四、端口映射详解

### 4.1 三层端口关系

```
外部请求 → nodePort → port → targetPort → containerPort → 应用
(浏览器)   (宿主机)   (Service)  (转发规则)   (容器内)    (监听)
```

| 字段 | 在哪定义 | 谁在使用 | 是否必须 |
|------|---------|---------|---------|
| `containerPort` | Deployment | 容器内的应用 | 建议填写（文档作用） |
| `targetPort` | Service | Service 转发目标 | ✅ 必须 |
| `port` | Service | 集群内其他 Pod | ✅ 必须 |
| `nodePort` | Service | 外部浏览器 | 仅 NodePort 类型 |

### 4.2 port 和 targetPort 可以不同

```yaml
ports:
  - port: 80           # 集群内访问 :80
    targetPort: 8011   # 实际转发到容器的 8011
    nodePort: 30080    # 外部访问 :30080
```

这样：
- 集群内：`curl java-chains:80` → 转发到容器 8011
- 集群外：`curl localhost:30080` → 转发到容器 8011

### 4.3 nodePort 端口范围

默认范围是 **30000-32767**，超出范围会报错。

如果需要使用范围外的端口（如 18011），有两种方式：

**方式一：修改 kube-apiserver 参数（不推荐）**

Docker Desktop 可以在设置中修改，但不建议。

**方式二：使用 port-forward（推荐，临时方案）**

```bash
# 将本地 18011 映射到 Service 的 8011
kubectl port-forward svc/java-chains 18011:8011

# 然后浏览器访问 http://localhost:18011
```

**方式三：使用 docker run 的 -p 参数（Docker Desktop 特有）**

```bash
# 不需要改 YAML，直接映射
kubectl port-forward svc/java-chains 18011:8011 --address 0.0.0.0
```

---

## 五、完整操作流程

### 5.1 从零部署一个应用

```bash
# ===== 第一步：构建镜像 =====
cd demo/java-chains-1.4.1/
docker build -t java-chains-1.4.1:latest .

# ===== 第二步：加载镜像到 K8s =====
# Docker Desktop 内置 K8s 可以直接使用 docker build 的镜像
# Minikube 需要额外加载：
# minikube image load java-chains-1.4.1:latest

# ===== 第三步：部署 Deployment =====
kubectl apply -f java-chains-deploy.yaml

# ===== 第四步：创建 Service =====
kubectl apply -f services.yaml

# ===== 第五步：验证 =====
kubectl get pods -l app=java-chains
kubectl get svc java-chains

# ===== 第六步：访问 =====
# ClusterIP 类型（仅内部）
kubectl port-forward svc/java-chains 8011:8011
# 浏览器访问 http://localhost:8011

# NodePort 类型（直接访问）
# 浏览器访问 http://localhost:30011
```

### 5.2 修改端口映射

```bash
# 1. 编辑 services.yaml，修改 port/targetPort/nodePort
vi services.yaml

# 2. 重新 apply（K8s 会自动更新）
kubectl apply -f services.yaml

# 3. 验证
kubectl get svc java-chains
```

### 5.3 修改镜像版本

```bash
# 1. 修改 deploy.yaml 中的 image 字段
#    image: java-chains-1.4.1:latest
#    改为
#    image: java-chains-1.4.2:latest

# 2. 重新 apply
kubectl apply -f java-chains-deploy.yaml

# 3. 查看 Pod 是否重建（新镜像会触发滚动更新）
kubectl get pods -l app=java-chains -w
```

### 5.4 扩缩容

```bash
# 方式一：修改 deploy.yaml 中 replicas 字段后 apply

# 方式二：命令行直接扩缩
kubectl scale deployment java-chains --replicas=3

# 查看副本数
kubectl get pods -l app=java-chains
```

### 5.5 删除资源

```bash
# 删除 Service
kubectl delete -f services.yaml

# 删除 Deployment
kubectl delete -f java-chains-deploy.yaml

# 或按名称删除
kubectl delete svc java-chains
kubectl delete deployment java-chains
```

---

## 六、常用排查命令

```bash
# 查看 Pod 状态
kubectl get pods -l app=java-chains

# 查看 Pod 详情（包括事件）
kubectl describe pod <pod-name>

# 查看 Pod 日志
kubectl logs <pod-name>
kubectl logs <pod-name> -f          # 实时日志
kubectl logs <pod-name> --tail 50   # 最后50行

# 查看 Service 详情
kubectl describe svc java-chains

# 查看 Service 端点（Pod 是否被正确关联）
kubectl get endpoints java-chains

# 进入容器
kubectl exec -it <pod-name> -- sh

# 端口转发（临时暴露）
kubectl port-forward svc/java-chains 8011:8011

# 查看 Pod 所在节点
kubectl get pods -l app=java-chains -o wide
```

---

## 七、常见问题

### Q1: Service 创建了但 Endpoints 为空？

```bash
kubectl get endpoints java-chains
# 如果显示 <none>，说明 selector 没有匹配到任何 Pod
```

**原因**：Service 的 `selector.app` 与 Pod 的 `labels.app` 不一致。

**排查**：
```bash
kubectl get pods --show-labels | grep java-chains
```

### Q2: 修改了 YAML 但没有生效？

```bash
# 检查是否有语法错误（dry-run 不实际执行）
kubectl apply -f services.yaml --dry-run=client

# 查看当前实际生效的配置
kubectl get svc java-chains -o yaml
```

### Q3: NodePort 端口冲突？

```
The Service "java-chains" is invalid: spec.ports[0].nodePort: Invalid value: 30011: provided port is already allocated
```

说明 30011 已被其他 Service 占用。换一个端口即可。

### Q4: Pod 一直 CrashLoopBackOff？

```bash
kubectl logs <pod-name>           # 查看应用日志
kubectl describe pod <pod-name>   # 查看事件（可能有镜像拉取失败等信息）
```

常见原因：镜像不存在、应用启动报错、端口被占用。

### Q5: 如何查看当前集群所有端口映射？

```bash
kubectl get svc --all-namespaces
# 或更详细
kubectl get svc -o wide --all-namespaces
```
