const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');
const readTpl = require('../lib/readTpl');
const now = require('licia/now');
const pairs = require('licia/pairs');
const reverse = require('licia/reverse');
const map = require('licia/map');
const ms = require('licia/ms');

const pkg = require('../../package.json');

const maxAge = ms('2h');

function routerMid(channelManager, domain, type) {
  const router = new Router();
  // 目前来说, 有两个
  routerMid.setChannelManager({
    title: type,
    channerM: channelManager
  });
  router.get('/', async ctx => {

    let targetsList = routerMid.channelManagerList.map(({
          title,
          channerM
        }) => {
      return {
        title,
        targets: reverse(
          map(pairs(channerM.getTargets()), item => ({
            id: item[0],
            ...item[1],
          }))
        )
      }
    })

    const tpl = await readTpl('index');
    ctx.body = tpl({
      targetsList,
      domain,
      version: pkg.version,
    });
  });

  routerMid.timestamp = now();
  router.get('/timestamp', ctx => {
    ctx.body = routerMid.timestamp;
  });
  // routerMid.channelManagerList.forEach(d=>{
  //   d.channerM.on('target_changed', () => (timestamp = now()));
  // })
  // channelManager.on('target_changed', () => (timestamp = now()));

  function createStatic(prefix, folder) {
    router.get(`${prefix}/*`, async ctx => {
      await send(ctx, ctx.path.slice(prefix.length), {
        root: path.resolve(__dirname, `../..${folder}`),
        maxAge,
      });
    });
  }

  createStatic('/front_end', '/public/front_end');
  createStatic('/tests', '/tests');

  router.get('/target.js', async ctx => {
    await send(ctx, 'target.js', {
      root: path.resolve(__dirname, '../../public'),
      maxAge,
    });
  });

  return router.routes();
};

routerMid.channelManagerList = []

routerMid.setChannelManager = (c)=>{
  c.channerM.on('target_changed', () => (routerMid.timestamp = now()));
  routerMid.channelManagerList.push(c);
}


module.exports = routerMid