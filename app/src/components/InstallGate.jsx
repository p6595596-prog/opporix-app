import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare } from 'lucide-react';
import './InstallGate.css';

export default function InstallGate({ children }) {
  const [isStandalone, setIsStandalone] = useState(true); // Default true to prevent flash
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is installed (standalone)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for install prompt on Android/Desktop Chrome
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Please install the app from your browser menu!");
    }
  };

  // If installed, show the normal app!
  if (isStandalone) {
    return children;
  }

  // If NOT installed, show the blocking overlay
  return (
    <div className="install-gate">
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      
      <div className="install-card glass anim-fade-up">
        <div className="logo-placeholder">
          <img src="/pwa-192x192.png" alt="Opporix Logo" />
        </div>
        
        <h1 className="install-title">Welcome to Opporix</h1>
        <p className="install-sub">To continue using this platform, you must install the official app to your device.</p>

        {isIOS ? (
          <div className="ios-instructions">
            <p><strong>iOS Users:</strong></p>
            <ol>
              <li>Tap the <Share size={16} style={{display: 'inline', margin: '0 4px'}} /> <strong>Share</strong> button below.</li>
              <li>Scroll down and tap <PlusSquare size={16} style={{display: 'inline', margin: '0 4px'}} /> <strong>Add to Home Screen</strong>.</li>
            </ol>
          </div>
        ) : (
          <button 
            className="btn btn-primary install-btn" 
            onClick={handleInstallClick}
            disabled={!deferredPrompt && !isIOS}
          >
            <Download size={18} />
            {deferredPrompt ? 'Install App Now' : 'Open Browser Menu to Install'}
          </button>
        )}
      </div>
    </div>
  );
}
