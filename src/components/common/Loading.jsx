import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading component for Suspense fallbacks and async states.
 * Premium aesthetic with centering and subtle animation.
 */
const Loading = () => {
  return (
    <div className="loading-screen-dark" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: 'var(--bg-dark)',
      zIndex: 9999
    }}>
      <div style={{ position: 'relative' }}>
        <Loader2 
          className="spinning" 
          size={48} 
          style={{ color: 'var(--primary-color)', opacity: 0.8 }} 
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          filter: 'blur(10px)',
          opacity: 0.3,
          zIndex: -1
        }}></div>
      </div>
      <p style={{ 
        marginTop: '20px', 
        color: 'var(--text-dim)', 
        fontSize: '0.9rem', 
        letterSpacing: '0.05em',
        fontWeight: 500
      }}>
        INITIALIZING CODERECALL...
      </p>
    </div>
  );
};

export default Loading;
