// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaTrash, FaTable, FaChair } from "react-icons/fa";

/**
 * 1m = PIXELS_PER_M px
 * Pan: Right-drag hoặc Space + Left-drag
 * Zoom: thanh trượt + Ctrl/Cmd + wheel
 * Item: fixed-size theo mét -> px
 * Khung polygon: kéo các đỉnh
 * Delete: Delete/Backspace hoặc nút thùng rác
 * Copy/Paste: Ctrl/Cmd + C/V (1 hoặc nhiều)
 * Input hỗ trợ dấu phẩy thập phân
 */

const PIXELS_PER_M = 50;

const parseNumber = (v) => {
  if (v === "" || v == null) return 0;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// point in polygon (ray casting)
const pointInPolygon = (pt, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > pt[1] !== yj > pt[1] &&
      pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export default function App() {
  // room & defaults in meters
  const [roomM, setRoomM] = useState({ w: 10, h: 6 });
  const [tableM, setTableM] = useState({ w: 1.2, h: 1.2 });
  const [chairM, setChairM] = useState({ w: 0.6, h: 0.6 });

  // derived px
  const roomPx = {
    w: Math.max(100, Math.round(roomM.w * PIXELS_PER_M)),
    h: Math.max(100, Math.round(roomM.h * PIXELS_PER_M)),
  };

  // pan / zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const spaceDownRef = useRef(false);

  // items [{ id, type, x,y,w,h }]
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ===== selection (multi) =====
  const [selectedIds, setSelectedIds] = useState([]); // array of ids
  const isSelected = (id) => selectedIds.includes(id);
  const clearSelection = () => setSelectedIds([]);
  const selectOnly = (id) => setSelectedIds([id]);
  const toggleInSelection = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // polygon frame
  const initFrame = [
    [0, 0],
    [roomPx.w, 0],
    [roomPx.w, roomPx.h],
    [0, roomPx.h],
  ];
  const [frame, setFrame] = useState(initFrame);
  useEffect(() => {
    setFrame(initFrame);
  }, [roomPx.w, roomPx.h]);

  // dragging items (single or group)
  const dragRef = useRef({
    active: false,
    ids: [], // ids being dragged
    sx: 0,
    sy: 0,
    origins: {}, // id -> {x,y}
  });

  // vertex dragging (polygon)
  const vertexDragRef = useRef({ idx: null });

  // marquee selection
  const [marquee, setMarquee] = useState(null);
  const marqueeRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    additive: false, // shift/ctrl meta pressed
  });

  // ===== keyboard =====
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space") spaceDownRef.current = true;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length) {
          setItems((prev) => prev.filter((it) => !selectedIds.includes(it.id)));
          setSelectedIds([]);
        }
      }

      // Copy (support multi)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (selectedIds.length) {
          const sel = itemsRef.current.filter((x) =>
            selectedIds.includes(x.id)
          );
          if (sel.length) {
            // anchor at min x,y to preserve relative offsets
            const minX = Math.min(...sel.map((s) => s.x));
            const minY = Math.min(...sel.map((s) => s.y));
            window._layoutClipboard = {
              type: "group",
              items: sel.map((s) => ({
                ...s,
                relX: s.x - minX,
                relY: s.y - minY,
              })),
            };
          }
        }
      }

      // Paste (offset +8 px)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        const cp = window._layoutClipboard;
        if (cp?.type === "group" && cp.items?.length) {
          const ids = [];
          const clones = cp.items.map((s) => {
            const id = Date.now() + Math.random();
            ids.push(id);
            const nx = Math.min(roomPx.w - s.w, s.relX + 8);
            const ny = Math.min(roomPx.h - s.h, s.relY + 8);
            const base = {
              id,
              type: s.type,
              x: Math.max(0, nx),
              y: Math.max(0, ny),
              w: s.w,
              h: s.h,
            };
            return base;
          });
          setItems((prev) => [...prev, ...clones]);
          setSelectedIds(ids);
        } else if (cp && cp.type !== "group") {
          const id = Date.now() + Math.random();
          const nx = Math.min(roomPx.w - cp.w, cp.x + 8);
          const ny = Math.min(roomPx.h - cp.h, cp.y + 8);
          setItems((prev) => [...prev, { ...cp, id, x: nx, y: ny }]);
          setSelectedIds([id]);
        }
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") spaceDownRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [selectedIds, roomPx.w, roomPx.h]);

  // ===== pan handlers =====
  const startPan = (clientX, clientY) => {
    panRef.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      origX: pan.x,
      origY: pan.y,
    };
    window.addEventListener("mousemove", panMove);
    window.addEventListener("mouseup", endPan);
  };
  const panMove = (e) => {
    if (!panRef.current.active) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    setPan({ x: panRef.current.origX + dx, y: panRef.current.origY + dy });
  };
  const endPan = () => {
    panRef.current.active = false;
    window.removeEventListener("mousemove", panMove);
    window.removeEventListener("mouseup", endPan);
  };

  // ===== item/group drag =====
  useEffect(() => {
    const onMove = (e) => {
      // move items
      if (dragRef.current.active) {
        const dx = (e.clientX - dragRef.current.sx) / zoom;
        const dy = (e.clientY - dragRef.current.sy) / zoom;
        const ids = dragRef.current.ids;
        const origins = dragRef.current.origins;

        setItems((prev) =>
          prev.map((it) => {
            if (!ids.includes(it.id)) return it;
            const o = origins[it.id];
            let nx = o.x + dx;
            let ny = o.y + dy;

            // clamp to room bounds
            nx = Math.max(0, Math.min(roomPx.w - it.w, nx));
            ny = Math.max(0, Math.min(roomPx.h - it.h, ny));

            // optional: polygon check (using a corner point)
            const checkPoint = [nx + 2, ny + 2];
            if (pointInPolygon(checkPoint, frame)) {
              return { ...it, x: nx, y: ny };
            }
            return { ...it, x: nx, y: ny };
          })
        );
      }

      // update marquee box
      if (marqueeRef.current.active) {
        const rect = canvasRef.current.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / zoom;
        const cy = (e.clientY - rect.top) / zoom;
        const x = Math.min(marqueeRef.current.startX, cx);
        const y = Math.min(marqueeRef.current.startY, cy);
        const w = Math.abs(cx - marqueeRef.current.startX);
        const h = Math.abs(cy - marqueeRef.current.startY);
        setMarquee({ x, y, w, h, additive: marqueeRef.current.additive });
      }
    };

    const onUp = () => {
      // end dragging
      if (dragRef.current.active) {
        dragRef.current.active = false;
        dragRef.current.ids = [];
      }

      // finalize marquee selection
      if (marqueeRef.current.active) {
        const m = marqueeRef.current;
        const box = marquee || {
          x: m.startX,
          y: m.startY,
          w: 0,
          h: 0,
          additive: m.additive,
        };

        const contains = (it) => {
          const cx = it.x + it.w / 2;
          const cy = it.y + it.h / 2;
          return (
            cx >= box.x &&
            cx <= box.x + box.w &&
            cy >= box.y &&
            cy <= box.y + box.h
          );
        };

        const idsInBox = itemsRef.current.filter(contains).map((i) => i.id);

        setSelectedIds((prev) => {
          if (box.additive) {
            // additive selection (Shift/Ctrl/Cmd)
            const set = new Set(prev);
            idsInBox.forEach((id) => set.add(id));
            return Array.from(set);
          }
          return idsInBox;
        });

        marqueeRef.current.active = false;
        setMarquee(null);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [zoom, frame, roomPx.w, roomPx.h, marquee]);

  // ===== vertex dragging (polygon) =====
  useEffect(() => {
    const onMove = (e) => {
      const idx = vertexDragRef.current.idx;
      if (idx == null) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / zoom;
      const cy = (e.clientY - rect.top) / zoom;
      const nx = Math.max(0, Math.min(roomPx.w, cx));
      const ny = Math.max(0, Math.min(roomPx.h, cy));
      setFrame((pts) => pts.map((p, i) => (i === idx ? [nx, ny] : p)));
    };
    const onUp = () => {
      vertexDragRef.current.idx = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [zoom, roomPx.w, roomPx.h]);

  // ===== canvas handlers =====
  const canvasRef = useRef(null);
  const onCanvasMouseDown = (e) => {
    if (e.button === 2 || (spaceDownRef.current && e.button === 0)) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);
      return;
    }
    // Left click on empty canvas => start marquee
    if (e.button === 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / zoom;
      const cy = (e.clientY - rect.top) / zoom;

      marqueeRef.current = {
        active: true,
        startX: cx,
        startY: cy,
        x: cx,
        y: cy,
        w: 0,
        h: 0,
        additive: e.shiftKey || e.ctrlKey || e.metaKey,
      };
      setMarquee({
        x: cx,
        y: cy,
        w: 0,
        h: 0,
        additive: marqueeRef.current.additive,
      });

      // nếu không giữ Shift/Ctrl/Cmd thì clear trước (trải nghiệm giống Figma)
      if (!(e.shiftKey || e.ctrlKey || e.metaKey)) {
        clearSelection();
      }
    }
  };
  const onCanvasContextMenu = (e) => e.preventDefault();

  // start dragging item (single or group)
  const startDragItem = (e, id) => {
    e.stopPropagation();
    if (spaceDownRef.current || e.button === 2) return;

    // Modify selection depending on modifier keys
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      toggleInSelection(id);
    } else if (!isSelected(id)) {
      selectOnly(id);
    }

    // Determine the group to drag (all selected)
    const ids = (isSelected(id) ? selectedIds : [id]).slice();
    const origins = {};
    const now = itemsRef.current;
    ids.forEach((sid) => {
      const it = now.find((x) => x.id === sid);
      if (it) origins[sid] = { x: it.x, y: it.y, w: it.w, h: it.h };
    });

    dragRef.current = {
      active: true,
      ids,
      sx: e.clientX,
      sy: e.clientY,
      origins,
    };
  };

  // add item
  const addItem = (type) => {
    const m = type === "table" ? tableM : chairM;
    const w = Math.max(8, Math.round(m.w * PIXELS_PER_M));
    const h = Math.max(8, Math.round(m.h * PIXELS_PER_M));
    const id = Date.now() + Math.random();
    const item = { id, type, x: 8, y: 8, w, h };
    setItems((p) => [...p, item]);
    setSelectedIds([id]);
  };

  // zoom via wheel
  useEffect(() => {
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const sign = Math.sign(e.deltaY);
        setZoom((z) => {
          const next = sign > 0 ? z - 0.05 : z + 0.05;
          return Math.max(0.2, Math.min(2.5, +next.toFixed(3)));
        });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const controlStyle = {
    padding: 8,
    marginBottom: 8,
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 340,
          padding: 16,
          borderRight: "1px solid #eee",
          background: "#fff",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 12 }}>Thiết lập (m)</h3>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 13 }}>
            Phòng (W × H)
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              style={controlStyle}
              value={roomM.w}
              onChange={(e) =>
                setRoomM((s) => ({ ...s, w: parseNumber(e.target.value) }))
              }
            />
            <input
              style={controlStyle}
              value={roomM.h}
              onChange={(e) =>
                setRoomM((s) => ({ ...s, h: parseNumber(e.target.value) }))
              }
            />
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            Diện tích:{" "}
            {(parseNumber(roomM.w) * parseNumber(roomM.h)).toFixed(2)} m² — tỉ
            lệ: 1m = {PIXELS_PER_M}px
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 13 }}>Bàn (W × H)</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              style={controlStyle}
              value={tableM.w}
              onChange={(e) =>
                setTableM((s) => ({ ...s, w: parseNumber(e.target.value) }))
              }
            />
            <input
              style={controlStyle}
              value={tableM.h}
              onChange={(e) =>
                setTableM((s) => ({ ...s, h: parseNumber(e.target.value) }))
              }
            />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 13 }}>Ghế (W × H)</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              style={controlStyle}
              value={chairM.w}
              onChange={(e) =>
                setChairM((s) => ({ ...s, w: parseNumber(e.target.value) }))
              }
            />
            <input
              style={controlStyle}
              value={chairM.h}
              onChange={(e) =>
                setChairM((s) => ({ ...s, h: parseNumber(e.target.value) }))
              }
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={() => addItem("table")}
            style={{
              flex: 1,
              padding: 10,
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            <FaTable /> &nbsp; Thêm Bàn
          </button>
          <button
            onClick={() => addItem("chair")}
            style={{
              flex: 1,
              padding: 10,
              background: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            <FaChair /> &nbsp; Thêm Ghế
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ display: "block", fontSize: 13 }}>Zoom</label>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <input
              type="range"
              min={0.3}
              max={2.5}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <div style={{ width: 56, textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Pan: giữ chuột phải + kéo, hoặc giữ <strong>Space</strong> + kéo
            trái.
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#444" }}>
          <div>• Click để chọn; Shift/Ctrl/Cmd + click để chọn nhiều.</div>
          <div>• Kéo trên nền để vẽ khung quét.</div>
          <div>• Kéo 1 item trong nhóm để kéo cả nhóm.</div>
          <div>• Delete để xoá nhiều; Ctrl/Cmd + C/V để copy/paste nhóm.</div>
          <div>• Kéo đỉnh màu xanh để chỉnh khung polygon.</div>
        </div>
      </aside>

      {/* Canvas zone */}
      <div
        style={{
          flex: 1,
          background: "#f3f4f6",
          overflow: "auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <div
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown}
          onContextMenu={onCanvasContextMenu}
          style={{
            margin: 20,
            width: roomPx.w,
            height: roomPx.h,
            background: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            position: "relative",
            userSelect: "none",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
              backgroundSize: `${PIXELS_PER_M}px ${PIXELS_PER_M}px, ${PIXELS_PER_M}px ${PIXELS_PER_M}px`,
              zIndex: 0,
            }}
          />

          {/* Room labels */}
          <div
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 11,
              color: "#111",
              background: "rgba(255,255,255,0.7)",
              padding: "1px 4px",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          >
            {(roomPx.w / PIXELS_PER_M).toFixed(2)} m
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: -30,
              transform: "translateY(-50%) rotate(-90deg)",
              transformOrigin: "center",
              fontSize: 11,
              color: "#111",
              background: "rgba(255,255,255,0.7)",
              padding: "1px 4px",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          >
            {(roomPx.h / PIXELS_PER_M).toFixed(2)} m
          </div>

          {/* Polygon */}
          <svg
            width={roomPx.w}
            height={roomPx.h}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <polygon
              points={frame.map((p) => p.join(",")).join(" ")}
              fill="rgba(59,130,246,0.06)"
              stroke="rgba(14,165,233,0.9)"
              strokeWidth={2}
            />
          </svg>

          {/* Polygon vertices */}
          {frame.map(([x, y], idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.stopPropagation();
                vertexDragRef.current.idx = idx;
              }}
              style={{
                position: "absolute",
                left: x - 6,
                top: y - 6,
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#10b981",
                border: "2px solid #065f46",
                cursor: "grab",
                zIndex: 5,
              }}
              title="Kéo để chỉnh khung"
            />
          ))}

          {/* Items */}
          <style>{`
            [data-item] .delete-btn { display: none !important; }
            [data-item] .area-badge { opacity: 0; transform: translate(-50%, -6px) scale(0.98); transition: opacity .12s, transform .12s; }
            [data-item]:hover .delete-btn { display: flex !important; }
            [data-item]:hover .area-badge { opacity: 1; transform: translate(-50%, -6px) scale(1); }
          `}</style>

          {items.map((it) => {
            const sel = isSelected(it.id);
            const areaM2 = (
              (it.w / PIXELS_PER_M) *
              (it.h / PIXELS_PER_M)
            ).toFixed(2);
            const sizeLabel = `${(it.w / PIXELS_PER_M).toFixed(2)}×${(
              it.h / PIXELS_PER_M
            ).toFixed(2)} m`;
            const autoFontPx = Math.max(
              6,
              Math.min(12, Math.floor(Math.min(it.w, it.h) * 0.14))
            );

            return (
              <div
                key={it.id}
                data-item
                onMouseDown={(e) => startDragItem(e, it.id)}
                onDoubleClick={() => selectOnly(it.id)}
                style={{
                  position: "absolute",
                  left: it.x,
                  top: it.y,
                  width: it.w,
                  height: it.h,
                  background: it.type === "table" ? "#4f46e5" : "#059669",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  cursor: "grab",
                  userSelect: "none",
                  boxShadow: sel ? "0 0 0 6px rgba(59,130,246,0.18)" : "none",
                  outline: sel ? "2px solid rgba(59,130,246,0.8)" : "none",
                }}
              >
                {/* Tooltip diện tích (hover) */}
                <div
                  className="area-badge"
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    fontSize: 10,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {areaM2} m²
                </div>

                {/* Nhãn W×H giữa item */}
                <div
                  style={{
                    fontSize: autoFontPx,
                    color: "#fff",
                    pointerEvents: "none",
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.1,
                    padding: "0 2px",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={sizeLabel}
                >
                  {sizeLabel}
                </div>

                {/* Nút xoá (hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems((prev) => prev.filter((x) => x.id !== it.id));
                    setSelectedIds((prev) => prev.filter((x) => x !== it.id));
                  }}
                  className="delete-btn"
                  title="Xoá"
                  style={{
                    position: "absolute",
                    right: 4,
                    top: 4,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    border: "none",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 20,
                  }}
                >
                  <FaTrash size={8} />
                </button>
              </div>
            );
          })}

          {/* Marquee selection overlay */}
          {marquee && (
            <div
              style={{
                position: "absolute",
                left: marquee.x,
                top: marquee.y,
                width: marquee.w,
                height: marquee.h,
                border: "1px dashed rgba(59,130,246,0.9)",
                background: "rgba(59,130,246,0.12)",
                pointerEvents: "none",
                zIndex: 50,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
