import faviconPng from "../../public/favicon-96x96.png?no-inline"
import faviconIco from "../../public/favicon.ico?no-inline"
import faviconSvg from "../../public/favicon.svg?no-inline"
import appleTouchIcon from "../../public/apple-touch-icon.png?no-inline"
import manifest from "../../public/manifest.webmanifest?no-inline"

export function Head() {
  return (
    <>
      <link rel="icon" href={faviconPng} sizes="96x96" />
      <link rel="icon" href={faviconSvg} />
      <link rel="shortcut icon" href={faviconIco} />
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
      <meta name="theme-color" content="#2196f3" />
      {/* <meta property="og:title" content="Y Chip Area Visualizer" /> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={import.meta.env.BASE_URL} />
      {/* <meta property="og:image" content="/social-banner.svg" /> - +config.ts */}
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="640" />
      <meta
        property="og:image:alt"
        content="CSharperMantle/ysyx-chip-area-visualizer: Visualize Yosys `stat` reports."
      />
      <meta property="og:locale" content="en_US" />
      <meta property="og:determiner" content="the" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@CSMantle3" />
      <meta name="twitter:title" content="Y Chip Area Visualizer" />
      {/* <meta name="twitter:image" content="/social-banner.svg" /> - +config.ts */}
      <meta
        name="twitter:image:alt"
        content="CSharperMantle/ysyx-chip-area-visualizer: Visualize Yosys `stat` reports."
      />
      <link rel="manifest" href={manifest} />
    </>
  )
}
