import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createOrResumeSession } from "../lib/session.js";

export default function CheckIn() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [search] = useSearchParams();
  const navigate = useNavigate();

  // Nếu QR có sẵn ?table=...
  useEffect(() => {
    const tableParam = search.get("table");
    const planParam = search.get("plan") || "4h";
    if (tableParam) {
      const sessionId = createOrResumeSession({ tableId: tableParam, plan: planParam });
      navigate(`/session?sid=${sessionId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let stream;
    let qrScanner;

    (async () => {
      try {
        const { default: QrScanner } = await import("qr-scanner");
        QrScanner.WORKER_PATH = undefined;

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            try {
              const parsed = parseTableFromQR(result?.data || result);
              const planParam =
                new URL(result?.data || "", window.location.origin)?.searchParams?.get("plan") || "4h";
              const sessionId = createOrResumeSession({ tableId: parsed, plan: planParam });
              navigate(`/session?sid=${sessionId}`);
            } catch (e) {
              setError("QR không hợp lệ. Bạn có thể nhập mã bàn thủ công.");
            }
            qrScanner?.stop();
            stream?.getTracks()?.forEach((t) => t.stop());
          },
          { preferredCamera: "environment" }
        );
        qrScanner.start();
      } catch (e) {
        console.error(e);
        setError("Không truy cập được camera. Hãy cấp quyền hoặc nhập mã bàn thủ công.");
      }
    })();

    return () => {
      stream?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const [manual, setManual] = useState("");
  const onManual = () => {
    if (!manual) return setError("Nhập mã bàn, ví dụ A01");
    const sid = createOrResumeSession({ tableId: manual.toUpperCase(), plan: "4h" });
    navigate(`/session?sid=${sid}`);
  };

  return (
    <main className="p-5">
      <h1 className="text-xl font-extrabold mb-3">Check-in bằng QR</h1>
      <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/70">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      </div>

      {error && (
        <p className="mt-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 border border-rose-200 dark:border-rose-800">
          {error}
        </p>
      )}

      <div className="mt-4">
        <label className="text-sm font-medium">Hoặc nhập mã bàn</label>
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-base"
            placeholder="VD: A01"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button
            onClick={onManual}
            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-base font-bold"
          >
            Bắt đầu
          </button>
        </div>
      </div>
    </main>
  );
}

function parseTableFromQR(raw) {
  // Hỗ trợ: "https://.../checkin?table=A01" | "TABLE:A01" | "A01"
  try {
    const url = new URL(raw);
    const t = url.searchParams.get("table");
    if (t) return t.toUpperCase();
  } catch (_) {}
  if (raw?.startsWith("TABLE:")) return raw.split(":")[1].trim().toUpperCase();
  if (/^[a-z]\\d{2}$/i.test(raw)) return raw.toUpperCase();
  throw new Error("invalid");
}
