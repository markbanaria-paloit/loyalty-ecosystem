import React from 'react';
import { useLocation } from 'react-router-dom';
import sensorHousing from '../assets/icons/Sensor Housing.png';
import cellularIcon from '../assets/icons/Cellular Connection.svg';
import wifiIcon from '../assets/icons/Wifi.svg';
import batteryIcon from '../assets/icons/Battery.svg';

function useTime() {
  const [time, setTime] = React.useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  });
  React.useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const WHITE_HEADER_ROUTES = ['/rewards', '/promotions', '/profile', '/card', '/ledger', '/parking', '/scan', '/scan/confirm'];

export default function StatusBar() {
  const time = useTime();
  const { pathname } = useLocation();
  const isLight = pathname === '/';
  const hasWhiteHeader = WHITE_HEADER_ROUTES.includes(pathname);
  return (
    <div className={`fixed left-1/2 top-0 z-[60] flex h-11 w-full max-w-md -translate-x-1/2 items-center justify-center gap-12 px-5 ${hasWhiteHeader ? 'bg-white/90 backdrop-blur-lg' : ''}`}>
      {/* Left: time */}
      <span className={`w-16 text-[13px] font-semibold tabular-nums ${isLight ? 'text-white' : 'text-gray-900'}`}>{time}</span>

      {/* Center: Dynamic Island / sensor housing */}
      <img
        src={sensorHousing}
        alt=""
        aria-hidden="true"
        className="h-7.25 w-30 object-contain"
      />

      {/* Right: status icons */}
      <div className={`flex w-16 items-center justify-end gap-1.5 ${isLight ? 'brightness-0 invert' : ''}`}>
        <img src={cellularIcon} alt="cellular" className="h-3.25" />
        <img src={wifiIcon} alt="wifi" className="h-3.25" />
        <img src={batteryIcon} alt="battery" className="h-3.25" />
      </div>
    </div>
  );
}
