# Attribution and licenses

**Downtown Beatdown** — original game template and artwork by **Quiver**.

- Source: https://github.com/quiver-dev/template-beat-em-up
- Reviewed source revision: `ba9542d79b013b6446af1501f74dea3fcde0dcfc`
- Original code: Copyright (c) 2022 Quiver, MIT License. Full notice: [licenses/Quiver-MIT.txt](licenses/Quiver-MIT.txt).
- Upstream art, music and sound assets: Creative Commons Attribution 4.0 International, as declared by [the upstream asset license](https://github.com/quiver-dev/template-beat-em-up/blob/ba9542d79b013b6446af1501f74dea3fcde0dcfc/LICENSE_ASSETS.txt). The original declaration is retained in [licenses/Quiver-ASSETS.txt](licenses/Quiver-ASSETS.txt).
- CC BY 4.0 summary: https://creativecommons.org/licenses/by/4.0/
- CC BY 4.0 legal code: https://creativecommons.org/licenses/by/4.0/legalcode

## This browser adaptation

The new JavaScript application code is Copyright (c) 2026 Tiana contributors, under the MIT License. It implements its own combat simulation, scene composition, keyboard/touch input, synthesized audio and SQLite saves. It is a browser adaptation, not a byte-for-byte Godot port or the original complete Godot game.

Selected upstream character animation frames and scenery have been resized to 50% and encoded as WebP (quality 88). Scenery has been recomposed and tinted by the renderer. The character designs and original artwork remain Quiver's CC BY 4.0 assets; they are **not relicensed as MIT**. `assets/manifest.json` lists the source path, original SHA-256, output SHA-256, frame sequences, author, license and source revision for every included image.

No upstream audio recordings or font files are included. Music and sound effects are synthesized by the newly written `src/audio.js`; they do not reproduce the soundtrack of another game. Fonts are provided by the browser's installed system fonts.

Retain the author attribution, source and license links, existing modification notices, and indicate your additional changes when redistributing or adapting the artwork. Do not imply Quiver endorses Tiana or this adaptation. Do not impose additional legal or technological restrictions on the CC BY 4.0 artwork. Upstream notices and the in-game attribution panel are included in the web build.

The MIT and CC BY licenses provide their stated disclaimers and do not warrant that every possible use is cleared of all third-party rights. Attribution follows the repository's published license declaration; it is not an independent verification of the creator's entire chain of title.

## Runtime dependency

`@tianacloud/serverless` is Apache-2.0-licensed. Its license is retained in `licenses/Tiana-SDK-Apache-2.0.txt` and distributed with the application.
