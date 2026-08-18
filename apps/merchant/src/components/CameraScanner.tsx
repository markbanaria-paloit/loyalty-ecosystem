import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

/**
 * Full-screen camera scanner for member QR codes.
 *
 * `qr-scanner` loads its decoder worker through a dynamic import, so the bundler
 * emits it as a normal hashed chunk — there is no runtime worker path to
 * misresolve on a static host. It also uses the platform `BarcodeDetector`
 * where one exists and falls back to the worker elsewhere, which matters
 * because iOS Safari has no BarcodeDetector.
 *
 * `getUserMedia` requires a secure context: this works on https and on
 * localhost, but not over a plain-http LAN address.
 */
export function CameraScanner({
  onScan,
  onClose,
}: {
  onScan: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  // The permission prompt sits between tapping Scan and the first frame; without
  // this the overlay is an unexplained black rectangle for that whole window.
  const [starting, setStarting] = useState(true);
  // Guards against a burst of decodes firing onScan more than once.
  const doneRef = useRef(false);
  // Read inside the visibility handler, whose closure never sees `error`.
  const failedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set once the effect is torn down, so a `start()` that resolves *after*
    // unmount can release the camera it just acquired. Without this, cancelling
    // while the permission prompt is still open leaves the camera running with
    // no UI attached to switch it off.
    let cancelled = false;

    /** qr-scanner may leave a stream on the element; drop the tracks by hand. */
    const releaseTracks = () => {
      const stream = video.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    };

    const teardown = () => {
      scanner.stop();
      scanner.destroy();
      releaseTracks();
    };

    const scanner = new QrScanner(
      video,
      (result) => {
        if (doneRef.current || cancelled) return;
        doneRef.current = true;
        onScan(result.data);
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      },
    );

    scanner
      .start()
      .then(() => {
        if (cancelled) {
          teardown();
          return;
        }
        setStarting(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStarting(false);
        const name = e instanceof Error ? e.name : '';
        const message =
          name === 'NotAllowedError'
            ? 'Camera permission denied. Allow access, or type the ID instead.'
            : name === 'NotFoundError'
              ? 'No camera found on this device. Type the ID instead.'
              : !window.isSecureContext
                ? 'The camera needs a secure connection (https). Type the ID instead.'
                : 'Could not start the camera. Type the ID instead.';
        failedRef.current = true;
        setError(message);
      });

    // Hand the camera back while the till is backgrounded — a held track keeps
    // the recording indicator lit and blocks other apps from the camera.
    const onVisibility = () => {
      if (document.hidden) {
        scanner.stop();
        releaseTracks();
      } else if (!doneRef.current && !failedRef.current && !cancelled) {
        scanner.start().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      teardown();
    };
    // Started once per mount; the overlay unmounts to stop scanning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="scanner-overlay" role="dialog" aria-modal="true" aria-label="Scan member QR">
      <div className="scanner-bar">
        <strong>Scan member QR</strong>
        <button type="button" className="btn ghost sm" onClick={onClose}>
          Cancel
        </button>
      </div>

      <div className="scanner-stage">
        {/* Kept mounted even on error so the scanner always has its element. */}
        <video ref={videoRef} className="scanner-video" muted playsInline />
        {starting && !error && (
          <p className="scanner-status">Starting camera…</p>
        )}
        {error && (
          <div className="scanner-error">
            <p>{error}</p>
            <button type="button" className="btn primary" onClick={onClose}>
              Enter ID manually
            </button>
          </div>
        )}
      </div>

      {!error && !starting && (
        <p className="scanner-hint">
          Point the camera at the QR on the member&apos;s card.
        </p>
      )}
    </div>
  );
}
