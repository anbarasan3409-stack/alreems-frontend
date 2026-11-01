'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Pen,
  Eraser,
  Trash2,
  Download,
  MousePointer,
} from 'lucide-react';

/**
 * Interactive Canvas Whiteboard
 * Synchronized live over Agora Data Streams
 */
const SimpleWhiteboard = ({ 
  roomUUID, 
  roomToken, 
  isHost, 
  onClose,
  onStroke,
  onClear,
  remoteStroke,
  clearTrigger,
  initialStrokes = []
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const strokesHistoryRef = useRef([...(initialStrokes || [])]);
  const isDrawingRef = useRef(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  const toolRef = useRef('pen');
  const colorRef = useRef('#000000');
  const widthRef = useRef(2);

  toolRef.current = currentTool;
  colorRef.current = currentColor;
  widthRef.current = lineWidth;

  // Replay all strokes onto given context & canvas
  const replayStrokes = useCallback((ctx, canvas, strokes) => {
    if (!ctx || !canvas || !strokes || strokes.length === 0) return;
    strokes.forEach((s) => {
      if (!s) return;
      if (s.a === 's') {
        ctx.beginPath();
        ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
        ctx.strokeStyle = s.c || '#000000';
        ctx.lineWidth = s.t === 'eraser' ? (s.w || 2) * 3 : (s.w || 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = s.t === 'eraser' ? 'destination-out' : 'source-over';
      } else if (s.a === 'd') {
        ctx.lineTo(s.x * canvas.width, s.y * canvas.height);
        ctx.stroke();
      } else if (s.a === 'e') {
        ctx.closePath();
      }
    });
  }, []);

  // Initialize canvas and handle resize + custom sync events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        if (width <= 0 || height <= 0) return;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        contextRef.current = ctx;

        if (strokesHistoryRef.current.length > 0) {
          replayStrokes(ctx, canvas, strokesHistoryRef.current);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Listen to real-time custom stroke events
    const handleRemoteStrokeEvent = (e) => {
      const s = e.detail;
      if (!s) return;
      strokesHistoryRef.current.push(s);

      const cvs = canvasRef.current;
      const ctx = contextRef.current;
      if (!cvs || !ctx) return;

      if (s.a === 's') {
        ctx.beginPath();
        ctx.moveTo(s.x * cvs.width, s.y * cvs.height);
        ctx.strokeStyle = s.c || '#000000';
        ctx.lineWidth = s.t === 'eraser' ? (s.w || 2) * 3 : (s.w || 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = s.t === 'eraser' ? 'destination-out' : 'source-over';
      } else if (s.a === 'd') {
        ctx.lineTo(s.x * cvs.width, s.y * cvs.height);
        ctx.stroke();
      } else if (s.a === 'e') {
        ctx.closePath();
      }
    };

    const handleClearEvent = () => {
      strokesHistoryRef.current = [];
      const cvs = canvasRef.current;
      const ctx = contextRef.current;
      if (cvs && ctx) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
      }
    };

    window.addEventListener('wb_stroke', handleRemoteStrokeEvent);
    window.addEventListener('wb_clear', handleClearEvent);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('wb_stroke', handleRemoteStrokeEvent);
      window.removeEventListener('wb_clear', handleClearEvent);
    };
  }, [replayStrokes]);

  // Update history if initialStrokes prop updates
  useEffect(() => {
    if (initialStrokes && initialStrokes.length > 0) {
      strokesHistoryRef.current = [...initialStrokes];
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        replayStrokes(ctx, canvas, strokesHistoryRef.current);
      }
    }
  }, [initialStrokes, replayStrokes]);

  // Compatibility listener for remoteStroke prop
  useEffect(() => {
    if (!remoteStroke) return;
    const s = remoteStroke;
    strokesHistoryRef.current.push(s);
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    if (s.a === 's') {
      ctx.beginPath();
      ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
      ctx.strokeStyle = s.c || '#000000';
      ctx.lineWidth = s.t === 'eraser' ? (s.w || 2) * 3 : (s.w || 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = s.t === 'eraser' ? 'destination-out' : 'source-over';
    } else if (s.a === 'd') {
      ctx.lineTo(s.x * canvas.width, s.y * canvas.height);
      ctx.stroke();
    } else if (s.a === 'e') {
      ctx.closePath();
    }
  }, [remoteStroke]);

  // Compatibility listener for clearTrigger prop
  useEffect(() => {
    if (clearTrigger) {
      strokesHistoryRef.current = [];
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [clearTrigger]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return null;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: canvas.width,
      height: canvas.height
    };
  };

  const startDrawing = (e) => {
    if (!isHost || toolRef.current === 'select') return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    const ctx = contextRef.current;
    if (!ctx) return;

    isDrawingRef.current = true;

    const { x, y, width, height } = coords;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = toolRef.current === 'eraser' ? widthRef.current * 3 : widthRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = toolRef.current === 'eraser' ? 'destination-out' : 'source-over';

    const normX = Number((x / width).toFixed(4));
    const normY = Number((y / height).toFixed(4));
    const strokeObj = { a: 's', x: normX, y: normY, c: colorRef.current, w: widthRef.current, t: toolRef.current };
    strokesHistoryRef.current.push(strokeObj);
    onStroke?.(strokeObj);
  };

  const draw = (e) => {
    if (!isHost || !isDrawingRef.current) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    const ctx = contextRef.current;
    if (!ctx) return;

    const { x, y, width, height } = coords;
    ctx.lineTo(x, y);
    ctx.stroke();

    const normX = Number((x / width).toFixed(4));
    const normY = Number((y / height).toFixed(4));
    const strokeObj = { a: 'd', x: normX, y: normY };
    strokesHistoryRef.current.push(strokeObj);
    onStroke?.(strokeObj);
  };

  const stopDrawing = () => {
    if (!isHost || !isDrawingRef.current) return;
    isDrawingRef.current = false;

    const ctx = contextRef.current;
    if (ctx) {
      ctx.closePath();
    }
    const strokeObj = { a: 'e' };
    strokesHistoryRef.current.push(strokeObj);
    onStroke?.(strokeObj);
  };

  const clearCanvas = () => {
    if (!isHost) return;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    strokesHistoryRef.current = [];
    onClear?.();
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#0000FF', // Blue
    '#00FF00', // Green
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">
            {isHost ? 'Interactive Whiteboard' : "Teacher's Whiteboard"}
          </h3>
          <span className="text-xs text-gray-500">
            {roomUUID ? `Room: ${roomUUID.substring(0, 8)}...` : 'Live'}
          </span>
          {!isHost && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Synced
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition font-medium"
        >
          {isHost ? 'Close' : 'Minimize'}
        </button>
      </div>

      {/* Toolbar (Only for Host) */}
      {isHost && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b flex-wrap">
          {/* Tools */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => setCurrentTool('select')}
              className={`p-2 rounded transition ${
                currentTool === 'select'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-200'
              }`}
              title="Select"
            >
              <MousePointer size={18} />
            </button>
            
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded transition ${
                currentTool === 'pen'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-200'
              }`}
              title="Pen"
            >
              <Pen size={18} />
            </button>

            <button
              onClick={() => setCurrentTool('eraser')}
              className={`p-2 rounded transition ${
                currentTool === 'eraser'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-200'
              }`}
              title="Eraser"
            >
              <Eraser size={18} />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border-r pr-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setCurrentColor(color);
                  setCurrentTool('pen');
                }}
                className={`w-6 h-6 rounded border-2 transition ${
                  currentColor === color && currentTool === 'pen' ? 'border-blue-500 scale-110 ring-2 ring-blue-300' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2 border-r pr-2">
            <label className="text-xs text-gray-600">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-gray-600 w-6">{lineWidth}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={clearCanvas}
              className="p-2 rounded bg-white hover:bg-gray-200 transition"
              title="Clear Canvas"
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={downloadCanvas}
              className="p-2 rounded bg-white hover:bg-gray-200 transition"
              title="Download"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Student View Header Bar */}
      {!isHost && (
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b text-xs text-gray-600">
          <span>Teacher is drawing live on this board</span>
          <button
            onClick={downloadCanvas}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition shadow-sm text-xs font-medium"
            title="Save Whiteboard Image"
          >
            <Download size={14} />
            <span>Save Image</span>
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-full ${
            !isHost ? 'cursor-default' : currentTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
          }`}
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Footer */}
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
        {isHost ? 'You can draw and edit' : 'Live view-only mode • Synced with instructor'}
      </div>
    </div>
  );
};

export default SimpleWhiteboard;
