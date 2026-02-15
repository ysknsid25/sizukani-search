import { SIZU_ME_BASE_URL } from "./constants";

export type SizuUser = {
    username: string;
    profileUrl: string;
};

/**
 * バックグラウンドサービスワーカー経由で sizu.me のユーザー存在を確認する
 * コンテンツスクリプトから直接 fetch すると CORS に引っかかるため
 */
async function checkSizuUserExists(username: string): Promise<boolean> {
    if (!username) return false;
    try {
        const res = await chrome.runtime.sendMessage({
            type: "CHECK_SIZU_USER",
            username,
        });
        return res?.ok === true;
    } catch {
        return false;
    }
}

export type XUserInfo = {
    accountName: string;
    accountNameRemoveUnderscore: string;
    accountNameReplaceUnderscore: string;
    displayName: string;
    sizuHandleInDescription: string;
};

/**
 * XユーザーのIDからしずかなインターネットのアカウントを検索する
 * 以下の優先順でチェックする：
 * 1. プロフィール説明文に sizu.me のURLが記載されている場合
 * 2. アカウント名そのまま
 * 3. アンダースコア削除版
 * 4. アンダースコア→ハイフン置換版
 */
export async function searchSizuUser(
    userInfo: XUserInfo,
): Promise<SizuUser | null> {
    const candidates: string[] = [];

    // 優先度1: 説明文に直接 sizu.me のURLが記載されている
    if (userInfo.sizuHandleInDescription) {
        const exists = await checkSizuUserExists(
            userInfo.sizuHandleInDescription,
        );
        if (exists) {
            return {
                username: userInfo.sizuHandleInDescription,
                profileUrl: `${SIZU_ME_BASE_URL}/${userInfo.sizuHandleInDescription}`,
            };
        }
    }

    // 優先度2〜: アカウント名のバリエーション（重複を排除）
    const seen = new Set<string>();

    const addCandidate = (name: string) => {
        if (!name) return;
        const lower = name.toLowerCase();
        if (!seen.has(lower)) {
            seen.add(lower);
            candidates.push(lower);
        }
        const upper = name.toUpperCase();
        if (!seen.has(upper)) {
            seen.add(upper);
            candidates.push(upper);
        }
    };

    // 基本バリエーション（小文字 / 大文字）
    for (const candidate of [
        userInfo.accountName,
        userInfo.accountNameRemoveUnderscore,
        userInfo.accountNameReplaceUnderscore,
    ]) {
        addCandidate(candidate);
    }

    // displayName が英数字のみなら大文字・小文字で検索
    if (userInfo.displayName && /^[a-zA-Z0-9]+$/.test(userInfo.displayName)) {
        addCandidate(userInfo.displayName);
    }

    // _ で分割した各セグメントを大文字・小文字で検索
    for (const segment of userInfo.accountName.split("_")) {
        addCandidate(segment);
    }

    for (const username of candidates) {
        const exists = await checkSizuUserExists(username);
        if (exists) {
            return {
                username,
                profileUrl: `${SIZU_ME_BASE_URL}/${username}`,
            };
        }
    }

    return null;
}
