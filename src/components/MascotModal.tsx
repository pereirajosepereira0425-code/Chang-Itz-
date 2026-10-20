import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Check, RotateCcw, Download, Heart } from 'lucide-react';

interface MascotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMascotChange?: () => void;
}

export const MascotModal: React.FC<MascotModalProps> = ({ isOpen, onClose, onMascotChange }) => {
  const [activeSkin, setActiveSkin] = useState<string>(() => {
    return localStorage.getItem('chang_itz_mascot_skin') || 'flipaclip';
  });
  const [customImage, setCustomImage] = useState<string | null>(() => {
    return localStorage.getItem('chang_itz_custom_mascot_image') || null;
  });
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomImage(dataUrl);
        localStorage.setItem('chang_itz_custom_mascot_image', dataUrl);
        localStorage.setItem('chang_itz_mascot_skin', 'custom');
        setActiveSkin('custom');
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        // Dispatch storage event so other components update immediately
        window.dispatchEvent(new Event('chang_itz_mascot_updated'));
        if (onMascotChange) onMascotChange();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrlInput.trim()) return;
    setCustomImage(imageUrlInput.trim());
    localStorage.setItem('chang_itz_custom_mascot_image', imageUrlInput.trim());
    localStorage.setItem('chang_itz_mascot_skin', 'custom');
    setActiveSkin('custom');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
    window.dispatchEvent(new Event('chang_itz_mascot_updated'));
    if (onMascotChange) onMascotChange();
  };

  const handleSelectSkin = (skin: string) => {
    setActiveSkin(skin);
    localStorage.setItem('chang_itz_mascot_skin', skin);
    window.dispatchEvent(new Event('chang_itz_mascot_updated'));
    if (onMascotChange) onMascotChange();
  };

  const handleResetDefault = () => {
    localStorage.removeItem('chang_itz_custom_mascot_image');
    localStorage.setItem('chang_itz_mascot_skin', 'flipaclip');
    setCustomImage(null);
    setActiveSkin('flipaclip');
    window.dispatchEvent(new Event('chang_itz_mascot_updated'));
    if (onMascotChange) onMascotChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦊</span>
            <div>
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span>Chang-Itz Mascot Studio</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Custom Character
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Change the character mascot to your image or customize skins!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Custom Image Dropzone */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Upload className="w-4 h-4" />
            <span>Upload or Paste Your Image</span>
          </label>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              activeSkin === 'custom' && customImage
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {customImage ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={customImage}
                  alt="Custom Chang-Itz Mascot"
                  className="w-28 h-28 object-contain rounded-xl border border-amber-500/40 bg-slate-950 shadow-lg shadow-amber-500/20"
                />
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 inline-flex shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Active Mascot Image
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click to replace with a different image
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-200">
                  Drop your character image here, or browse
                </div>
                <p className="text-xs text-slate-500">
                  Supports PNG, JPG, WebP, SVG, and animated GIF
                </p>
              </div>
            )}
          </div>

          {/* Direct URL input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Or paste image URL (https://...)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
            >
              Apply URL
            </button>
          </div>

          {uploadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Character updated to your image! It is now the official mascot across Chang-Itz.</span>
            </div>
          )}
        </div>

        {/* Mascot Skins Selection */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mascot Character Skin</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectSkin('flipaclip')}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                activeSkin === 'flipaclip' || (!customImage && activeSkin !== 'custom')
                  ? 'border-amber-400 bg-amber-500/10 font-bold ring-1 ring-amber-400'
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-white p-0.5 border border-amber-500/30 flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/Screenshot_20261017_133833_FlipaClip_74400130.jpg"
                  alt="FlipaClip Artwork"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  <span>FlipaClip Official</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400">Default</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Authentic Hand-Drawn Mascot</div>
              </div>
            </button>

            {customImage && (
              <button
                type="button"
                onClick={() => handleSelectSkin('custom')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  activeSkin === 'custom'
                    ? 'border-amber-400 bg-amber-500/10 font-bold ring-1 ring-amber-400'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-950 p-0.5 border border-slate-700 flex items-center justify-center shrink-0">
                  <img src={customImage} alt="User" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200">Custom Uploaded</div>
                  <div className="text-[10px] text-amber-400 truncate">Your Custom Character</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetDefault}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
