import { SIZU_ME_DOMAIN } from '~lib/constants';
import type { XUserInfo } from '~lib/searchSizuUser';

const USER_NAME_SELECTOR = '[data-testid="UserName"]';
const SEARCH_BUTTON_ID = 'sizu-search-button';

export class XProfileService {
  isTargetPage(): boolean {
    return document.querySelector(USER_NAME_SELECTOR) !== null;
  }

  extractData(): XUserInfo {
    const userNameElement
      = document.querySelector<HTMLDivElement>(USER_NAME_SELECTOR);

    if (!userNameElement) {
      return {
        displayName: '',
        accountName: '',
        accountNameRemoveUnderscore: '',
        accountNameReplaceUnderscore: '',
        sizuHandleInDescription: '',
      };
    }

    const [displayName = '', accountName = ''] = userNameElement.innerText
      .split('\n')
      .map(text => text.trim().replaceAll('@', ''));

    const bioElement = document.querySelector(
      '[data-testid="UserDescription"]',
    );
    const bioText = bioElement?.textContent ?? '';
    const userUrl
      = document.querySelector('[data-testid=\'UserUrl\']')?.textContent
        ?? '';

    // プロフィール説明文やリンクから sizu.me のユーザーIDを抽出
    const sizuHandleInDescription
      = bioText.match(new RegExp(`${SIZU_ME_DOMAIN}/([^/\\s]+)`))?.[1]
        ?? userUrl.match(new RegExp(`${SIZU_ME_DOMAIN}/([^/\\s]+)`))?.[1]
        ?? '';

    return {
      displayName,
      accountName,
      accountNameRemoveUnderscore: accountName.replaceAll('_', ''),
      accountNameReplaceUnderscore: accountName.replaceAll('_', '-'),
      sizuHandleInDescription,
    };
  }

  hasSearchButton(): boolean {
    return document.getElementById(SEARCH_BUTTON_ID) !== null;
  }

  removeSearchButton(): void {
    document.getElementById(SEARCH_BUTTON_ID)?.remove();
  }

  createSearchButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = SEARCH_BUTTON_ID;
    button.textContent = 'しずかなインターネットを検索';

    const FONT
      = '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Hiragino Kaku Gothic ProN\', \'Hiragino Sans\', \'Noto Sans JP\', sans-serif';

    Object.assign(button.style, {
      padding: '3px 10px 4px',
      fontWeight: '500',
      width: 'fit-content',
      fontFamily: FONT,
      cursor: 'pointer',
      borderRadius: '9999px',
      background: '#fff',
      border: '1px solid #dde1e4',
      transition: 'border-color 0.15s, color 0.15s',
      fontSize: '12px',
      color: '#798184',
      marginBottom: '8px',
      letterSpacing: '0.01em',
    });
    button.onmouseover = () => {
      button.style.borderColor = '#a7abb1';
      button.style.color = 'rgba(3,10,18,0.87)';
    };
    button.onmouseout = () => {
      button.style.borderColor = '#dde1e4';
      button.style.color = '#798184';
    };

    return button;
  }

  mountSearchButton({
    clickAction,
  }: {
    clickAction: (userData: XUserInfo) => void;
  }): void {
    this.removeSearchButton();
    const button = this.createSearchButton();
    button.onclick = () => {
      const userData = this.extractData();
      clickAction(userData);
    };
    const userNameElement = document.querySelector(USER_NAME_SELECTOR);
    if (!userNameElement?.parentElement) return;
    userNameElement.parentElement.insertBefore(button, userNameElement);
  }
}
