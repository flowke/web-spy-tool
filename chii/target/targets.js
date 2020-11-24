import query from 'licia/query';
import randomId from 'licia/randomId';
import safeStorage from 'licia/safeStorage';
import $ from 'licia/$';
import contain from 'licia/contain';
import Socket from 'licia/Socket';
import chobitsu from 'chobitsu';

const sessionStore = safeStorage('session');

let ChiiServerUrl = location.host;

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

  const $link = $('link');
  $link.each(function () {
    if (contain(this.getAttribute('rel') || '', 'icon')) {
      const href = this.getAttribute('href');
      if (href) favicon = fullUrl(href);
    }
  });

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

const ws = new Socket(
  `${protocol}//${ChiiServerUrl}/target/${id}?${query.stringify({
    url: location.href,
    title: window.ChiiTitle || document.title,
    favicon: getFavicon(),
  })}`
);

ws.on('open', () => {
  isInit = true;
  ws.on('message', event => {
    chobitsu.sendRawMessage(event.data);
  });
});

chobitsu.setOnMessage(() => {
  if (!isInit) return;
  ws.send(message);
});