#!/usr/bin/env node
const path = require('path');
// 参数直接在 index.js 顶部的"手动配置区"填写,这里只负责启动
process.chdir(__dirname);
require(path.join(__dirname, 'index.js'));