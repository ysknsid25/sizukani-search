import { SIZU_ME_BASE_URL } from '~lib/constants';

export {};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CHECK_SIZU_USER') {
    const username: string = message.username;
    fetch(`${SIZU_ME_BASE_URL}/${username}`, {
      method: 'GET',
      redirect: 'follow',
    })
      .then(res => sendResponse({ ok: res.ok }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
});
