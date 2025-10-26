
import React, { useState, useCallback, ChangeEvent } from 'react';
import { FruitAnalysis } from './types';
import { analyzeFruitImage } from './services/geminiService';
import { UploadIcon, CameraIcon, BackIcon, LeafIcon } from './components/IconComponents';
import Spinner from './components/Spinner';
import ResultCard from './components/ResultCard';
import WebcamCapture from './components/WebcamCapture';

type View = 'start' | 'analysis' | 'webcam';

const App: React.FC = () => {
  const [view, setView] = useState<View>('start');
  const [image, setImage] = useState<{ src: string; file: File | null }>({ src: '', file: null });
  const [analysisResult, setAnalysisResult] = useState<FruitAnalysis[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn một tệp hình ảnh hợp lệ.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ src: reader.result as string, file });
        setView('analysis');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamCapture = (imageDataUrl: string) => {
    setImage({ src: imageDataUrl, file: null });
    setView('analysis');
  };

  const handleAnalyze = useCallback(async () => {
    if (!image.src) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Data = image.src.split(',')[1];
      let mimeType = 'image/jpeg'; // Mặc định cho ảnh từ webcam
      if (image.file) {
          mimeType = image.file.type;
      } else {
         const mimeMatch = image.src.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
         if (mimeMatch && mimeMatch[1]) {
            mimeType = mimeMatch[1];
         }
      }

      const result = await analyzeFruitImage(base64Data, mimeType);
      setAnalysisResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [image]);

  const reset = () => {
    setView('start');
    setImage({ src: '', file: null });
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  const renderStartView = () => (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <LeafIcon className="w-20 h-20 text-green-500 mx-auto" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mt-4">Trình Kiểm Tra Trái Cây Bằng AI</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Nhận phân tích tức thì về tình trạng trái cây của bạn. Nó chín, tươi hay đã hỏng? Hãy để AI của chúng tôi cho bạn biết.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <label className="flex-1 cursor-pointer bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 text-lg">
          <UploadIcon className="w-6 h-6" />
          <span>Tải Ảnh Lên</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <button
          onClick={() => setView('webcam')}
          className="flex-1 bg-gray-700 text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
        >
          <CameraIcon className="w-6 h-6" />
          <span>Dùng Webcam</span>
        </button>
      </div>
    </div>
  );

  const renderAnalysisView = () => (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
            <button onClick={reset} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold">
                <BackIcon className="w-5 h-5" />
                <span>Làm Lại Từ Đầu</span>
            </button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
                <div className="w-full max-w-sm bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <img src={image.src} alt="Trái cây cần phân tích" className="w-full h-auto object-cover" />
                </div>
                {!analysisResult && !isLoading && (
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="mt-6 w-full max-w-sm bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400"
                    >
                        Phân Tích Trái Cây
                    </button>
                )}
            </div>
            <div className="flex flex-col items-center justify-start h-full space-y-4">
                {isLoading && <Spinner />}
                {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg w-full">{error}</div>}
                {analysisResult && (
                    analysisResult.length > 0 ? (
                        <div className="w-full space-y-4">
                            {analysisResult.map((result, index) => (
                                <ResultCard key={index} result={result} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 bg-gray-100 p-4 rounded-lg w-full max-w-md">
                            Không phát hiện thấy trái cây nào trong ảnh.
                        </div>
                    )
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-5xl">
        {view === 'start' && renderStartView()}
        {view === 'analysis' && renderAnalysisView()}
      </main>
      {view === 'webcam' && <WebcamCapture onCapture={handleWebcamCapture} onClose={() => setView('start')} />}
    </div>
  );
};

export default App;
