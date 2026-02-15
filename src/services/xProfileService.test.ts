// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { XProfileService } from './xProfileService';

// DOM環境のセットアップ
function setDocument(html: string) {
  document.body.innerHTML = html;
}

const service = new XProfileService();

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('XProfileService', () => {
  describe('isTargetPage', () => {
    it('UserName要素があればtrueを返す', () => {
      setDocument(`<div data-testid="UserName">Alice\n@alice</div>`);
      expect(service.isTargetPage()).toBe(true);
    });

    it('UserName要素がなければfalseを返す', () => {
      setDocument(`<div>other content</div>`);
      expect(service.isTargetPage()).toBe(false);
    });
  });

  // innerText が \n で分割されるよう各行を <div> で包む（実際の X の DOM 構造に近い形）
  function userNameHtml(displayName: string, handle: string) {
    return `<div data-testid="UserName"><div>${displayName}</div><div>${handle}</div></div>`;
  }

  describe('extractData', () => {
    it('表示名とアカウント名を正しく抽出する', () => {
      setDocument(userNameHtml('Alice Smith', '@alice_smith'));
      const data = service.extractData();
      expect(data.displayName).toBe('Alice Smith');
      expect(data.accountName).toBe('alice_smith');
    });

    it('アンダースコア削除版を生成する', () => {
      setDocument(userNameHtml('Alice', '@al_ice'));
      const data = service.extractData();
      expect(data.accountNameRemoveUnderscore).toBe('alice');
    });

    it('アンダースコア→ハイフン版を生成する', () => {
      setDocument(userNameHtml('Alice', '@al_ice'));
      const data = service.extractData();
      expect(data.accountNameReplaceUnderscore).toBe('al-ice');
    });

    it('説明文から sizu.me のIDを抽出する', () => {
      setDocument(`
        ${userNameHtml('Alice', '@alice')}
        <div data-testid="UserDescription">
          しずかなインターネット: https://sizu.me/alice123
        </div>
      `);
      const data = service.extractData();
      expect(data.sizuHandleInDescription).toBe('alice123');
    });

    it('リンク欄から sizu.me のIDを抽出する', () => {
      setDocument(`
        ${userNameHtml('Alice', '@alice')}
        <div data-testid="UserUrl">sizu.me/alice456</div>
      `);
      const data = service.extractData();
      expect(data.sizuHandleInDescription).toBe('alice456');
    });

    it('@を取り除いてアカウント名を返す', () => {
      setDocument(userNameHtml('Alice', '@alice'));
      const data = service.extractData();
      expect(data.accountName).toBe('alice');
    });

    it('UserName要素がなければ空文字を返す', () => {
      setDocument(`<div>other</div>`);
      const data = service.extractData();
      expect(data.accountName).toBe('');
      expect(data.displayName).toBe('');
      expect(data.sizuHandleInDescription).toBe('');
    });
  });

  describe('hasSearchButton / removeSearchButton', () => {
    it('ボタンがなければfalseを返す', () => {
      expect(service.hasSearchButton()).toBe(false);
    });

    it('ボタンを追加後はtrueを返す', () => {
      const btn = document.createElement('button');
      btn.id = 'sizu-search-button';
      document.body.appendChild(btn);
      expect(service.hasSearchButton()).toBe(true);
    });

    it('removeSearchButton でボタンを削除できる', () => {
      const btn = document.createElement('button');
      btn.id = 'sizu-search-button';
      document.body.appendChild(btn);
      service.removeSearchButton();
      expect(service.hasSearchButton()).toBe(false);
    });
  });

  describe('mountSearchButton', () => {
    it('UserName要素の前にボタンを挿入する', () => {
      setDocument(`<div>${userNameHtml('Alice', '@alice')}</div>`);
      service.mountSearchButton({ clickAction: () => {} });
      expect(service.hasSearchButton()).toBe(true);
    });

    it('クリック時に extractData の結果で clickAction が呼ばれる', () => {
      setDocument(`<div>${userNameHtml('Alice', '@alice')}</div>`);
      let received: unknown = null;
      service.mountSearchButton({
        clickAction: (userData) => {
          received = userData;
        },
      });
      const button = document.getElementById('sizu-search-button') as HTMLButtonElement;
      button.click();
      expect((received as { accountName: string }).accountName).toBe('alice');
    });

    it('既存のボタンを置き換えて1つだけ存在する', () => {
      setDocument(`<div>${userNameHtml('Alice', '@alice')}</div>`);
      service.mountSearchButton({ clickAction: () => {} });
      service.mountSearchButton({ clickAction: () => {} });
      const buttons = document.querySelectorAll('#sizu-search-button');
      expect(buttons).toHaveLength(1);
    });
  });
});
