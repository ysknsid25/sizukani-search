import { beforeEach, describe, expect, it, vi } from "vitest"
import { searchSizuUser, type XUserInfo } from "./searchSizuUser"

// chrome.runtime.sendMessage をモック
const mockSendMessage = vi.fn()
vi.stubGlobal("chrome", {
  runtime: {
    sendMessage: mockSendMessage,
  },
})

const baseUserInfo: XUserInfo = {
  accountName: "",
  accountNameRemoveUnderscore: "",
  accountNameReplaceUnderscore: "",
  displayName: "",
  sizuHandleInDescription: "",
}

beforeEach(() => {
  mockSendMessage.mockReset()
  // デフォルトは存在しない
  mockSendMessage.mockResolvedValue({ ok: false })
})

describe("searchSizuUser", () => {
  describe("優先度1: 説明文にsizu.meのURLが記載されている場合", () => {
    it("説明文のIDが存在すればそのIDを返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "sizu-user" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        sizuHandleInDescription: "sizu-user",
      })
      expect(result?.username).toBe("sizu-user")
    })

    it("説明文のIDが存在しなければ次の候補に進む", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "alice" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "alice",
        accountNameRemoveUnderscore: "alice",
        accountNameReplaceUnderscore: "alice",
        sizuHandleInDescription: "not-exist",
      })
      expect(result?.username).toBe("alice")
    })
  })

  describe("優先度2: アカウント名のバリエーション", () => {
    it("accountName の小文字版が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "alice" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "Alice",
        accountNameRemoveUnderscore: "Alice",
        accountNameReplaceUnderscore: "Alice",
      })
      expect(result?.username).toBe("alice")
    })

    it("accountName の大文字版が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "ALICE" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "alice",
        accountNameRemoveUnderscore: "alice",
        accountNameReplaceUnderscore: "alice",
      })
      expect(result?.username).toBe("ALICE")
    })

    it("アンダースコア削除版が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "alicesmith" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "alice_smith",
        accountNameRemoveUnderscore: "alicesmith",
        accountNameReplaceUnderscore: "alice-smith",
      })
      expect(result?.username).toBe("alicesmith")
    })

    it("アンダースコア→ハイフン版が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "alice-smith" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "alice_smith",
        accountNameRemoveUnderscore: "alicesmith",
        accountNameReplaceUnderscore: "alice-smith",
      })
      expect(result?.username).toBe("alice-smith")
    })
  })

  describe("displayName が英数字のみの場合", () => {
    it("小文字版が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "alicesmith" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        displayName: "AliceSmith",
      })
      expect(result?.username).toBe("alicesmith")
    })

    it("大文字版が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "ALICESMITH" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        displayName: "AliceSmith",
      })
      expect(result?.username).toBe("ALICESMITH")
    })

    it("スペースを含む場合は対象外（検索しない）", async () => {
      const calls: string[] = []
      mockSendMessage.mockImplementation(({ username }) => {
        calls.push(username)
        return Promise.resolve({ ok: false })
      })
      await searchSizuUser({
        ...baseUserInfo,
        displayName: "Alice Smith", // スペースあり → 英数字のみではない
      })
      expect(calls).not.toContain("alice smith")
      expect(calls).not.toContain("ALICE SMITH")
    })
  })

  describe("_ で分割した各セグメント", () => {
    it("alice_smith を分割して alice が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "alice" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "alice_smith",
        accountNameRemoveUnderscore: "alicesmith",
        accountNameReplaceUnderscore: "alice-smith",
      })
      expect(result?.username).toBe("alice")
    })

    it("alice_smith を分割して SMITH が存在すれば返す", async () => {
      mockSendMessage.mockImplementation(({ username }) =>
        Promise.resolve({ ok: username === "SMITH" })
      )
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "alice_smith",
        accountNameRemoveUnderscore: "alicesmith",
        accountNameReplaceUnderscore: "alice-smith",
      })
      expect(result?.username).toBe("SMITH")
    })
  })

  describe("重複排除", () => {
    it("同じ候補には1回しかリクエストしない", async () => {
      const calls: string[] = []
      mockSendMessage.mockImplementation(({ username }) => {
        calls.push(username)
        return Promise.resolve({ ok: false })
      })
      await searchSizuUser({
        ...baseUserInfo,
        // accountName, RemoveUnderscore, ReplaceUnderscore がすべて同じ
        accountName: "alice",
        accountNameRemoveUnderscore: "alice",
        accountNameReplaceUnderscore: "alice",
      })
      const aliceCalls = calls.filter((u) => u === "alice")
      expect(aliceCalls).toHaveLength(1)
    })
  })

  describe("見つからない場合", () => {
    it("全候補が存在しなければ null を返す", async () => {
      const result = await searchSizuUser({
        ...baseUserInfo,
        accountName: "nobody",
        accountNameRemoveUnderscore: "nobody",
        accountNameReplaceUnderscore: "nobody",
      })
      expect(result).toBeNull()
    })
  })
})
