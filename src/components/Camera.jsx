import { useState, useRef, useEffect } from 'react';

export function Camera({ onCapture, onClose }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Задняя камера на мобильных
          width: { ideal: 1920 },
          height: { ideal: 1440 }, // Формат 4:3
          aspectRatio: { ideal: 4 / 3 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Устанавливаем размеры canvas в формате 4:3
    const aspectRatio = 4 / 3;
    let width = video.videoWidth;
    let height = video.videoHeight;
    
    // Корректируем размеры для формата 4:3
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;

    // Вычисляем смещение для центрирования
    const sx = (video.videoWidth - width) / 2;
    const sy = (video.videoHeight - height) / 2;

    // Рисуем кадр из видео на canvas с обрезкой до 4:3
    context.drawImage(video, sx, sy, width, height, 0, 0, width, height);

    // Конвертируем в blob
    canvas.toBlob((blob) => {
      if (blob) {
        setIsLoading(true);
        onCapture(blob);
        stopCamera();
        setTimeout(() => setIsLoading(false), 1000);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="camera-overlay">
      <div className="camera-container">
        <div className="camera-header">
          <button className="btn-close" onClick={handleClose} aria-label="Закрыть">
            ✕
          </button>
          <h2>Сфотографируйте еду</h2>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={startCamera} className="btn-retry">
              Попробовать снова
            </button>
          </div>
        )}

        <div className="video-wrapper">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="camera-controls">
          <button
            className="btn-capture"
            onClick={capturePhoto}
            disabled={!stream || isLoading}
            aria-label="Сфотографировать"
          >
            {isLoading ? '⏳' : '📷'}
          </button>
        </div>
      </div>
    </div>
  );
}

