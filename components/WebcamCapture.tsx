
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './IconComponents';

interface WebcamCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Không thể truy cập webcam. Vui lòng kiểm tra quyền và thử lại.");
      }
    };

    enableWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50 p-4">
      <div className="relative w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-400">
            <p className="text-lg font-semibold">Lỗi Webcam</p>
            <p>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
        )}
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleCapture}
          disabled={!!error}
          className="group relative w-16 h-16 bg-white rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute w-full h-full rounded-full bg-white transition-transform transform group-hover:scale-110"></span>
          <CameraIcon className="w-8 h-8 text-green-600 z-10" />
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-500 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default WebcamCapture;
