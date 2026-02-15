import { beforeEach, describe, expect, it, vi } from 'vitest';

// chrome.runtime.onMessage.addListener をモック
// background.ts のインポート前に定義する必要がある
const mockAddListener = vi.fn();
vi.stubGlobal('chrome', {
  runtime: {
    onMessage: {
      addListener: mockAddListener,
    },
  },
});

// fetch をモック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// background.ts をインポート（副作用として addListener が呼ばれる）
await import('./background');

/**
 * addListener に登録されたリスナー関数を取得する
 */
function getListener() {
  return mockAddListener.mock.calls[0][0] as (
    message: unknown,
    sender: unknown,
    sendResponse: (response: unknown) => void,
  ) => boolean | void;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('background message listener', () => {
  describe('CHECK_SIZU_USER メッセージ', () => {
    it('fetch が成功（200）なら { ok: true } を返す', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const sendResponse = vi.fn();
      const listener = getListener();
      listener({ type: 'CHECK_SIZU_USER', username: 'alice' }, {}, sendResponse);

      await vi.waitFor(() => {
        expect(sendResponse).toHaveBeenCalledWith({ ok: true });
      });
    });

    it('fetch が失敗（404）なら { ok: false } を返す', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      const sendResponse = vi.fn();
      const listener = getListener();
      listener({ type: 'CHECK_SIZU_USER', username: 'nobody' }, {}, sendResponse);

      await vi.waitFor(() => {
        expect(sendResponse).toHaveBeenCalledWith({ ok: false });
      });
    });

    it('fetch が例外を投げた場合も { ok: false } を返す', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      const sendResponse = vi.fn();
      const listener = getListener();
      listener({ type: 'CHECK_SIZU_USER', username: 'alice' }, {}, sendResponse);

      await vi.waitFor(() => {
        expect(sendResponse).toHaveBeenCalledWith({ ok: false });
      });
    });

    it('正しいURLで fetch を呼び出す', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const sendResponse = vi.fn();
      const listener = getListener();
      listener({ type: 'CHECK_SIZU_USER', username: 'alice' }, {}, sendResponse);

      await vi.waitFor(() => expect(sendResponse).toHaveBeenCalled());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://sizu.me/alice',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('非同期レスポンスのために true を返す', () => {
      mockFetch.mockResolvedValue({ ok: true });

      const listener = getListener();
      const result = listener(
        { type: 'CHECK_SIZU_USER', username: 'alice' },
        {},
        vi.fn(),
      );

      expect(result).toBe(true);
    });
  });

  describe('未知のメッセージタイプ', () => {
    it('CHECK_SIZU_USER 以外のメッセージでは fetch を呼ばない', () => {
      const sendResponse = vi.fn();
      const listener = getListener();
      listener({ type: 'UNKNOWN_TYPE' }, {}, sendResponse);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(sendResponse).not.toHaveBeenCalled();
    });
  });
});
