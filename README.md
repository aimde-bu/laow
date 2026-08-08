# laow - Node.js 代理部署(适配面板托管)

基于甬哥 `ArgoSBX` 思路的 Node.js 部署方案,可直接在 **无 Docker / 无 root systemd 的面板容器**(如 KataBump 等游戏服务器托管)中运行,生成 VLESS / VMess / Hysteria2 等代理节点并提供订阅链接。

## 文件说明

| 文件 | 作用 |
|---|---|
| `start.js` | 启动入口,直接以 Node 方式加载 `index.js`(**不依赖 Docker**) |
| `index.js` | 主程序:HTTP 订阅服务器 + WS 代理 + 调用 argosbx.sh |
| `argosbx.sh` | 甬哥 ArgOSBx 一键脚本(内核安装/节点生成) |
| `Dockerfile` | 用于支持 Docker 的平台构建镜像,面板部署可忽略 |
| `package.json` | Node 依赖(仅 `ws`) |

## 快速开始

1. 将全部文件上传到服务器的应用目录(如 `/home/container/`)
2. 编辑 `index.js` 顶部的 **手动配置区**(见下文)
3. 面板中设置启动命令为 `node start.js`,设置环境变量 `PORT=3000`
4. 启动服务器,等待 `argosbx.sh` 安装完成(日志出现 `🚀App is running` 及节点信息)

## 配置(手动配置区)

所有参数直接写在 `index.js` 顶部约 7~20 行:

```js
def('uuid', '');            // ←【必填】UUID,在线生成 https://www.uuidgenerator.net
def('DOMAIN', '');          // ←【必填】你的访问域名或IP

def('vlpt', '');            // Vless-reality 端口
def('vmpt', '');            // Vmess-ws 端口
def('hypt', '');            // Hysteria2 端口
def('vwpt', '');            // Vless-ws 端口
def('tupt', '');            // TUIC 端口
def('anpt', '');            // AnyTLS 端口
def('sspt', '');            // Shadowsocks-2022 端口
def('sopt', '');            // Socks5 端口
def('name', '');            // 【可选】节点名称前缀
```

规则:

- **非空才生效**:引号内留空(`''`)或整行注释掉 = 不启用该协议
- 协议端口**不能与 `PORT`(默认 3000)冲突**,否则内核绑定失败导致安装失败
- 面板若只开放一个端口,其他端口外部无法访问,建议协议变量留空,仅用内置 `Vl-ws-tls` 节点(需要 `uuid` + `DOMAIN`)

## 订阅地址

- 访问根路径查看部署状态
- 订阅/节点信息地址:`https://你的域名/<uuid>`(未设 uuid 时为 `/subuuid`),内容来自生成的 `~/agsbx/jhsub.txt`

## 常见问题

| 现象 | 原因 | 解决 |
|---|---|---|
| 启动报 `docker: not found` | 旧版 start.js 调用 docker,容器内无 Docker | 使用新版 start.js,直接 Node 启动 |
| 订阅页面空白 | 未设置 uuid/DOMAIN,或订阅文件未生成 | 填好配置区,确认日志出现"安装完毕" |
| 日志结尾"Argosbx脚本进程未启动,安装失败" | 协议端口与 3000 冲突,内核启动失败 | 协议端口避开 3000,或留空不用 |
| 节点装了但是连不上 | 面板只暴露了 3000 端口,其他端口不通 | 只保留内置 ws-tls 节点,填 DOMAIN 使用 |

## 诊断

`index.js` 启动时输出诊断信息,脚本运行日志同时写入 `~/agsbx-run.log`(日志 tail 会打印最后 25 行),提交日志便于排查。
