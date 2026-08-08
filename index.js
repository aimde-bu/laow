const http = require('http');
const fs = require('fs');
const os = require('os');
const net = require('net');
const path = require('path');
const { exec, execSync } = require('child_process');
const { WebSocket, createWebSocketStream } = require('ws');

// ================= 手动配置区(直接改这里) =================
// 工具函数: val 非空才写入环境变量(空/注释掉 = 不启用该协议)
function def(env, val) { if (val) process.env[env] = process.env[env] || val; }

def('uuid', 'd9b609fe-5b77-4100-9b46-bfc7888bcd9d');            // ←【必填】UUID,在线生成 https://www.uuidgenerator.net
def('DOMAIN', '');          // ←【必填】你的域名,没有就填服务器IP

def('vlpt', '20518');            // Vless-reality 端口
def('vmpt', '');            // Vmess-ws 端口
def('hypt', '');            // Hysteria2 端口
def('vwpt', '');            // Vless-ws 端口
def('tupt', '');            // Tuic 端口
def('anpt', '');            // AnyTLS 端口
def('sspt', '');            // Shadowsocks-2022 端口
def('sopt', '');            // Socks5 端口 (用户名密码都是uuid)
def('name', '');            // 【可选】节点名称前缀
// =========================================================

const NAME = process.env.NAME || os.hostname();
const subtxt = path.join(os.homedir(), 'agsbx', 'jhsub.txt');
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'no_domain';
const rawUUID = process.env.uuid || 'subuuid';
const hasUUID = !!process.env.uuid;
const hasDOMAIN = !!process.env.DOMAIN;
const uuid = rawUUID.replace(/-/g, "");
const vlessURL = (hasUUID && hasDOMAIN)
  ? `vless://${rawUUID}@${DOMAIN}:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-ws-tls-${NAME}`
  : '';

const protoVars = ['vlpt','vmpt','vwpt','hypt','tupt','anpt','sspt','sopt','nvpt','xupt','xcpt','xhpt','vxpt','arpt'];
const enabledProto = protoVars.filter(k => process.env[k]);
console.log('[诊断] uuid:', hasUUID ? '已设置' : '未设置', '| DOMAIN:', process.env.DOMAIN || '未设置', '| PORT:', PORT);
console.log('[诊断] 启用的协议变量:', enabledProto.length ? enabledProto.map(k => `${k}=${process.env[k]}`).join(' ') : '无');
console.log('[诊断] 订阅文件路径:', subtxt, '| 存在:', fs.existsSync(subtxt));
// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🟢恭喜！部署成功！欢迎使用甬哥YGkkk-ArgoSBX小钢炮脚本💣 【当前版本V26.7.16】\n\n查看节点信息路径：/你的uuid（已设uuid变量时）或者/subuuid（未设uuid变量时）');
  } else if (req.url === `/${rawUUID}`) {
    fs.readFile(subtxt, 'utf8', (err, data) => {
      const result = !err && data
        ? (vlessURL ? `${vlessURL}\n${data}` : data)
        : vlessURL;
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(result);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('❌Not Found：路径错误！！！\n\n查看节点信息路径：/你的uuid（已设uuid变量时）或者/subuuid（未设uuid变量时）');
  }
});

server.listen(PORT, () => {
  console.log(`✅Server is running on port ${PORT}`);
});

// 赋权并运行脚本
fs.chmod("argosbx.sh", 0o777, (err) => {
  if (err) {
    console.error(`argosbx.sh empowerment failed: ${err}`);
    return;
  }
  console.log(`argosbx.sh empowerment successful`);
  const runlog = path.join(os.homedir(), 'agsbx-run.log');
  const child = exec('bash argosbx.sh >> ' + runlog + ' 2>&1');
  const tail = setInterval(() => {
    try {
      const last = fs.readFileSync(runlog, 'utf8').split('\n').slice(-15).join('\n');
      if (last !== tail.last) { tail.last = last; console.log(last); }
    } catch (e) {}
  }, 2000);
  child.on('close', (code) => {
    clearInterval(tail);
    console.log(`🚀App is running`);
    setTimeout(() => {
      console.log('[诊断] argosbx.sh退出码:', code);
      console.log('[诊断] 运行日志尾部(~/agsbx-run.log):');
      try { console.log(fs.readFileSync(runlog, 'utf8').split('\n').slice(-25).join('\n')); } catch (e) {}
      console.log('[诊断] 订阅文件存在:', fs.existsSync(subtxt));
      if (fs.existsSync(subtxt)) {
        const c = fs.readFileSync(subtxt, 'utf8');
        console.log('[诊断] 订阅文件节点数:', c.replace(/^\s*$/gm, '').split('\n').filter(l => l.trim()).length, '行');
      }
      if (!enabledProto.length) console.log('[提醒] 未设置任何协议变量(vlpt/vmpt/hypt等), argosbx.sh不会安装代理, 请检查.env是否上传成功');
      if (!hasUUID) console.log('[提醒] 未设置uuid变量, 订阅路径将是/subuuid且无内置ws节点');
    }, 1000);
    
    if (hasUUID && hasDOMAIN) {
      const wss = new WebSocket.Server({ server });
      wss.on('connection', ws => {
        ws.once('message', msg => {
          if (!(msg instanceof Buffer)) {
            msg = Buffer.from(msg);
          }
          if (msg.length < 19) {
            console.warn('Invalid message: too short');
            return;
          }
          const [VERSION] = msg;
          const id = msg.slice(1, 17);
          if (!id.every((v, i) => v === parseInt(uuid.substr(i * 2, 2), 16))) {
            console.warn('UUID mismatch');
            return;
          }
          const offset = msg.readUInt8(17);
          let i = 19 + offset;
          if (msg.length < i + 3) {
            console.warn('Invalid message: not enough data for port and ATYP');
            return;
          }
          const port = msg.readUInt16BE(i);
          i += 2;
          const ATYP = msg.readUInt8(i++);
          let host = '';
          try {
            if (ATYP === 1) { // IPv4
              if (msg.length < i + 4) throw new Error('IPv4 address too short');
              host = msg.slice(i, i += 4).join('.');
            } else if (ATYP === 2) { // Domain name
              const len = msg[i];
              if (msg.length < i + 1 + len) throw new Error('Domain length invalid');
              host = new TextDecoder().decode(msg.slice(i + 1, i += 1 + len));
            } else if (ATYP === 3) { // IPv6
              if (msg.length < i + 16) throw new Error('IPv6 address too short');
              host = msg.slice(i, i += 16)
                .reduce((s, b, j, a) => (j % 2 ? s.concat(a.slice(j - 1, j + 1)) : s), [])
                .map(b => b.readUInt16BE(0).toString(16))
                .join(':');
            } else {
              console.warn(`Unsupported ATYP: ${ATYP}`);
              return;
            }
          } catch (err) {
            console.warn('Failed to parse host:', err.message);
            return;
          }
          ws.send(new Uint8Array([VERSION, 0]));
          const duplex = createWebSocketStream(ws);
          net.connect({ host, port }, function () {
            this.write(msg.slice(i));
            duplex.on('error', () => {}).pipe(this).on('error', () => {}).pipe(duplex);
          }).on('error', () => {});
        }).on('error', () => {});
      });
      console.log(`\n💣Vless-ws-tls节点分享: \n${vlessURL}\n`);
    }
  });
});
