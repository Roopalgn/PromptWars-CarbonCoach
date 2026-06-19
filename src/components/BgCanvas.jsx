import { useRef, useEffect } from 'react';

/**
 * Animated mesh background component.
 * Tracks mouse movements to dynamically displace overlay blobs.
 * Properly cleans up its window event listener on unmount.
 * 
 * @returns {JSX.Element}
 */
export default function BgCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      if (canvasRef.current) {
        canvasRef.current.style.setProperty('--mouse-x', `${x * 120}px`);
        canvasRef.current.style.setProperty('--mouse-y', `${y * 120}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={canvasRef} className="bg-canvas" aria-hidden="true">
      <div className="bg-blob-wrap bg-blob-wrap--1">
        <div className="bg-blob bg-blob--1" />
      </div>
      <div className="bg-blob-wrap bg-blob-wrap--2">
        <div className="bg-blob bg-blob--2" />
      </div>
      <div className="bg-blob-wrap bg-blob-wrap--3">
        <div className="bg-blob bg-blob--3" />
      </div>
    </div>
  );
}
