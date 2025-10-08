// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";

// === Nhập khóa VAPID public của bạn (base64url, không header/footer) ===
const VAPID_PUBLIC_KEY =
  "BOEohtvt_b2ArmaAUb0D2Ugk0tCJwq3J1fz83CTjMPzOc-znlUbLweDH95Isdt-rSvd4KlMhmIfFePztgvyVbQo";

// Helper: convert base64url -> Uint8Array cho pushManager.subscribe
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

export default function PWA() {
  const [online, setOnline] = useState(navigator.onLine);
  const [perm, setPerm] = useState(Notification.permission);
  const [sub, setSub] = useState(null);
  const [busy, setBusy] = useState(false);
  const subJson = useMemo(() => (sub ? JSON.stringify(sub, null, 2) : ""), [sub]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Lấy subscription hiện có nếu đã đăng ký trước đó
  useEffect(() => {
    (async () => {
      try {
        const reg = await navigator.serviceWorker?.ready;
        if (!reg) return;
        const existing = await reg.pushManager.getSubscription();
        if (existing) setSub(existing.toJSON());
      } catch {
        /* noop */
      }
    })();
  }, []);

  const requestPermission = async () => {
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p !== "granted") {
      alert("Bạn cần cho phép quyền thông báo để nhận push.");
    }
  };

  const subscribePush = async () => {
    try {
      setBusy(true);
      if (!("serviceWorker" in navigator)) {
        alert("Trình duyệt không hỗ trợ Service Worker.");
        return;
      }
      if (Notification.permission !== "granted") {
        await requestPermission();
        if (Notification.permission !== "granted") return;
      }
      const reg = await navigator.serviceWorker.ready;
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      setSub(newSub.toJSON());
      alert("Đăng ký push thành công! Bạn có thể copy subscription.");
    } catch (err) {
      console.error(err);
      alert("Đăng ký push thất bại. Kiểm tra HTTPS/localhost và VAPID key.");
    } finally {
      setBusy(false);
    }
  };

  const unsubscribePush = async () => {
    try {
      setBusy(true);
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        setSub(null);
        alert("Đã hủy đăng ký push.");
      } else {
        alert("Chưa có subscription nào.");
      }
    } catch (e) {
      console.error(e);
      alert("Không hủy được subscription.");
    } finally {
      setBusy(false);
    }
  };

  // Test thông báo tại chỗ (không cần backend/push)
  const localTestNotification = async () => {
    if (Notification.permission !== "granted") {
      await requestPermission();
      if (Notification.permission !== "granted") return;
    }
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Learning Hub", {
      body: "Đăng kí thành công gói 4 tiếng",
      icon: "/icon.png",
      badge: "/icon.png",
      data: "/",
    });
  };

  // (Tùy chọn) Gọi API backend để bắn push thật với subscription hiện tại
  const callServerPushTest = async () => {
    if (!sub) {
      alert("Chưa có subscription. Hãy bấm Đăng ký push trước.");
      return;
    }
    try {
      setBusy(true);
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub,
          title: "Push từ server 🎯",
          body: "Thông báo push thực (Web Push) đã đến!",
          url: "/",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Đã gọi server gửi push. Kiểm tra notification nhé!");
    } catch (e) {
      console.error(e);
      alert("Gọi server push thất bại. Bạn đã có endpoint /api/push/test chưa?");
    } finally {
      setBusy(false);
    }
  };

  const copySub = async () => {
    if (!subJson) return;
    try {
      await navigator.clipboard.writeText(subJson);
      alert("Đã copy subscription vào clipboard.");
    } catch {
      // fallback chọn text
      const ta = document.getElementById("sub-ta");
      if (ta) {
        ta.select();
        document.execCommand("copy");
        alert("Đã copy (fallback).");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-black text-gray-900 dark:text-gray-100">
      {/* Safe-area padding cho tai thỏ iOS */}
      <div className="pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] px-4">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-sky-600">Space Hub – PWA</h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] px-2 py-1 rounded-full ${
                  online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
                title="Trạng thái mạng"
              >
                {online ? "Online" : "Offline"}
              </span>
              <span
                className={`text-[11px] px-2 py-1 rounded-full ${
                  perm === "granted"
                    ? "bg-green-100 text-green-700"
                    : perm === "denied"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                title="Quyền thông báo"
              >
                {perm}
              </span>
            </div>
          </header>

          {/* Card chính */}
          <div className="rounded-2xl bg-white/85 dark:bg-gray-800/80 backdrop-blur shadow-xl p-4 sm:p-5">
            <p className="text-[15px] leading-6 text-gray-700 dark:text-gray-300 mb-4">
              Demo đăng ký <strong>Web Push</strong>, test thông báo local và gọi server push.
              Hãy chạy build/HTTPS hoặc <code>localhost</code> để Service Worker hoạt động chuẩn.
            </p>

            {/* Nút lớn tối ưu chạm (min-h-12 ~ 48px) */}
            <div className="grid gap-3">
              <button
                onClick={requestPermission}
                disabled={busy}
                className="w-full min-h-12 rounded-xl px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition disabled:opacity-60 active:scale-[.98]"
              >
                1) Xin quyền thông báo
              </button>

              <button
                onClick={subscribePush}
                disabled={busy}
                className="w-full min-h-12 rounded-xl px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold transition disabled:opacity-60 active:scale-[.98]"
              >
                2) Đăng ký push (VAPID)
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={localTestNotification}
                  className="min-h-12 rounded-xl px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition active:scale-[.98]"
                >
                  Test thông báo tại chỗ
                </button>
                <button
                  onClick={callServerPushTest}
                  className="min-h-12 rounded-xl px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold transition active:scale-[.98]"
                >
                  Gọi server push (POST /api/push/test)
                </button>
              </div>

              <button
                onClick={unsubscribePush}
                disabled={busy}
                className="w-full min-h-12 rounded-xl px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold transition disabled:opacity-60 active:scale-[.98]"
              >
                Hủy đăng ký push
              </button>
            </div>

            {/* Subscription accordion: gọn gàng trên mobile */}
            <section className="mt-5">
              <details className="group">
                <summary className="cursor-pointer select-none list-none">
                  <div className="flex items-center justify-between py-2">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Subscription</h2>
                    <span className="text-xs text-sky-600 group-open:rotate-180 transition">▼</span>
                  </div>
                </summary>
                <div className="mt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">JSON</span>
                    <button
                      onClick={copySub}
                      disabled={!subJson}
                      className="text-xs px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    id="sub-ta"
                    readOnly
                    spellCheck={false}
                    className="w-full text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-3 rounded-lg max-h-56 h-56 leading-5"
                    value={subJson || "// Chưa đăng ký push. Bấm 'Đăng ký push' để lấy subscription."}
                    onFocus={(e) => e.target.select()}
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                    Dùng JSON trên với <code>web-push</code> CLI để bắn thử Web Push từ máy bạn.
                  </p>
                </div>
              </details>
            </section>

            <footer className="mt-6 text-[11px] text-gray-500 dark:text-gray-400">
              Gợi ý test: <code>npm run build && npm run preview</code> → mở <code>http://localhost:4173</code>.
              iOS cần <em>Add to Home Screen</em> để nhận push ổn định (iOS ≥ 16.4).
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
