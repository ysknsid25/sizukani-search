import type { PlasmoCSConfig } from 'plasmo';
import { useEffect, useRef, useState } from 'react';
import {
  searchSizuUser,
  type SizuUser,
  type XUserInfo,
} from '~lib/searchSizuUser';
import { XProfileService } from '~services/xProfileService';

export const config: PlasmoCSConfig = {
  matches: ['https://twitter.com/*', 'https://x.com/*'],
  all_frames: true,
};

const FONT
  = '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Hiragino Kaku Gothic ProN\', \'Hiragino Sans\', \'Noto Sans JP\', sans-serif';

const profileService = new XProfileService();

const Profile = () => {
  const [result, setResult] = useState<SizuUser | null | 'not_found'>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = async (userData: XUserInfo) => {
    setResult(null);
    setLoading(true);
    const found = await searchSizuUser(userData);
    setResult(found ?? 'not_found');
    setLoading(false);
  };

  const checkAndMount = () => {
    if (
      profileService.isTargetPage()
      && !profileService.hasSearchButton()
    ) {
      profileService.mountSearchButton({ clickAction: handleSearch });
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(checkAndMount, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    checkAndMount();
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (result === null && !loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        background: '#fff',
        border: '1px solid #ebeef2',
        borderRadius: '14px',
        padding: '18px 20px 16px',
        boxShadow:
                    '0 4px 24px -4px rgba(3,10,18,0.08), 0 0 0 1px rgba(3,10,18,0.03)',
        minWidth: '240px',
        maxWidth: '300px',
        fontFamily: FONT,
        fontSize: '14px',
        color: 'rgba(3,10,18,0.87)',
        lineHeight: '1.6',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#a7abb1',
            letterSpacing: '0.02em',
          }}
        >
          しずかなインターネット
        </span>
        <button
          onClick={() => setResult(null)}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#babec5',
            lineHeight: 1,
            padding: '0 2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {loading && (
        <div style={{ color: '#a7abb1', fontSize: '13px' }}>
          検索中...
        </div>
      )}

      {!loading && result !== null && result !== 'not_found' && (
        <div>
          <div
            style={{
              fontSize: '12px',
              color: '#8d9298',
              marginBottom: '8px',
            }}
          >
            アカウントが見つかりました
          </div>
          <a
            href={result.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              color: '#3b82f6',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: '15px',
              borderBottom: '1px dotted #a7abb1',
              paddingBottom: '1px',
              transition: 'color 0.15s',
            }}
            onMouseOver={(e) => {
              (e.target as HTMLAnchorElement).style.color
                = 'rgba(3,10,18,0.87)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLAnchorElement).style.color
                = '#3b82f6';
            }}
          >
            @{result.username}
          </a>
        </div>
      )}

      {!loading && result === 'not_found' && (
        <div style={{ color: '#a7abb1', fontSize: '13px' }}>
          アカウントが見つかりませんでした
        </div>
      )}
    </div>
  );
};

export default Profile;
