// @vitest-environment happy-dom
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Profile from './profile';

// vi.mock は巻き上げられるため、参照する変数は vi.hoisted で定義する
const { mockIsTargetPage, mockHasSearchButton, mockMountSearchButton }
  = vi.hoisted(() => ({
    mockIsTargetPage: vi.fn().mockReturnValue(true),
    mockHasSearchButton: vi.fn().mockReturnValue(false),
    mockMountSearchButton: vi.fn(),
  }));

vi.mock('~lib/searchSizuUser', () => ({
  searchSizuUser: vi.fn(),
}));

vi.mock('~services/xProfileService', () => ({
  XProfileService: class {
    isTargetPage = mockIsTargetPage;
    hasSearchButton = mockHasSearchButton;
    mountSearchButton = mockMountSearchButton;
  },
}));

import { searchSizuUser } from '~lib/searchSizuUser';

const mockSearchSizuUser = vi.mocked(searchSizuUser);

beforeEach(() => {
  vi.clearAllMocks();
  mockIsTargetPage.mockReturnValue(true);
  mockHasSearchButton.mockReturnValue(false);
});

describe('Profile コンポーネント', () => {
  describe('初期状態', () => {
    it('何も表示されない', () => {
      render(<Profile />);
      expect(screen.queryByText('しずかなインターネット')).not.toBeInTheDocument();
    });
  });

  describe('検索中', () => {
    it('「検索中...」を表示する', async () => {
      // 解決しないPromiseで検索中状態を維持
      mockSearchSizuUser.mockReturnValue(new Promise(() => {}));

      render(<Profile />);

      // mountSearchButton に渡された clickAction を手動で呼び出す
      const { clickAction } = mockMountSearchButton.mock.calls[0][0];
      act(() => {
        clickAction({
          accountName: 'alice',
          accountNameRemoveUnderscore: 'alice',
          accountNameReplaceUnderscore: 'alice',
          displayName: 'Alice',
          sizuHandleInDescription: '',
        });
      });

      expect(await screen.findByText('検索中...')).toBeInTheDocument();
    });
  });

  describe('検索結果: 見つかった場合', () => {
    it('アカウント名とプロフィールリンクを表示する', async () => {
      mockSearchSizuUser.mockResolvedValue({
        username: 'alice',
        profileUrl: 'https://sizu.me/alice',
      });

      render(<Profile />);

      const { clickAction } = mockMountSearchButton.mock.calls[0][0];
      act(() => {
        clickAction({
          accountName: 'alice',
          accountNameRemoveUnderscore: 'alice',
          accountNameReplaceUnderscore: 'alice',
          displayName: 'Alice',
          sizuHandleInDescription: '',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('アカウントが見つかりました')).toBeInTheDocument();
      });
      expect(screen.getByText('@alice')).toBeInTheDocument();
      const link = screen.getByRole('link', { name: '@alice' });
      expect(link).toHaveAttribute('href', 'https://sizu.me/alice');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('検索結果: 見つからなかった場合', () => {
    it('「アカウントが見つかりませんでした」を表示する', async () => {
      mockSearchSizuUser.mockResolvedValue(null);

      render(<Profile />);

      const { clickAction } = mockMountSearchButton.mock.calls[0][0];
      act(() => {
        clickAction({
          accountName: 'nobody',
          accountNameRemoveUnderscore: 'nobody',
          accountNameReplaceUnderscore: 'nobody',
          displayName: 'Nobody',
          sizuHandleInDescription: '',
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText('アカウントが見つかりませんでした'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('閉じるボタン', () => {
    it('✕ を押すと結果パネルが消える', async () => {
      mockSearchSizuUser.mockResolvedValue(null);

      render(<Profile />);

      const { clickAction } = mockMountSearchButton.mock.calls[0][0];
      act(() => {
        clickAction({
          accountName: 'nobody',
          accountNameRemoveUnderscore: 'nobody',
          accountNameReplaceUnderscore: 'nobody',
          displayName: 'Nobody',
          sizuHandleInDescription: '',
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText('アカウントが見つかりませんでした'),
        ).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('✕'));

      expect(
        screen.queryByText('アカウントが見つかりませんでした'),
      ).not.toBeInTheDocument();
    });
  });
});
