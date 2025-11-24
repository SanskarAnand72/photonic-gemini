import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Download, Loader, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const VirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const productImageRef = useRef(null);
    const location = useLocation();
    const animationRef = useRef(null);

    const [cameraState, setCameraState] = useState('idle'); // idle, requesting, active, error
    const [error, setError] = useState(null);
    const [productData, setProductData] = useState(null);
    const [opacity, setOpacity] = useState(0.7);

    useEffect(() => {
        if (location.state?.product) {
            setProductData(location.state.product);
            console.log('Product data loaded:', location.state.product);
        } else {
            console.warn('No product data in location state');
        }
    }, [location]);

    const startCamera = async () => {
        console.log('Starting camera...');
        setCameraState('requesting');
        setError(null);

        try {
            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported in this browser');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            console.log('Camera stream obtained');

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                videoRef.current.onloadedmetadata = () => {
                    console.log('Video metadata loaded');
                    videoRef.current.play()
                        .then(() => {
                            console.log('Video playing');
                            setCameraState('active');
                            startOverlay();
                        })
                        .catch(err => {
                            console.error('Video play error:', err);
                            setError('Failed to start video playback');
                            setCameraState('error');
                        });
                };

                videoRef.current.onerror = (err) => {
                    console.error('Video error:', err);
                    setError('Video playback error');
                    setCameraState('error');
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError(err.message || 'Failed to access camera');
            setCameraState('error');
        }
    };

    useEffect(() => {
        if (productData) {
            startCamera();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    console.log('Camera track stopped');
                });
            }
        };
    }, [productData]);

    const startOverlay = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !productData || !productImageRef.current) {
            console.warn('Missing required elements for overlay');
            return;
        }

        console.log('Starting overlay rendering');
        const ctx = canvas.getContext('2d');

        const draw = () => {
            if (cameraState !== 'active') return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Simple centered overlay
            const prodW = canvas.width * 0.5;
            const prodH = prodW * 1.2;
            const prodX = (canvas.width - prodW) / 2;
            const prodY = canvas.height * 0.25;

            ctx.globalAlpha = opacity;
            try {
                ctx.drawImage(productImageRef.current, prodX, prodY, prodW, prodH);
            } catch (err) {
                console.error('Draw error:', err);
            }
            ctx.globalAlpha = 1.0;

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.warn('Cannot capture: missing video or canvas');
            return;
        }

        console.log('Capturing photo...');
        const final = document.createElement('canvas');
        final.width = videoRef.current.videoWidth;
        final.height = videoRef.current.videoHeight;
        const ctx = final.getContext('2d');

        // Draw mirrored video
        ctx.translate(final.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw overlay
        ctx.drawImage(canvasRef.current, 0, 0);

        final.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `virtual-tryon-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            console.log('Photo captured and downloaded');
        });
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {productData && (
                <img
                    ref={productImageRef}
                    src={productData.image}
                    alt="Product"
                    className="hidden"
                    crossOrigin="anonymous"
                    onLoad={() => console.log('Product image loaded')}
                    onError={(e) => console.error('Product image load error:', e)}
                />
            )}

            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <Link to="/" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-semibold">Virtual Try-On</h1>
                <button
                    onClick={capturePhoto}
                    disabled={cameraState !== 'active' || !productData}
                    className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Download className="w-6 h-6" />
                </button>
            </div>

            <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
                {cameraState === 'requesting' ? (
                    <div className="text-center p-6">
                        <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
                        <p className="text-gray-400">Starting camera...</p>
                        <p className="text-xs text-gray-500 mt-2">Please allow camera access</p>
                    </div>
                ) : cameraState === 'error' ? (
                    <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <p className="text-gray-400 mb-2">Camera Error</p>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={startCamera}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : !productData ? (
                    <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <p className="text-gray-400 mb-4">No product selected</p>
                        <Link to="/" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full inline-block transition-colors">
                            Back to Shop
                        </Link>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full transform scale-x-[-1]"
                        />
                    </>
                )}
            </div>

            {cameraState === 'active' && productData && (
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center gap-3">
                            <img src={productData.image} alt={productData.name} className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{productData.name}</p>
                                <p className="text-xs text-gray-400">{productData.price}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-gray-300">Product Opacity</label>
                                <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={opacity}
                                onChange={e => setOpacity(parseFloat(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                        </div>

                        <button
                            onClick={capturePhoto}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Camera className="w-5 h-5" />
                            Capture Photo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualTryOn;
