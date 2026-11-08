import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  RefreshCw,
  Store,
  Tag,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  History,
  QrCode,
  MapPin,
  Flame,
} from 'lucide-react';
import { useQRScannerStore } from '../../store/qrScannerStore';
import { useCartStore } from '../../store/cartStore';
import { useNotificationStore } from '../../store/notificationStore';
import { SEED_STORES, SEED_OFFERS } from '../../data/seedData';

export const QRScannerModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    activeTab,
    result,
    redemptionToken,
    soundEnabled,
    history,
    closeScanner,
    setTab,
    processDecodedText,
    clearResult,
    generateRedemptionToken,
    markTokenRedeemed,
    toggleSound,
    clearHistory,
  } = useQRScannerStore();

  const { applyCoupon } = useCartStore();
  const { addNotification } = useNotificationStore();

  // Video & Canvas references for live camera stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Camera states
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // In-store redemption QR Data URL & countdown
  const [redemptionQrUrl, setRedemptionQrUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsScanningActive(false);
    setTorchOn(false);
  }, []);

  // Frame processing loop with jsQR
  const tickScanner = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tickScanner);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(tickScanner);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      // Recognized QR Code!
      stopCameraStream();
      const scan = processDecodedText(code.data);

      // Trigger confetti if coupon
      if (scan.type === 'coupon') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F97316', '#7C3AED', '#10B981'],
        });
      }
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tickScanner);
  }, [processDecodedText, stopCameraStream]);

  // Start camera stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by this browser. Use Demo Presets or Image Upload.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanningActive(true);
        animationFrameRef.current = requestAnimationFrame(tickScanner);
      }

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = (track as any).getCapabilities?.() || {};
      setHasTorch(Boolean(capabilities.torch));
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. You can still test with Demo QR Codes or upload an image.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can test with Demo QR Codes or upload an image.');
      } else {
        setCameraError('Unable to access camera in this environment. Use Demo Presets below.');
      }
    }
  }, [cameraFacing, stopCameraStream, tickScanner]);

  // Toggle flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Failed to toggle torch', err);
    }
  };

  // Flip camera between environment and user
  const flipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code && code.data) {
          const scan = processDecodedText(code.data);
          if (scan.type === 'coupon') {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#F97316', '#7C3AED', '#10B981'],
            });
          }
        } else {
          alert('No recognizable QR code found in the selected image. Please try another image or use Demo Presets.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Mount/Unmount effects
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !result) {
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, cameraFacing, result, startCameraStream, stopCameraStream]);

  // Generate dynamic QR Code for Cashier In-Store Redemption Token
  useEffect(() => {
    if (redemptionToken) {
      const payload = JSON.stringify({
        app: 'NearBuy',
        action: 'in_store_redemption',
        token: redemptionToken.token,
        coupon: redemptionToken.couponCode,
        pin: redemptionToken.pin,
        expires: redemptionToken.expiresAt,
      });

      QRCode.toDataURL(payload, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#171717',
          light: '#FFFFFF',
        },
      })
        .then((url) => setRedemptionQrUrl(url))
        .catch((err) => console.error('Failed to generate redemption QR', err));

      setSecondsRemaining(300);
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [redemptionToken]);

  if (!isOpen) return null;

  // Format countdown minutes:seconds
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Copy raw decoded content
  const handleCopyRaw = () => {
    if (!result?.raw) return;
    navigator.clipboard.writeText(result.raw);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Apply scanned coupon to shopping cart
  const handleApplyCouponToCart = () => {
    if (!result?.couponCode) return;
    const success = applyCoupon(result.couponCode);
    if (success) {
      addNotification(
        '🎟️ Coupon Applied to Bag',
        `${result.couponCode} applied successfully to your active order!`,
        'promo'
      );
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#10B981', '#3B82F6'],
      });
    }
  };

  // Initiate In-Store Cashier Redemption Screen
  const handleRedeemInStore = () => {
    if (!result?.couponCode) return;
    generateRedemptionToken(result.couponCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Main Scanner Container (Optimized for Mobile & Desktop) */}
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800/80 bg-stone-950/70 text-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">NearBuy QR Scanner</h3>
              <p className="text-[11px] text-stone-400">Stores • Aisle Catalogs • Digital Coupons</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Feedback Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={soundEnabled ? 'Mute scanner chime' : 'Enable scanner chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                stopCameraStream();
                closeScanner();
              }}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Selection Tabs (Camera, Upload, Instant Demo, History) */}
        {!result && (
          <div className="flex items-center justify-around px-3 py-2 bg-stone-950/50 border-b border-stone-800/60 text-xs font-semibold text-stone-400 shrink-0">
            <button
              onClick={() => {
                setTab('camera');
                clearResult();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'camera'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'hover:text-stone-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-stone-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload QR</span>
            </button>

            <button
              onClick={() => setTab('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'demo'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Demo Presets</span>
            </button>

            <button
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'upload'
                  ? 'bg-stone-800 text-white'
                  : 'hover:text-stone-200'
              }`}
              title="Recent Scan History"
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({history.length})</span>
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto relative flex flex-col">
          {/* 1. SCANNED RESULT OVERLAY VIEW */}
          {result ? (
            <div className="p-5 space-y-4 bg-stone-900 text-stone-100 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
              {/* Cashier In-Store Redemption State */}
              {redemptionToken ? (
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>In-Store Cashier Token Active</span>
                  </div>

                  <h4 className="text-lg font-extrabold text-white">
                    {result.couponCode} Verified
                  </h4>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    Present this dynamic verification code to the cashier at checkout counter.
                  </p>

                  {/* QR Barcode */}
                  <div className="p-4 bg-white rounded-2xl w-60 h-60 mx-auto shadow-xl flex items-center justify-center border-4 border-stone-800 relative">
                    {redemptionQrUrl ? (
                      <img
                        src={redemptionQrUrl}
                        alt="Cashier Redemption QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-stone-400 text-xs animate-pulse">Generating Barcode...</div>
                    )}
                  </div>

                  {/* Security PIN and Expiry Countdown */}
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Cashier PIN</div>
                      <div className="text-xl font-black text-orange-400 font-mono tracking-widest mt-0.5">
                        {redemptionToken.pin}
                      </div>
                    </div>
                    <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Valid Remaining</div>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>{formatTimer(secondsRemaining)}</span>
                      </div>
                    </div>
                  </div>

                  {redemptionToken.status === 'redeemed' ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Discount verified by cashier & printed on bill!</span>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => {
                          markTokenRedeemed();
                          confetti({
                            particleCount: 100,
                            spread: 80,
                            origin: { y: 0.6 },
                            colors: ['#10B981', '#F59E0B', '#3B82F6'],
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simulate Cashier Verification (Counter Demo)</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => useQRScannerStore.getState().clearResult()}
                    className="text-xs text-stone-400 hover:text-stone-200 underline pt-1"
                  >
                    Scan Another QR Code
                  </button>
                </div>
              ) : (
                /* Standard Scan Results (Store / Coupon / Product) */
                <div className="space-y-4">
                  {/* Category Pill */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        result.type === 'store'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : result.type === 'coupon'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {result.type === 'store' ? (
                        <>
                          <Store className="w-3.5 h-3.5" />
                          <span>Store Detected</span>
                        </>
                      ) : result.type === 'coupon' ? (
                        <>
                          <Tag className="w-3.5 h-3.5" />
                          <span>Digital Coupon Found</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Payload</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{result.scannedAt}</span>
                    </span>
                  </div>

                  {/* Card Showcase */}
                  {result.type === 'store' && (
                    <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-3">
                      {result.metadata?.image && (
                        <div className="w-full h-32 rounded-xl overflow-hidden relative">
                          <img
                            src={result.metadata.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-3 text-white">
                            <div className="text-base font-extrabold">{result.title}</div>
                            <div className="text-xs text-stone-300">{result.description}</div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-300 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="truncate">{result.metadata?.address || 'Indiranagar, Bangalore'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{result.metadata?.deliveryTimeMin || 20} min delivery</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 leading-relaxed">
                        Physical store QR code verified. You can explore this merchant&apos;s real-time aisle catalog, order online for delivery or prepare an in-store pickup bag.
                      </p>
                    </div>
                  )}

                  {result.type === 'coupon' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-stone-900 border border-purple-500/30 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                            Verified Local Voucher
                          </div>
                          <div className="text-2xl font-black text-white mt-1">
                            {result.couponCode}
                          </div>
                          <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                            {result.discountSummary || 'Special Neighborhood Savings'}
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                          <Flame className="w-6 h-6 text-orange-400" />
                        </div>
                      </div>

                      <p className="text-xs text-stone-300">
                        {result.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1 border-t border-purple-900/40">
                        <span>Min Order: ₹{result.metadata?.minOrderValue || 299}</span>
                        <span>•</span>
                        <span>Valid till: {result.metadata?.validUntil || '2026-12-31'}</span>
                      </div>
                    </div>
                  )}

                  {result.type === 'external' && (
                    <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
                      <div className="text-xs font-semibold text-stone-300">Decoded Content:</div>
                      <div className="p-2.5 rounded-xl bg-stone-950 font-mono text-xs text-stone-300 break-all select-all">
                        {result.raw}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    {result.type === 'store' && result.storeId && (
                      <button
                        onClick={() => {
                          const storeId = result.storeId;
                          stopCameraStream();
                          closeScanner();
                          navigate(`/stores/${storeId}`);
                        }}
                        className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <span>Open Store Profile & Shop Aisle</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {result.type === 'coupon' && (
                      <>
                        <button
                          onClick={handleApplyCouponToCart}
                          className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Apply to NearBuy Bag</span>
                        </button>

                        <button
                          onClick={handleRedeemInStore}
                          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Redeem In-Store at Physical Cashier</span>
                        </button>
                      </>
                    )}

                    {/* Copy Raw / Link button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleCopyRaw}
                        className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRaw ? 'Copied!' : 'Copy Code'}</span>
                      </button>

                      <button
                        onClick={() => {
                          clearResult();
                          startCameraStream();
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Scan Another</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 2. CAMERA VIEWFINDER & TABS */
            <>
              {activeTab === 'camera' && (
                <div className="relative flex-1 min-h-[360px] bg-black flex items-center justify-center overflow-hidden">
                  {/* Live Video Element */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {/* Hidden Canvas for Frame Processing */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Dark Mask with Centered Cutout Target Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-dashed border-white/40 rounded-3xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                      {/* 4 Corner Reticle Accents */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />

                      {/* Sweeping Laser Line Animation */}
                      {isScanningActive && (
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] animate-[scanLaser_2.4s_ease-in-out_infinite]" />
                      )}

                      {/* Inner Target Hint */}
                      <div className="absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold text-white/80 bg-black/40 backdrop-blur-xs py-1 px-3 mx-4 rounded-full">
                        Point camera at Store or Coupon QR
                      </div>
                    </div>
                  </div>

                  {/* Camera Controls Floating Bar */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                    {hasTorch ? (
                      <button
                        onClick={toggleTorch}
                        className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                          torchOn ? 'bg-amber-400 text-stone-900 shadow-lg' : 'bg-black/50 text-white hover:bg-black/70'
                        }`}
                        title="Toggle Flashlight"
                      >
                        {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    ) : <div />}

                    <button
                      onClick={flipCamera}
                      className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                      title="Switch Front / Back Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fallback Error Banner if Camera is Blocked */}
                  {cameraError && (
                    <div className="absolute inset-4 m-auto max-w-xs h-fit p-4 rounded-2xl bg-stone-900/95 border border-stone-700 text-center space-y-3 z-20 shadow-2xl">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-white">Camera Access Notice</div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">{cameraError}</p>
                      <button
                        onClick={() => setTab('demo')}
                        className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
                      >
                        Try Demo QR Codes (Instant)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. DEMO QR PRESETS DRAWER */}
              {activeTab === 'demo' && (
                <div className="p-4 space-y-3 bg-stone-900 flex-1">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Instant Simulator Presets
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Test scanning without physical camera or stickers.
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
                      One Tap
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Physical Stores</div>
                    
                    {/* Store 1 */}
                    <button
                      onClick={() => processDecodedText('nearbuy://store/store_1')}
                      className="w-full p-2.5 rounded-2xl bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-between text-left group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          🌿
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                            Green Basket Organic (Indiranagar)
                          </div>
                          <div className="text-[10px] text-stone-400">Fresh organic fruits, sourdough & dairy</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Store 3 */}
                    <button
                      onClick={() => processDecodedText('nearbuy://store/store_3')}
                      className="w-full p-2.5 rounded-2xl bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-between text-left group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          🥖
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                            The Daily Loaf Bakery (100ft Road)
                          </div>
                          <div className="text-[10px] text-stone-400">Croissants, sourdough & specialty coffee</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Store 4 */}
                    <button
                      onClick={() => processDecodedText('nearbuy://store/store_4')}
                      className="w-full p-2.5 rounded-2xl bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-between text-left group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          🎧
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                            Apex Mobiles & Audio (Gadget Hub)
                          </div>
                          <div className="text-[10px] text-stone-400">Headphones, cables & fast chargers</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Digital & In-Store Vouchers</div>

                    {/* Coupon: INSTORE25 */}
                    <button
                      onClick={() => processDecodedText('coupon:INSTORE25')}
                      className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-stone-800 hover:from-purple-950/70 border border-purple-800/40 flex items-center justify-between text-left group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                          🎟️
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                            INSTORE25 — 25% Physical Cashier Voucher
                          </div>
                          <div className="text-[10px] text-stone-400">Generates cashier counter token & PIN</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Coupon: NEARBUY50 */}
                    <button
                      onClick={() => processDecodedText('coupon:NEARBUY50')}
                      className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-orange-950/40 to-stone-800 hover:from-orange-950/70 border border-orange-800/40 flex items-center justify-between text-left group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                          🏷️
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                            NEARBUY50 — Flat ₹50 OFF Coupon
                          </div>
                          <div className="text-[10px] text-stone-400">Valid on all local orders over ₹299</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-orange-300 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              )}

              {/* 4. SCAN HISTORY TAB */}
              {activeTab === 'upload' && (
                <div className="p-4 space-y-3 bg-stone-900 flex-1">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent QR Scans
                    </h4>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-[11px] text-stone-400 hover:text-stone-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 space-y-2">
                      <QrCode className="w-8 h-8 mx-auto text-stone-600" />
                      <div className="text-xs font-semibold">No recent scans yet</div>
                      <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                        Point the camera at any store entrance barcode or promotional flyer.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {history.map((h, i) => (
                        <div
                          key={i}
                          onClick={() => processDecodedText(h.raw)}
                          className="p-2.5 rounded-2xl bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-between cursor-pointer group transition-all"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                              {h.title}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate max-w-[220px]">
                              {h.description}
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-400">{h.scannedAt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-5 py-3 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-stone-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hyperlocal QR Engine Active</span>
          </div>
          <span className="text-stone-500">Bangalore Neighborhood Grid</span>
        </div>
      </div>
    </div>
  );
};
