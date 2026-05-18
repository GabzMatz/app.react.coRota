import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 400;

interface PhotoCropModalProps {
  open: boolean;
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  open,
  imageSrc,
  onCancel,
  onConfirm,
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open || !imageSrc) {
      setReady(false);
      setLoadError(false);
      setBaseSize({ w: 0, h: 0 });
      return;
    }

    setScale(1);
    setOffset({ x: 0, y: 0 });
    setReady(false);
    setLoadError(false);
    setBaseSize({ w: 0, h: 0 });

    const img = new Image();
    const applyLoaded = (loaded: HTMLImageElement) => {
      const fitScale = Math.max(
        VIEWPORT_SIZE / loaded.naturalWidth,
        VIEWPORT_SIZE / loaded.naturalHeight
      );
      setBaseSize({
        w: loaded.naturalWidth * fitScale,
        h: loaded.naturalHeight * fitScale,
      });
      setReady(true);
    };
    img.onload = () => applyLoaded(img);
    img.onerror = () => {
      setLoadError(true);
      setReady(false);
    };
    img.src = imageSrc;
    if (img.complete && img.naturalWidth > 0) {
      applyLoaded(img);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [open, imageSrc]);

  const getDisplaySize = useCallback(
    (zoom: number) => ({
      w: baseSize.w * zoom,
      h: baseSize.h * zoom,
    }),
    [baseSize]
  );

  const clampOffset = useCallback(
    (next: { x: number; y: number }, zoom: number) => {
      if (!baseSize.w || !baseSize.h) return next;

      const { w: displayW, h: displayH } = getDisplaySize(zoom);
      const maxX = Math.max(0, (displayW - VIEWPORT_SIZE) / 2);
      const maxY = Math.max(0, (displayH - VIEWPORT_SIZE) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [baseSize, getDisplaySize]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setOffset(
      clampOffset(
        { x: dragStart.current.ox + dx, y: dragStart.current.oy + dy },
        scale
      )
    );
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleScaleChange = (delta: number) => {
    const nextScale = Math.min(3, Math.max(1, Number((scale + delta).toFixed(2))));
    setScale(nextScale);
    setOffset((prev) => clampOffset(prev, nextScale));
  };

  const exportCrop = () => {
    const img = imageRef.current;
    if (!img || !img.naturalWidth || !baseSize.w) return;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w: displayW, h: displayH } = getDisplaySize(scale);
    const topLeftX = VIEWPORT_SIZE / 2 - displayW / 2 + offset.x;
    const topLeftY = VIEWPORT_SIZE / 2 - displayH / 2 + offset.y;
    const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.save();
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, topLeftX * ratio, topLeftY * ratio, displayW * ratio, displayH * ratio);
    ctx.restore();

    onConfirm(canvas.toDataURL('image/jpeg', 0.88));
  };

  if (!open) {
    return null;
  }

  const { w: displayW, h: displayH } = getDisplaySize(scale);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-crop-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 id="photo-crop-title" className="text-lg font-semibold text-gray-900">
            Ajustar foto
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-4 pt-3 text-sm text-gray-600">
          Arraste para posicionar e use o zoom para enquadrar como ficará no perfil.
        </p>

        <div className="flex justify-center py-4">
          <div
            className="relative overflow-hidden rounded-full bg-gray-100 border-4 border-blue-500 touch-none cursor-grab active:cursor-grabbing"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {loadError ? (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-red-600">
                Não foi possível carregar a imagem. Tente outro arquivo (JPG ou PNG).
              </div>
            ) : (
              <>
                <img
                  key={imageSrc}
                  ref={imageRef}
                  src={imageSrc}
                  alt="Prévia para recorte"
                  className="absolute left-1/2 top-1/2 max-w-none select-none pointer-events-none"
                  style={{
                    width: ready ? displayW : 0,
                    height: ready ? displayH : 0,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                    visibility: ready ? 'visible' : 'hidden',
                  }}
                  draggable={false}
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleScaleChange(-0.15)}
            disabled={!ready}
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40"
            aria-label="Diminuir zoom"
          >
            <ZoomOut size={18} />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={scale}
            disabled={!ready}
            onChange={(e) => {
              const nextScale = Number(e.target.value);
              setScale(nextScale);
              setOffset((prev) => clampOffset(prev, nextScale));
            }}
            className="flex-1 accent-blue-600 disabled:opacity-40"
          />
          <button
            type="button"
            onClick={() => handleScaleChange(0.15)}
            disabled={!ready}
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40"
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={exportCrop}
            disabled={!ready}
            className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Usar esta foto
          </button>
        </div>
      </div>
    </div>
  );
};

