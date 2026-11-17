import React from "react";
import { staticFile } from "remotion";

export const FontLoader: React.FC = () => {
  const css = `
    @font-face {
      font-family: 'BeVietnamUprightBlack';
      src: url('${staticFile("fonts/BeVietnamPro-Black-VN.woff2")}') format('woff2');
      font-weight: 900;
      font-style: normal;
      unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
    }
    @font-face {
      font-family: 'BeVietnamUprightBlack';
      src: url('${staticFile("fonts/BeVietnamPro-Black-Latin.woff2")}') format('woff2');
      font-weight: 900;
      font-style: normal;
    }
    @font-face {
      font-family: 'BeVietnamUprightBold';
      src: url('${staticFile("fonts/BeVietnamPro-Bold-VN.woff2")}') format('woff2');
      font-weight: 700;
      font-style: normal;
      unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
    }
    @font-face {
      font-family: 'BeVietnamUprightBold';
      src: url('${staticFile("fonts/BeVietnamPro-Bold-Latin.woff2")}') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'MontserratBlack';
      src: url('${staticFile("fonts/Montserrat-Black.ttf")}') format('truetype');
      font-weight: 900;
      font-style: normal;
    }
    @font-face {
      font-family: 'BebasNeue';
      src: url('${staticFile("fonts/BebasNeue-Regular.ttf")}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'InterBold';
      src: url('${staticFile("fonts/Inter-Bold.woff2")}') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'InterReg';
      src: url('${staticFile("fonts/Inter-Regular.woff2")}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};
