'use client'

import QRCode from "react-qr-code";

interface Properties {
  url: string
}

const SongQRCode = ({ url }: Properties) => {
  return (
    <div style={{ backgroundColor: 'white', height: 'auto', margin: '0 auto', width: '100%' }}>
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={encodeURI(url)}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
}

export default SongQRCode;