import query from 'licia/query';
import randomId from 'licia/randomId';
import safeStorage from 'licia/safeStorage';
import $ from 'licia/$';
import contain from 'licia/contain';
import Socket from 'licia/Socket';
import chobitsu from 'chobitsu';

const sessionStore = safeStorage('session');

let ua = navigator.userAgent;

ua = ua.replace(/[\/\s\.;,]/g,'_')

let ChiiServerUrl = location.host;

// console.__slog = console.log;
// window._preLogs_ = []
// console.log = function(){
//   window._preLogs_.push(arguments);
//   console.__slog.apply(console,arguments)
// }
// console.log(navigator.userAgent);
// window._listConsole = function (){
//   console.log = console.__slog
//   window._preLogs_.forEach(args=>{
//     console.log.apply(console,args)
//   })
// }

function getTargetScriptEl() {
  const elements = document.getElementsByTagName('script');
  let i = 0;
  while (i < elements.length) {
    const element = elements[i];
    if (-1 !== element.src.indexOf('/target.js')) {
      return element;
    }
    i++;
  }
}

if (window.ChiiServerUrl) {
  ChiiServerUrl = window.ChiiServerUrl;
} else {
  const element = getTargetScriptEl();
  if (element) {
    const pattern = /((https?:)?\/\/(.*?)\/)/;
    const match = pattern.exec(element.src);
    if (match) {
      ChiiServerUrl = match[3];
    }
  }
}

function getFavicon() {
  let favicon = location.origin + '/favicon.ico';
  try {
    const $link = $('link');
    $link.each(function () {
      if (contain(this.getAttribute('rel') || '', 'icon')) {
        const href = this.getAttribute('href');
        if (href) favicon = fullUrl(href);
      }
    });
  } catch (error) {
    console.log(error);
  }
  

  return favicon;
}

const link = document.createElement('a');

function fullUrl() {
  link.href = href;

  return link.protocol + '//' + link.host + link.pathname + link.search + link.hash;
}

let isInit = false;

let id = localStorage.getItem('__spy_id_for_test');
if (!id) {
  id = randomId(6);
  localStorage.setItem('__spy_id_for_test', id);
}

const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

let showUA = '';
try {
  showUA = ua.match(/\(([^)]*)\)/)[1]
} catch (error) {
  
}

const ws = new Socket(
  `${protocol}//${ChiiServerUrl}/target/${id}?${query.stringify({
    url: location.href,
    title: window.ChiiTitle || document.title,
    favicon: getFavicon(),
    ua: showUA
  })}`
);

ws.on('open', () => {
  isInit = true;
  ws.on('message', event => {
    chobitsu.sendRawMessage(event.data);
  });
});

chobitsu.setOnMessage((message) => {
  if (!isInit) return;
  ws.send(message);
});