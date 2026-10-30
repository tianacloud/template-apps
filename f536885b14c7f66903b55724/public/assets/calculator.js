
		// SPDX‑License‑Identifier: GPL‑3.0‑only
		// Version History Region
		// #region
		// Follow standard ISO 80000
		// Revision History
		// 1 Initialized as version 1.0 based on Spectral_Parameter_Calculator_Ver5.11 tool
		// 1.1 Date: 2026-10-12
		// 1.1.1 Changed default WPE from 60% to 70%.
		// 1.1.2 Adjusted web-page UI.
		// 1.1.3 Added CSV export feature for spectral data.
		// 1.1.4 Aligned the chart row with the parameter-card row below: the right edge of the spectral chart now lines up with the right edge of the 2nd card (TM-30), and the left edge of the CIE 1931 chart lines up with the left edge of the 3rd card (Horticulture); the right edge of the CIE chart is unchanged.
		// 1.1.5 Added "Save As CSV" button (left of "Copy to Clipboard") that exports the wavelength and all spectral columns to Spectral_Data.csv.
		// 1.1.6 "Copy to Clipboard" now shows a transient English message next to the buttons instead of an alert; it auto-hides after 3 seconds.
		// 1.1.7 Centered the page layout in the browser (fixed-width paper, auto margins).
		// 1.1.8 "Copy to Clipboard" now copies only the Original Spectrum column: 401 relative values (peak = 1), one value per line.
		// 1.1.9 Removed unused CSS: variables --secondary-color / --accent-color / --light-color, the .legend-label span rule, and no-op declarations (box-shadow: none, height: auto, overridden margins).
		// 1.1.10 Added photon-flux (PPF) ratios to the Horticulture card: R/B and R/FR (photon ratios, not power ratios), plus B/G/R photon percentages (400-500 / 500-600 / 600-700 nm, relative to total photons 380-780 nm).
		// 1.2 Date: 2026-10-13
		// 1.2.1 Restyled the footer: kept full width aligned with the content above but reduced its height to a compact bar with the text vertically centered (flex).
		// 1.2.2 Added spectral fitting coefficient GFC (cosine similarity to the TM-30-style reference spectrum, per Chinese full-spectrum certification specs) to the Human Centric card, and a new Film & TV Lighting Parameters section with SSI (Academy S-2019-001 / ANSI ST 422 algorithm, blackbody at the test CCT as reference) under the Stadium section.
		// 1.2.3 Renamed the "Film & TV Lighting Parameters" section to "Studio Lighting Parameters".
		// 1.2.4 Added the "Lighting Quality Parameters" section (below TM-30): MCPI = 0.62*Qa(CQS v9.0) + 0.38*CDI76 and CDM = -0.07*Rd + 0.93*Sneutral, with MCPIr/CDMr referenced to a CIE 224 reference illuminant at the source CCT; algorithms per the official LQMT toolbox (WHU-LQCV) of the Chinese team standard for white-light colour quality evaluation.
		// 1.3 Date: 2026-10-14
		// 1.3.1 Moved the "Studio Lighting Parameters" (SSI) section from the TM-30 card to the Basic Parameters card, right below the Color Rendering Index (CRI) block.
		// 1.3.2 Added the TM-30 colour vector graphic and metric charts below the special colour rendering indices (R1-R15) table: colour bias vector graphic (16 hue-bin wedges, reference/test gamut polygons with ±20% chroma rings and Rf/Rg/Rf,h1/Rcs,h1 readouts), local chroma shift (Rcs,hj), local hue shift (Rhs,hj) and local colour fidelity (Rf,hj) per hue-angle bin, plus the 99-sample colour fidelity (Rf,ces) chart; bar colours follow the test-source appearance of each bin / sample, per IES TM-30-18.
		// 1.3.3 TM-30 panel polish: card width now matches the surrounding result modules (100% with responsive canvas scaling); removed the CCT/Duv readout and the P-V-F- label from the colour vector graphic; the four metrics (Rf, Rg, Rf,h1, Rcs,h1) sit at the four corners of the graphic frame in one unified font/size; the bar charts use the page background instead of white and all highlight whites are unified to #E8E8E8; TLCI-2012 Q1-Q18 header and patch score text are now white.
		// 1.3.4 TM-30 chart refinements: the rotated axis titles of the local-metric charts are vertically centred and wrapped onto two lines when too long; the hue-bin vector graphic is enlarged (41.5% width) and the bar-chart column flexes so both columns share the same bottom edge; hovering a bar of the 99-sample colour fidelity chart now shows a floating "Rf,cesN: value" readout, like the official IES TM-30 calculation tool.
		// 1.3.5 TM-30 chart fine-tuning: the rotated y-axis titles are moved inward for a reasonable gap from the card's left edge (the 99-sample chart plot area is shifted right accordingly); the hover badge background now follows the colour of the hovered sample bar instead of always being green, with a soft text shadow to keep the white label readable on light colours.
		// 1.3.6 TM-30 chart spacing: the plot areas of the metric charts are narrowed from the left (larger left margin) so the rotated y-axis titles no longer overlap the y-axis tick labels, and the bottom margins are reduced so the x-axis tick labels sit closer to the "Hue-Angle Bin (j)" / "Color Evaluation Sample" axis titles.
		// 1.3.7 Added the SPD library feature at the top-right of the "Input Spectral Data" section: a "Load Library" button and a "Choose a SPD" drop-down, like the official IES TM-30 spectral calculator. The 314 example spectra of the official library (380-780 nm, 1 nm) were converted from the IES .spdx files into the companion workbook "TM30_SPD_Library.xlsx" (single sheet, name + group + 401 wavelength columns); the workbook is loaded on demand (not embedded) and parsed in-page without any external dependency (.xlsx zip/XML via the native DecompressionStream, plus .csv support). Selecting a spectrum fills the input box and applies it immediately.
		// 1.3.8 Layout polish: the "Input Spectral Data" heading is back at its original position with the SPD library controls vertically centred on it, the "SPD Library" caption was removed and the button renamed to "Load SPD Library"; in the colour vector graphic the hue-bin numbers use a smaller font and the "-20%" ring label is horizontally aligned with "+20%".
		// 1.3.9 Reworked the spectral input box: the placeholder now shows English examples of the accepted formats; the parser accepts data pasted from Excel in two columns (wavelength + intensity, non-integer wavelengths are linearly interpolated onto integer nm, data outside 380-780 nm is dropped, missing ranges are padded with 0) or a single column (exactly 401 values are used directly as 380-780 nm @ 1 nm, any other count is spread from 380 nm to 780 nm with linear interpolation); comma / space / tab separators and a single-line layout are supported. The "Load Data" button was removed and its function is now performed automatically at the start of "Calculate Parameters"; an empty input box is skipped silently on the automatic calculation at page load instead of showing an alert.
		// 1.3.10 Merged the four standalone data tables into their heading cards so each heading and its table sit in the same rounded rectangle: Special Color Rendering Indices (R1-R15), Television Lighting Consistency Index (TLCI-2012) with the Q1-Q18 patches, Color Quality Scale (CQS) with the Q1-Q15 patches, and Spectral Data with the wavelength table; the footer's top spacing was normalised to the page's regular 20 px module gap.
		// 1.3.11 Interactive hue-bin readouts in the TM-30 colour vector graphic: the bottom-left and bottom-right corners now follow the cursor — hovering a hue-bin wedge shows that bin's local colour fidelity (Rf,hj) and local chroma shift (Rcs,hj), and outside the wedges (or when the cursor leaves) they fall back to CCT and Duv; Rf and Rg remain fixed at the top corners.
		// 1.3.12 Expanded the SPD library from 314 to 778 records by adding 464 Samsung LED spectra (380-780 nm, 1 nm, peak-normalised to 1) extracted from "LED_SPDs_250_800nm_Ver.2.00_Nov.2nd_2021.xlsx" (12 sheets, 457 spectra) and "LM301D S95_SPD_Normalized.xlsx" (7 spectra), named "model + CRI + CCT" (e.g. "LH351B Ra80 3000K") with Group = Samsung; the two genuinely duplicated names got a " (1) / (2)" suffix.
		// 1.3.13 Selecting a spectrum in the "Choose a SPD" drop-down now recomputes all metrics instead of only refreshing the spectrum plot: the change handler called loadData() (which merely re-reads the input box) and left the results panel showing the previous spectrum's numbers, so it now calls calculate().
		// 1.4 Date: 2026-10-15
		// 1.4.1 Rewrote this revision history: the entries are now grouped and numbered by date (1.1 = 2026-10-12, 1.2 = 2026-10-13, 1.3 = 2026-10-14, 1.4 = 2026-10-15).
		// 1.4.2 Unified the page colours: every white text, including the axis/coordinate text drawn on the charts, is now #E8E8E8, and every blue text is #00B0F0; the header info line, the footer and the input placeholders keep a unified dim white (#8496a9, now also applied to ::placeholder).
		// 1.4.3 Fixed two small notches that the bottom corner readouts cut into the hue-bin graphic: the fixed 150 px wide clearRect strips used to erase the previous CCT/Duv or Rf,hj/Rcs,hj text reached below the outer edge of the two bottom wedges (the disc bottom is at y = S - 10 while the strips start at y = S - 30), so the erasure clipped tiny corners out of the wedges at x ≈ 148 and x ≈ 322; the erase region is now clipped to the bottom strip minus the hue-bin disc with the even-odd fill rule, so it can never touch the wedges again.
		// 1.5 Date: 2026-10-16
		// 1.5.1 Restyled the page header as a compact banner bar in the style of the plant-lighting tool: a purple rounded icon with the letter "P" and a two-line title block on the left (title with a gold accent + the dim info line "Author / QQ Group / Version"), and a green-dot status pill ("Offline · No Network Required") on the right; all English texts are unchanged.
		// 1.5.2 Header right column: the status pill moved up onto the title line and an open-source licence note "License: GPL-3.0-only" was added below it, sized and coloured like the info line on the left and vertically aligned with it. Also translated the remaining Chinese comments (TLCI grid note, canvas palette note, GFC spec name, LQMT standard name) and the two Chinese UI strings (spectral-chart tooltip, TLCI excluded-patch tooltip) into English.
		// 1.5.3 Header polish: the licence note under the status pill did not look good, so the pill went back to its vertically centred spot on the right, and the licence moved into the left info line — "Technical Discussion QQ Group" was shortened to "QQ Group" and "• License: GPL-3.0-only" was appended after the version number.
		// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
		// 2 Revised to Ver 1.0.1
		// 2.1 Date: 2026-10-22
		// 2.2.1 Reworked the TM-30 colour vector graphic to match the official IES TM-30 calculator: the black outline is now the fixed 0%-chroma circle (after chroma normalisation the reference gamut always has the same mean radius, so it never changes shape) instead of the 16-vertex reference polygon; the red outline is a smooth closed Catmull-Rom spline through the 16 bin points instead of a straight-edged polygon with a marker on every vertex; and the arrows moved off the curve — each arrow now starts at the black circle's hue-bin centre angle and points radially toward the position where the red curve drifted (outward for a positive local chroma shift, inward for a negative one), and is omitted when the drift is smaller than a few pixels.
		// 2.2.2 Coloured the drift arrows per hue bin like the official IES TM-30 calculator: instead of a fixed red, each arrow now takes the test-source appearance colour of its bin (what that bin's samples look like under the test light), with a soft dark halo so it stays readable on wedges of a similar colour; the wedges and the 99-sample colours remain fixed to the cached D65 palette, so the graphic base colours still never change with the input spectrum.
		// 2.2.3 Fixed the red test-gamut curve of the TM-30 colour vector graphic to the official construction (TM-30 / CIE 224 Annex E): it was plotting the raw bin-averaged test a',b', whose absolute chroma also carries the scatter of the individual samples (especially near hue-bin borders), so the curve wiggled far more than the official tool while all numeric values still matched. Now each of the 16 curve points sits at the hue angle of the bin's TEST centroid with a radius of the 0% circle scaled by that bin's chroma ratio (test centroid chroma / reference centroid chroma), so the curve deviation always equals Rcs,hj — for full-spectrum sources such as LM301D Ra95 4000K the curve now hugs the black circle like the official tool, and the drift arrows follow the corrected curve. Rg and all other metrics continue to use the raw polygon as required by the standard.
		// 2.2.4 Rebuilt the TM-30 drift arrows after reverse-engineering the official IES TM-30 AdvancedCalculationTool workbook (IES__TM-30-18__AdvancedCalculationTool.xlsm), where chart "CVG" holds one two-point line series per hue bin whose endpoints are the same cells (Results Numerical!AA:AD) that the red curve is plotted from. The previous arrows were strictly radial from the bin centre angle and capped at a fixed length, so they appeared to point at the circle centre and several of them stopped short of the curve. Now every arrow starts on the black 0% circle at its hue bin's centre angle and ends exactly on the red curve's node for that bin: since the node's hue angle differs from the bin centre angle the arrow is a true shift vector (neither radial nor centre-aimed), and because the length is no longer capped it always touches the curve. The head is a stealth arrowhead of the workbook's proportions (1.5 pt line, medium head) instead of a plain triangle, and the colour is the fixed 16-colour per-bin palette of the workbook, so the arrows no longer change with the input spectrum.
		// 2.2.5 Fixed the hover readout of the 99-sample colour fidelity chart: since the 2x supersampling rework the mouse handler converted the cursor into BACKING-store pixels while the bar geometry lives in logical units (canvas.width / 2), so every bar index came out roughly doubled — the readout named a bar far to the left of the one under the cursor (growing worse towards the right) and went silent once the cursor passed the middle of the chart because the index ran past the 99th sample. The cursor position is now mapped into the same logical space the bars are drawn in, and the readout tracks the hovered bar exactly from CES 1 through CES 99.
		// 2.2.6 Made the vertical range of the three local-metric bar charts (Rcs,hj / Rhs,hj / Rf,hj) adaptive: previously the fixed spans (±40%, ±0.4, 0–100) clipped bars and let their value labels pile up on the chart border whenever a spectrum pushed a bin past the edge (e.g. Rcs,hj of −49%). Each chart now keeps its default span whenever every value fits inside it, and grows the exceeded side to the next whole multiple of its default grid step only when needed (±40% → −60%…+40%, ±0.4 → ±0.6, …); gridlines are drawn at whole multiples of the same step so tick labels stay clean numbers instead of re-dividing the enlarged span into four awkward fractions.
		// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
		// Elegant Divider——————————————————————————————————————————————————————————————————————————————————————————————————————————————————
		// #endregion
			
		// Basic Data Region
		// #region
		// Black-body chromaticity data (column 1: CCT; columns 2-3: CIE 1931 x, y)
		const blackBodyLocus = globalThis.__lightingReferenceData.blackBodyLocus;

		// 2° Observer Tristimulus Value Functions Data
		const triStimulusValues = globalThis.__lightingReferenceData.triStimulusValues;

		// 10° Observer Tristimulus Value Functions Data
		const triStimulusValues10 = globalThis.__lightingReferenceData.triStimulusValues10;

		// Reflectance spectra of the color samples used for calculating the Color Rendering Index
		const colorSampleReflectance = globalThis.__lightingReferenceData.colorSampleReflectance;

		// TM-30 color-sample reflectance spectra(99 spectra split into 9 groups due to width; merged into one array by the program before use)
		//#region
		const cesReflectance_1 = globalThis.__lightingReferenceData.cesReflectance_1;

		const cesReflectance_2 = globalThis.__lightingReferenceData.cesReflectance_2;

		const cesReflectance_3 = globalThis.__lightingReferenceData.cesReflectance_3;

		const cesReflectance_4 = globalThis.__lightingReferenceData.cesReflectance_4;

		const cesReflectance_5 = globalThis.__lightingReferenceData.cesReflectance_5;

		const cesReflectance_6 = globalThis.__lightingReferenceData.cesReflectance_6;

		const cesReflectance_7 = globalThis.__lightingReferenceData.cesReflectance_7;

		const cesReflectance_8 = globalThis.__lightingReferenceData.cesReflectance_8;

		const cesReflectance_9 = globalThis.__lightingReferenceData.cesReflectance_9;
		//#endregion

		// Recombined daylight vector data
		const compositeDaylightVector = globalThis.__lightingReferenceData.compositeDaylightVector;

		// Data required for COI calculation
		const COIdata = globalThis.__lightingReferenceData.COIdata;

		// Lookup table of monochromatic wavelengths versus CIE 1931 chromaticity coordinates
		const monochromaticData = globalThis.__lightingReferenceData.monochromaticData;

		// ipRGC action spectrum, photopic luminosity curve, scotopic luminosity curve
		const melanopicPhotopic = globalThis.__lightingReferenceData.melanopicPhotopic;

		// Weighted data for horticultural lighting parameter calculations (McCree Curve and DIN Curve)
		const hortiCurve = globalThis.__lightingReferenceData.hortiCurve;

		// CQS data
		// CIE standard illuminant D65 spectrum
		const standardD65 = globalThis.__lightingReferenceData.standardD65;

		// Reflectance spectra of color samples used for CQS calculation
		const cqsColorSample = globalThis.__lightingReferenceData.cqsColorSample;

		// Blue-light hazard weighting function
		const blueLightHazard = globalThis.__lightingReferenceData.blueLightHazard;

		// Related data for TLCI-2012 calculation(Not used in current version)
		const colorCheckerTLCI = globalThis.__lightingReferenceData.colorCheckerTLCI

		const ebuTech3355 = globalThis.__lightingReferenceData.ebuTech3355

		// TLCI constants(Really used to maintain consistency with official calculation results)
		// ---------- EBU Standard Camera Response Curves (Appendix 5, 380‑760 nm / 5 nm, R/G/B three‑channels) ----------
		// Raw 5 nm data, linearly interpolated onto the 380‑780 nm / 1 nm grid at runtime (see tlciInterp5to1)
		const TLCI_CAM_R_5NM = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.00045, 0.001, 0.00123, 0.0013, 0.0013, 0.00119, 0.00112, 0.00104, 0.00093, 0.00086, 0.00082, 0.00082, 0.00089, 0.00089, 0.00097, 0.00089, 0.00089, 0.00089, 0.00093, 0.00104, 0.00112, 0.00134, 0.00149, 0.00171, 0.00179, 0.00167, 0.00141, 0.00115, 0.00112, 0.00119, 0.00171, 0.00592, 0.01563, 0.03231, 0.05431, 0.06733, 0.07283, 0.07306, 0.07165, 0.06864, 0.0638, 0.05926, 0.0546, 0.04939, 0.04437, 0.03957, 0.03454, 0.02944, 0.02503, 0.02103, 0.0179, 0.01496, 0.01217, 0.00971, 0.00774, 0.00588, 0.00435, 0.0029, 0.002, 0.00134, 0.00095, 0.00071, 0.00053, 0.00044, 0.00031, 0.00019, 6e-05, 0.0, 0.0, 0.0, 0.0];
		const TLCI_CAM_G_5NM = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.00011, 0.000211, 0.000321, 0.000482, 0.000562, 0.000633, 0.000753, 0.000934, 0.001175, 0.001386, 0.001777, 0.002239, 0.002902, 0.003555, 0.004488, 0.006175, 0.010664, 0.021297, 0.036343, 0.046681, 0.054634, 0.059594, 0.062114, 0.063761, 0.065066, 0.066341, 0.067426, 0.068018, 0.068109, 0.066994, 0.06353, 0.054222, 0.041319, 0.02521, 0.013264, 0.00735, 0.004418, 0.002611, 0.001707, 0.001084, 0.000482, 3e-05, 1.1e-05, 8e-06, 6e-06, 3e-06, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		const TLCI_CAM_B_5NM = [0.0, 0.000215, 0.000649, 0.001397, 0.003902, 0.007905, 0.014223, 0.021958, 0.029294, 0.036253, 0.042739, 0.048916, 0.055513, 0.061881, 0.068628, 0.073179, 0.075694, 0.077461, 0.07801, 0.074377, 0.066582, 0.053601, 0.036619, 0.022597, 0.012366, 0.008274, 0.006138, 0.004461, 0.003254, 0.002455, 0.001996, 0.001707, 0.001407, 0.001228, 0.000998, 0.000928, 0.000779, 0.000599, 0.000489, 0.000369, 0.000329, 0.00026, 0.00019, 0.00011, 7e-05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

		// ---------- Reflectance of the 24‑patch ColorChecker (Appendix 4, 380‑760 nm / 5 nm, Patch Nos. 1‑24) ----------
		const TLCI_TCS_5NM = globalThis.__lightingReferenceData.TLCI_TCS_5NM;
		// ==================== TLCI-2012 (EBU Tech 3355 / SMPTE RP 2093) ====================
		// Grid note: all calculations run on the 380-780 nm / 1 nm grid (401 points), fully
		//           aligned with the main program's wavelengths / intensities; camera responses
		//           and reflectances outside the EBU data domain (760-780 nm) are treated as 0,
		//           which is equivalent to limiting the integration range to 380-760 nm.

		// Dark-theme colour palette for the canvas charts
		const TLCI_AXIS = 'rgba(219, 228, 238, 0.8)';
		const TLCI_HALO = '#0f1419';
		// Unified light text colour for everything drawn on the charts
		const TLCI_TEXT = '#E8E8E8';

		// Names of the 18 ColorChecker patches used for TLCI calculation (the last 6 grey‑scale patches are excluded)
		const TLCI_PATCH_NAMES = [
			'暗肤 Dark skin', '亮肤 Light skin', '蓝天 Blue sky', '植物 Foliage',
			'蓝花 Blue flower', '蓝绿 Bluish green', '橙 Orange', '紫蓝 Purplish blue',
			'中红 Moderate red', '紫 Purple', '黄绿 Yellow green', '橙黄 Orange yellow',
			'蓝 Blue', '绿 Green', '红 Red', '黄 Yellow',
			'品红 Magenta', '青 Cyan'
		];

		// Approximate sRGB Values Corresponding to Each ColorChecker Patch (for table background color only)
		const TLCI_PATCH_RGB = [
			[115, 82, 68], [194, 150, 130], [98, 122, 157], [87, 108, 67],
			[133, 128, 177], [103, 189, 170], [214, 126, 44], [80, 91, 166],
			[193, 90, 99], [94, 60, 108], [157, 188, 64], [224, 163, 46],
			[56, 61, 150], [70, 148, 73], [175, 54, 60], [231, 199, 31],
			[187, 86, 149], [38, 165, 167]
		];

		// EBU Camera 3×3 Optimization Matrix, 90%‑Saturation Matrix, BT.709 Phosphor Display Synthesis Matrix
		const TLCI_M_CAMERA = [[1.182, -0.209, 0.027], [0.107, 0.890, 0.003], [0.040, -0.134, 1.094]];
		const TLCI_SAT = (1 - 90 / 100) / 3;
		const TLCI_M_SAT = [[1 - 2 * TLCI_SAT, TLCI_SAT, TLCI_SAT],
							[TLCI_SAT, 1 - 2 * TLCI_SAT, TLCI_SAT],
							[TLCI_SAT, TLCI_SAT, 1 - 2 * TLCI_SAT]];
		const TLCI_M_DISPLAY = [[0.412391, 0.357584, 0.180481],
								[0.212639, 0.715169, 0.072192],
								[0.019331, 0.119195, 0.950532]];
		const TLCI_WHITE_D65 = [0.950456, 1.0, 1.089058];
		const TLCI_SWING_WHITE = (255 - 16) / (235 - 16);
		const TLCI_K_Q = 3.16;
		const TLCI_P_Q = 2.4;

		let TLCI_CAM_1NM = null;
		let TLCI_TCS_1NM = null;

		const h = 6.62607015e-34;   // Planck constant (J·s)
		const c = 299792458;        // Speed of light in vacuum (m/s)
		const k = 1.380649e-23;     // Boltzmann constant (J/K)
		const na = 6.02214076e23;   // Avogadro constant (mol⁻¹)

		const canvasSpectral = document.getElementById('spectralCanvas');
		const canvasCie = document.getElementById('cieCanvas');
		const canvasCoordinate = document.getElementById('coordinateCanvas');

		// Merge TM-30 CES reflectance data
		function mergeCesReflectanceData(...cesArrays) {
			const cesReflectance = cesArrays[0].map((row, i) => [
				row[0], // Wavelength
				...row.slice(1),
				...cesArrays.slice(1).flatMap(arr => arr[i].slice(1))
			]);
			return cesReflectance;
		}

		// Actual merge of the nine TM CES arrays
		const cesReflectance = mergeCesReflectanceData(
			cesReflectance_1, cesReflectance_2, cesReflectance_3,
			cesReflectance_4, cesReflectance_5, cesReflectance_6,
			cesReflectance_7, cesReflectance_8, cesReflectance_9
		);

		//#endregion

		// Initialize data
		//#region
		// Wavelengths: 380-780 nm
		const wavelengths = Array.from({ length: 401 }, (_, i) => 380 + i);
		// Default spectrum: straight line from (380, 0) to (780, 1), approximating incandescent
		let intensities = Array.from({ length: 401 }, (_, i) => i / (wavelengths.length - 1));

		// Initialize CIE 1931 gamut arrays from monochromaticData
		const polygonX = [];
		const polygonY = [];

		// Iterate over monochromaticData and extract integer-wavelength data for the range 380-700 nm
		for (let i = 0; i < monochromaticData.length; i++) {
			const wavelength = monochromaticData[i][0]; // The first column is the wavelengt
			if (wavelength >= 380 && wavelength <= 700 && Number.isInteger(wavelength)) {
				polygonX.push(monochromaticData[i][1]); // The index of the second column is 1
				polygonY.push(monochromaticData[i][2]); // The index of the third column is 2
			}
		}

		// Pre-load the CIE 1960 chromaticity coordinates u, v that correspond to the correlated color temperatures during initialization
		const cct_uv = blackBodyLocus.map(r => [r[3], r[4]]);
		//#endregion

		// Generic spectrum normalization function
		function normalizeSpectrum(spectrum) {
			const maxIntensity = Math.max(...spectrum);
			if (maxIntensity === 0) {
				alert("Spectrum has zero intensity.");
				return spectrum; // If the maximum value is zero, return the original spectrum directly
			}
			return spectrum.map(value => value / maxIntensity);
		}

		// Plot additional spectral curves
		function drawSpectrumCurve(spectrum, lineStyle, color) {
			const ctx = canvasSpectral.getContext('2d');
			const margin = Math.floor(0.1 * canvasSpectral.height);
			const width = canvasSpectral.width - 2 * margin;
			const height = canvasSpectral.height - 2 * margin;

			ctx.beginPath();
			if (lineStyle === 'dashed') {
				ctx.setLineDash([5, 3]);
			}else {
				ctx.setLineDash([]);
			}
		ctx.moveTo(margin, height + margin - spectrum[0] * height);
		for (let i = 1; i < spectrum.length; i++) {
			// Divide by (length - 1) so the last point (780 nm) lands exactly on the axis end
			const x = margin + (i / (spectrum.length - 1)) * width;
			const y = height + margin - spectrum[i] * height;
			ctx.lineTo(x, y);
		}

			ctx.strokeStyle = color;
			ctx.lineWidth = 3;
			ctx.stroke();
		}

		// Plot and fill the spectral curve
		function drawSpectral(clear = true) {
			// Get the drawing context
			const ctx = canvasSpectral.getContext('2d');
			const fillModeCheckbox = document.getElementById('fill-mode');

			// Chart parameters
			const margin = Math.floor(0.1 * canvasSpectral.height);
			const scale = canvasSpectral.width / 800

			// Coordinate range configuration
			const xMin = 380, xMax = 780;
			const yMin = 0, yMax = 1;
			const width = canvasSpectral.width - 2 * margin;
			const height = canvasSpectral.height - 2 * margin;

			if (clear) {
				// Clear the canvas only when necessary
				ctx.clearRect(0, 0, canvasSpectral.width, canvasSpectral.height);
			}

			// Define the gradient object
			let gradient;
			if (fillModeCheckbox.checked) {
				// Use the preset color distribution
				gradient = ctx.createLinearGradient(margin, margin, width + margin, margin);

				gradient.addColorStop(0.00, 'rgba(173, 0, 204, 0.9)');   // Deep purple (380 nm)
				gradient.addColorStop(0.15, 'rgba(0, 0, 255, 0.9)');     // Blue (450 nm)
				gradient.addColorStop(0.33, 'rgba(0, 255, 255, 0.9)');   // Cyan (500 nm)
				gradient.addColorStop(0.49, 'rgba(0, 255, 0, 0.9)');     // Green (550 nm)
				gradient.addColorStop(0.64, 'rgba(255, 255, 0, 0.9)');   // Yellow (600 nm)
				gradient.addColorStop(0.79, 'rgba(255, 100, 0, 0.9)');   // Orange (650 nm)
				gradient.addColorStop(1.00, 'rgba(254, 0, 24, 0.9)');    // Red (700 nm+)

			} else {
				// Apply precise gradient fill
				gradient = ctx.createLinearGradient(margin, margin, width + margin, margin);

				// Extract data at 1 nm intervals and compute the corresponding RGB values
				for (let i = 0; i < monochromaticData.length; i += 10) { 
					// Sample every 10 data points (equivalent to 1 nm intervals)
					const wavelength = monochromaticData[i][0];  // current wavelength
					const x = monochromaticData[i][1];  // corresponding CIE 1931 x chromaticity coordinate
					const y = monochromaticData[i][2];  // corresponding CIE 1931 y chromaticity coordinate

					// Convert chromaticity coordinates to RGB
					const [r, g, b] = xy2RGB(x, y);

					// Map wavelength (380–780 nm) to 0–1 range
					const position = (wavelength - 380) / (780 - 380);

					// Add color stop using RGBA with 0.9 opacity
					gradient.addColorStop(position, `rgba(${r}, ${g}, ${b}, 0.9)`);
				}
			}

			// Draw the spectral filled area
			ctx.beginPath();
			ctx.moveTo(margin, height + margin);

			// First draw the path from the baseline up to the spectral curve
			for (let i = 0; i < wavelengths.length; i++) {
				// Divide by (length - 1) so the 780 nm point sits exactly on the axis end
				// and the closing edge down to the baseline stays vertical
				const x = margin + (i / (wavelengths.length - 1)) * width;
				const y = height + margin - intensities[i] * height;
				ctx.lineTo(x, y);
			}

			// Close the path and fill
			ctx.lineTo(width + margin, height + margin);
			ctx.closePath();
			ctx.fillStyle = gradient;
			ctx.fill();

			// Compute and plot various universal spectral curves
			const result = lightSourceCoordinate(intensities);
			const cct = correlatedColorTemperature(result.x, result.y);

			// Select and generate the reference spectrum for CRI according to CCT
			const referenceRa = cct <= 5000
				? generateBlackbodySpectrum(cct)   // ≤ 5000 K: black-body
				: composedDaylight(cct);          // > 5000 K: re-combined daylight

			// Generate 4000 K black-body spectrum for COI calculations
			const referenceCOI = generateBlackbodySpectrum(4000);

			// Generate the TM-30 reference spectrum based on CCT
			const referenceTM30 = generateTM30Spectrum(cct);

			// Extract and normalize D65 white-light spectrum
			const whiteD65 = normalizeSpectrum(standardD65.map(row => row[1]));

			// Check checkbox states and draw the corresponding spectral curves
			const checkboxes = document.querySelectorAll('.legend-item input[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				if (checkbox.checked) {
					const spectrumId = checkbox.id;
					let spectrumData, lineStyle, color;

					switch (spectrumId) {
						case 'legend-spectrum':
							spectrumData = intensities;
							lineStyle = 'solid';
							color = 'rgba(226, 232, 240, 0.9)';
							break;
						case 'legend-ra':
							spectrumData = referenceRa;
							lineStyle = 'dashed';
							color = 'rgba(254, 0, 24, 0.7)';
							break;	
						case 'legend-tm30':
							spectrumData = referenceTM30;
							lineStyle = 'dashed';
							color = 'rgba(255, 100, 0, 0.7)';
							break;			                
						case 'legend-coi':
							spectrumData = referenceCOI;
							lineStyle = 'dashed';
							color = 'rgba(255, 255, 0, 0.7)';
							break;				                
						case 'legend-d65':
							spectrumData = whiteD65;
							lineStyle = 'dashed';
							color = 'rgba(0, 255, 0, 0.7)';
							break;
						case 'legend-mccree':
							spectrumData = hortiCurve.map(row => row[1]);
							lineStyle = 'dashed';
							color = 'rgba(0, 255, 255, 0.7)';
							break;
						case 'legend-din':
							spectrumData = hortiCurve.map(row => row[2]);
							lineStyle = 'dashed';
							color = 'rgba(0, 0, 255, 0.7)';
							break;				                
						case 'legend-chlorophylla':
							spectrumData = hortiCurve.map(row => row[4]);
							lineStyle = 'dashed';
							color = 'rgba(173, 0, 204, 0.7)';
							break;
						case 'legend-chlorophyllb':
							spectrumData = hortiCurve.map(row => row[5]);
							lineStyle = 'dashed';
							color = 'rgba(254, 0, 24, 0.7)';
							break;
						case 'legend-betaCarotene':
							spectrumData = hortiCurve.map(row => row[3]);
							lineStyle = 'dashed';
							color = 'rgba(255, 100, 0, 0.7)';
							break;
						case 'legend-melanopic':
							spectrumData = melanopicPhotopic.map(row => row[1]);
							lineStyle = 'dashed';
							color = 'rgba(255, 255, 0, 0.7)';
							break;
						case 'legend-photopic':
							spectrumData = melanopicPhotopic.map(row => row[2]);
							lineStyle = 'dashed';
							color = 'rgba(0, 255, 0, 0.7)';
							break;
						case 'legend-scotopic':
							spectrumData = melanopicPhotopic.map(row => row[3]);
							lineStyle = 'dashed';
							color = 'rgba(0, 255, 255, 0.7)';
							break;
						case 'legend-blueLightHazard':
							spectrumData = blueLightHazard.map(row => row[1]);
							lineStyle = 'dashed';
							color = 'rgba(0, 0, 255, 0.7)';
							break;
						default:
							return;
					}

					drawSpectrumCurve(spectrumData, lineStyle, color);
				}
			});

			// Draw coordinate axes
			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth   = 3;
			ctx.setLineDash([]); // Solid line

			ctx.beginPath();
			// x-axis
			ctx.moveTo(margin, height + margin);
			ctx.lineTo(width  + margin, height + margin);
			// y-axis
			ctx.moveTo(margin, height + margin);
			ctx.lineTo(margin, margin);
			ctx.stroke();

			// Tick-mark style
			const baseFontSizeXY = 12; // base font size at 800 px width
			const fontSizeXY     = Math.floor(baseFontSizeXY * scale);
			ctx.font        = `bold italic ${fontSizeXY}px Heiti SC`;
			ctx.fillStyle   = TLCI_TEXT;
			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth   = 2;

			// Draw x-axis tick marks
			for (let x = 380; x <= xMax; x += 50) {
				const canvasX = (x - xMin) / (xMax - xMin) * width + margin;

				// Major tick marks
				ctx.beginPath();
				ctx.moveTo(canvasX, height + margin);
				ctx.lineTo(canvasX, height + margin + Math.floor(8 * scale));
				ctx.stroke();

				// Tick labels
				ctx.fillText(x.toFixed(0), canvasX - Math.floor(14 * scale), height + margin + Math.floor(20 * scale));
			}

			// Draw y-axis tick marks
			for (let y = 0; y <= yMax; y += 0.1) {
				const canvasY = height - (y - yMin) / (yMax - yMin) * height + margin;

				// Major tick marks
				ctx.beginPath();
				ctx.moveTo(margin, canvasY);
				ctx.lineTo(margin - Math.floor(8 * scale), canvasY);
				ctx.stroke();

				// Tick labels
				ctx.fillText(y.toFixed(1), margin - Math.floor(30 * scale), canvasY + Math.floor(4 * scale));
			}
		}

		// Global smoothing and normalization function
		function normalizeAndSmooth() {
			const reducedRange = 2; // Set the smoothing range
			intensities.forEach((intensity, i) => {
				smoothCurve(i, intensity, reducedRange);
			});

			// Normalization processing
			intensities = normalizeSpectrum(intensities);

			// Redraw the curve
			drawSpectral();
		}

		// Smoothing function
		function smoothCurve(index, value, range = 5) {
			const maxSlope = 0.1; // Maximum first derivative

			// Temporarily store original values
			const originalValues = [...intensities];

			// Update the value at the current point
			intensities[index] = value;

			// Apply weighted adjustments to nearby points
			for (let i = Math.max(0, index - range); i <= Math.min(400, index + range); i++) {
				const distance = Math.abs(i - index);
				const weight = 1 - (distance / range); // The farther the distance, the smaller the weight
				intensities[i] = originalValues[i] * (1 - weight) + value * weight;
			}

			// Limit the first derivative to prevent spikes
			for (let i = Math.max(1, index - range); i <= Math.min(399, index + range); i++) {
				const slope = (intensities[i] - intensities[i - 1]) / 1;
				if (Math.abs(slope) > maxSlope) {
					intensities[i] = intensities[i - 1] + Math.sign(slope) * maxSlope;
				}
			}
		}

		// Get the actual canvas dimensions (accounting for CSS scaling)
		function getCanvasSize() {
			const style = getComputedStyle(canvasSpectral);
			return {
				width: parseInt(style.width),
				height: parseInt(style.height)
			};
		}

		// Spectral-chart mouse-interaction code
		function spectralCanvasInteraction() {
			// Get the rendering context
			const tooltip = document.getElementById('tooltip');
			const ctx = canvasSpectral.getContext('2d');
			
			// Chart parameters
			const margin = Math.floor(0.1 * canvasSpectral.height);
			const scale = canvasSpectral.width / 800;

			let dragging = false;
			let dragIndex = -1;

			canvasSpectral.addEventListener('mousedown', (e) => {
				const rect = canvasSpectral.getBoundingClientRect();
				const canvasSize = getCanvasSize();
				const scaleX = canvasSpectral.width / canvasSize.width;
				const scaleY = canvasSpectral.height / canvasSize.height;
				
				const x = (e.clientX - rect.left) * scaleX;
				const y = (e.clientY - rect.top) * scaleY;
				
				const width = canvasSpectral.width - 2 * margin;
				const height = canvasSpectral.height - 2 * margin;
				
				dragIndex = Math.max(0, Math.min(wavelengths.length - 1,
					Math.round(((x - margin) / width) * (wavelengths.length - 1))));
				dragging = true;
			});

			// Mouse-move event
			canvasSpectral.addEventListener('mousemove', (e) => {
				const rect = canvasSpectral.getBoundingClientRect();
				const canvasSize = getCanvasSize();
				const scaleX = canvasSpectral.width / canvasSize.width;
				const scaleY = canvasSpectral.height / canvasSize.height;
				
				const x = (e.clientX - rect.left) * scaleX;
				const y = (e.clientY - rect.top) * scaleY;
				
				const width = canvasSpectral.width - 2 * margin;
				const height = canvasSpectral.height - 2 * margin;
				
				// Display tooltip (length - 1 matches the drawing mapping so the tooltip
				// wavelength always matches the curve position under the cursor)
				const index = Math.round(((x - margin) / width) * (wavelengths.length - 1));
				
				if (index >= 0 && index < wavelengths.length) {
					const wavelength = wavelengths[index];
					const intensity = intensities[index];
					
					tooltip.style.display = 'block';
					tooltip.style.left = `${e.clientX + window.scrollX + 20}px`;
					tooltip.style.top = `${e.clientY + window.scrollY - 50}px`;
					tooltip.textContent = `Wavelength: ${wavelength} nm, Intensity: ${intensity.toFixed(2)}`;
				} else {
					tooltip.style.display = 'none';
				}
				
				// Handle dragging
				if (!dragging) return;
				
				const value = Math.max(0, Math.min(1, 1 - ((y - margin) / height)));
				smoothCurve(dragIndex, value);
				drawSpectral();
			});

			canvasSpectral.addEventListener('mouseup', () => {
				dragging = false;
			});

			canvasSpectral.addEventListener('mouseout', () => {
				tooltip.style.display = 'none';
				dragging = false;
			});
		}

		// Chromaticity-diagram mouse-interaction code
		function cieCanvasInteraction() {
			// Get the rendering context
			const margin = Math.floor(0.1 * canvasCie.width);
			// Coordinate range configuration
			const xMin = -0.05, xMax = 0.8;
			const yMin = 0, yMax = 0.85;
			const width = canvasCie.width - 2 * margin;
			const height = canvasCie.height - 2 * margin;
			// Mouse-move event (bound to the top-level canvas)
			coordinateCanvas.addEventListener('mousemove', (e) => {
				const tooltip = document.getElementById('tooltip');
				const rect = canvasCie.getBoundingClientRect();
				// Account for canvas scaling ratio (adapt to high-DPI screens)
				const scaleX = canvasCie.width / rect.width;
				const scaleY = canvasCie.height / rect.height;
				const pixelX = (e.clientX - rect.left) * scaleX  - margin;  // Subtract the left margin
				const pixelY = (e.clientY - rect.top) * scaleY  - margin;   // Subtract the top margin

				// Check if the mouse is within the plotting area
				if (pixelX >= 0 && pixelX <= width && pixelY >= 0 && pixelY <= height) {
					// Convert to CIE coordinates
					const cieX = xMin + (pixelX / width) * (xMax - xMin);
					const cieY = yMin + ((height - pixelY) / height) * (yMax - yMin);

					tooltip.style.display = 'block';
					tooltip.style.left = `${e.clientX + window.scrollX + 20}px`;
					tooltip.style.top = `${e.clientY + window.scrollY - 50}px`;
					tooltip.textContent = `x = ${cieX.toFixed(4)}, y = ${cieY.toFixed(4)}`;
				} else {
				tooltip.style.display = 'none';
				}
			});
		}

		// Load data pasted by the user
		// ==================== SPD library (external Excel/CSV, loaded on demand) ====================
		// The library file (TM30_SPD_Library.xlsx) is NOT embedded in this page; the user
		// loads it with the "Load Library" button and then picks a spectrum from the
		// drop-down, like the official IES TM-30 spectral calculator.
		// Expected sheet layout (single sheet): column A = Spectrum Name, column B = Group,
		// then one column per wavelength whose headers are the wavelength values (380...780).
		let spdLibrary = null; // [{ name, values:[401] }]

		function xmlText(str) {
			return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
				.replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
				.replace(/&x([0-9a-fA-F]+);/g, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&amp;/g, '&');
		}

		// Extract the XML parts of an .xlsx (a zip archive) without any external library:
		// the central directory is parsed manually and entries are inflated with the
		// browser-native DecompressionStream.
		async function parseXlsx(arrayBuffer) {
			const u8 = new Uint8Array(arrayBuffer);
			const dv = new DataView(arrayBuffer);
			let eocd = -1;
			for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) {
				if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
			}
			if (eocd < 0) throw new Error('Not a valid .xlsx (zip) file');
			const cdCount = dv.getUint16(eocd + 10, true);
			const cdOff = dv.getUint32(eocd + 16, true);
			const entries = {};
			let p = cdOff;
			for (let i = 0; i < cdCount; i++) {
				if (dv.getUint32(p, true) !== 0x02014b50) break;
				const method = dv.getUint16(p + 10, true);
				const compSize = dv.getUint32(p + 20, true);
				const nameLen = dv.getUint16(p + 28, true);
				const extraLen = dv.getUint16(p + 30, true);
				const cmtLen = dv.getUint16(p + 32, true);
				const lho = dv.getUint32(p + 42, true);
				const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen));
				entries[name] = { method, compSize, lho };
				p += 46 + nameLen + extraLen + cmtLen;
			}
			const extract = async name => {
				const e = entries[name];
				if (!e) return null;
				const dataStart = e.lho + 30 + dv.getUint16(e.lho + 26, true) + dv.getUint16(e.lho + 28, true);
				const data = u8.subarray(dataStart, dataStart + e.compSize);
				if (e.method === 0) return new TextDecoder().decode(data);
				const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
				return await new Response(stream).text();
			};
			// shared strings (cell type "s" indexes into this table)
			const shared = [];
			const ssXml = await extract('xl/sharedStrings.xml');
			if (ssXml) {
				const doc = new DOMParser().parseFromString(ssXml, 'application/xml');
				for (const si of doc.getElementsByTagName('si')) {
					let t = '';
					for (const el of si.getElementsByTagName('t')) t += el.textContent;
					shared.push(t);
				}
			}
			const sheetXml = await extract('xl/worksheets/sheet1.xml');
			if (!sheetXml) throw new Error('sheet1.xml not found in the workbook');
			const doc = new DOMParser().parseFromString(sheetXml, 'application/xml');
			const colIndex = ref => {
				let n = 0;
				for (const ch of ref) {
					if (ch >= 'A' && ch <= 'Z') n = n * 26 + (ch.charCodeAt(0) - 64);
					else if (ch >= 'a' && ch <= 'z') n = n * 26 + (ch.charCodeAt(0) - 96);
					else break;
				}
				return n - 1;
			};
			const grid = [];
			for (const row of doc.getElementsByTagName('row')) {
				const cells = {};
				for (const c of row.getElementsByTagName('c')) {
					const type = c.getAttribute('t');
					let v = '';
					if (type === 'inlineStr') {
						const is = c.getElementsByTagName('is')[0];
						if (is) for (const el of is.getElementsByTagName('t')) v += el.textContent;
					} else {
						const vEl = c.getElementsByTagName('v')[0];
						if (vEl) v = vEl.textContent;
						if (type === 's') v = shared[+v] ?? '';
					}
					cells[colIndex(c.getAttribute('r') || '')] = v;
				}
				grid.push(cells);
			}
			return grid;
		}

		async function loadSpdLibrary(file) {
			let records = [];
			if (/\.csv$/i.test(file.name)) {
				const lines = (await file.text()).split(/[\r\n]+/).filter(l => l.trim());
				const header = lines[0].split(',');
				const startCol = header.findIndex(h => parseFloat(h) === 380);
				if (startCol < 0) throw new Error('No "380" wavelength column found in the header row');
				for (const line of lines.slice(1)) {
					const cells = line.split(',');
					const values = cells.slice(startCol, startCol + 401).map(parseFloat);
					if (cells[0] && values.length === 401 && values.every(v => !isNaN(v))) {
						records.push({ name: cells[0].replace(/^"|"$/g, ''), values });
					}
				}
			} else {
				const grid = await parseXlsx(await file.arrayBuffer());
				if (!grid.length) throw new Error('The workbook has no data rows');
				// locate the wavelength value columns from the header row (first "380" cell)
				let startCol = -1, nameCol = 0;
				for (const [idx, v] of Object.entries(grid[0])) {
					if (parseFloat(v) === 380) { startCol = +idx; break; }
				}
				if (startCol < 0) throw new Error('No "380" wavelength column found in the header row');
				for (const cells of grid.slice(1)) {
					const name = (cells[nameCol] || '').trim();
					const values = [];
					for (let j = 0; j < 401; j++) {
						const v = parseFloat(cells[startCol + j]);
						if (isNaN(v)) { values.length = 0; break; }
						values.push(v);
					}
					if (name && values.length === 401) records.push({ name, values });
				}
			}
			if (!records.length) throw new Error('No valid spectra found (each row needs a name and 401 values starting at 380 nm)');
			return records;
		}

		document.getElementById('libFile').addEventListener('change', async e => {
			const file = e.target.files[0];
			if (!file) return;
			try {
				spdLibrary = await loadSpdLibrary(file);
				const sel = document.getElementById('libSelect');
				sel.innerHTML = '<option value="">Choose a SPD (' + spdLibrary.length + ' available)</option>';
				for (const rec of spdLibrary) {
					const opt = document.createElement('option');
					opt.value = rec.name;
					opt.textContent = rec.name;
					sel.appendChild(opt);
				}
				sel.disabled = false;
			} catch (err) {
				alert('Failed to load the SPD library: ' + err.message);
			}
			e.target.value = ''; // allow re-loading the same file
		});

		document.getElementById('libSelect').addEventListener('change', e => {
			const name = e.target.value;
			if (!name || !spdLibrary) return;
			const rec = spdLibrary.find(r => r.name === name);
			if (!rec) return;
			document.getElementById('spectrum').value = rec.values.map(v => +v.toFixed(6)).join('\n');
			// Recompute everything, not just the spectrum plot: loadData() alone
			// only re-reads the textarea, so the results panel would keep showing
			// the previous spectrum's numbers.
			calculate();
		});

		// Flexible spectral-data parser for the input box.
		// Accepted layouts (comma / space / tab separators, any line layout):
		//  1) two columns per line: wavelength + intensity (wavelengths may be
		//     non-integer; values are linearly interpolated onto integer nm)
		//  2) one column of values:
		//     - exactly 401 values  -> 380-780 nm @ 1 nm directly
		//     - any other count (>=2) -> first value = 380 nm, last = 780 nm,
		//       intermediate integer wavelengths are linearly interpolated
		// Data outside 380-780 nm is dropped; missing ranges are padded with 0.
		function parseSpectralInput(raw) {
			const lines = raw.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length);
			if (!lines.length) return { ok: false, error: 'The input box is empty.' };
			const tokenLines = lines.map(l => l.split(/[\s,;\t]+/).filter(t => t.length));
			const num = t => { const v = parseFloat(t); return isNaN(v) ? null : v; };

			let values;
			// single-column mode: one value per line, or everything on one line
			const singleColumn = tokenLines.length === 1 || tokenLines.every(tl => tl.length === 1);
			if (singleColumn) {
				const vals = [];
				for (const tl of tokenLines) {
					for (const t of tl) {
						const v = num(t);
						if (v === null) return { ok: false, error: 'Non-numeric value found in the single-column data.' };
						vals.push(v);
					}
				}
				if (vals.length === 401) {
					values = vals; // 380-780 nm @ 1 nm directly
				} else if (vals.length >= 2) {
					// spread evenly: first = 380 nm, last = 780 nm
					const step = 400 / (vals.length - 1);
					values = [];
					for (let wl = 380; wl <= 780; wl++) {
						const pos = (wl - 380) / step;
						const i = Math.min(Math.floor(pos), vals.length - 2);
						const f = pos - i;
						values.push(vals[i] * (1 - f) + vals[i + 1] * f);
					}
				} else {
					return { ok: false, error: 'A single value cannot define a spectrum. Provide at least two values.' };
				}
			} else {
				// two-column mode: wavelength + intensity per line
				const pts = [];
				for (const tl of tokenLines) {
					if (tl.length < 2) return { ok: false, error: 'Two-column data rows need both a wavelength and a value (found a row with a single number).' };
					const w = num(tl[0]), v = num(tl[1]);
					if (w === null || v === null) return { ok: false, error: 'Non-numeric wavelength or value found in the two-column data.' };
					pts.push([w, v]);
				}
				pts.sort((a, b) => a[0] - b[0]);
				if (pts.length < 2) return { ok: false, error: 'At least two data points are required.' };
				values = [];
				let k = 0;
				for (let wl = 380; wl <= 780; wl++) {
					while (k < pts.length - 2 && pts[k + 1][0] < wl) k++; // advance bracket
					if (wl < pts[0][0] || wl > pts[pts.length - 1][0]) {
						values.push(0); // outside the provided range -> pad with 0
					} else if (pts[k + 1][0] === pts[k][0]) {
						values.push(pts[k][1]);
					} else {
						const f = (wl - pts[k][0]) / (pts[k + 1][0] - pts[k][0]);
						values.push(pts[k][1] * (1 - f) + pts[k + 1][1] * f);
					}
				}
			}
			return { ok: true, values };
		}

		function loadData() {
			const result = parseSpectralInput(document.getElementById('spectrum').value);
			if (!result.ok) {
				alert('Invalid spectral data: ' + result.error);
				return false;
			}
			// Normalize the data so the maximum value equals 1
			intensities = normalizeSpectrum(result.values);
			// Set values less than 0 to 0
			intensities = intensities.map(v => Math.max(0, v));
			// Clear the canvas when loading new data
			drawSpectral(true);
			return true;
		}

		// Simpson's rule numerical numerical integration function
		function numericalSum(arr, fn) {
			const n = arr.length - 1; // Interval number
			const sum = arr.reduce((acc, value, i) => {
				if (i === 0 || i === n) {
					return acc + fn(value, i);
				} else {
					const factor = (i % 2 === 0) ? 2 : 4; // Multiply even terms by 2 and odd terms by 4
					return acc + factor * fn(value, i);
				}
			}, 0);

			return (1 / 3) * sum;
		}

		// Calculate the CIE 1931 tristimulus values, chromaticity coordinates, and normalization coefficient for the 2° visual field of the spectrum
		function lightSourceCoordinate(spectrum) {
			const k = 100 / numericalSum(triStimulusValues, (val, i) => spectrum[i] * val[2]);
			const xCapital = k * numericalSum(triStimulusValues, (val, i) => spectrum[i] * val[1]);
			const yCapital = 100;
			const zCapital = k * numericalSum(triStimulusValues, (val, i) => spectrum[i] * val[3]);

			const x = xCapital / (xCapital + yCapital + zCapital);
			const y = yCapital / (xCapital + yCapital + zCapital);

			return { xCapital, yCapital, zCapital, x, y, k };
		}

		// Calculate the tristimulus values and normalization coefficient for the 10° visual field of the spectrum
		function lightSourceStimulus(spectrum) {
			const k = 100 / numericalSum(triStimulusValues10, (val, i) => spectrum[i] * val[2]);
			const xCapital = k * numericalSum(triStimulusValues10, (val, i) => spectrum[i] * val[1]);
			const yCapital = 100;
			const zCapital = k * numericalSum(triStimulusValues10, (val, i) => spectrum[i] * val[3]);

			return { xCapital, yCapital, zCapital, k };
		}

		// Calculate the chromaticity coordinates of the color sample
		function colorSampleCoordinate(colorSample, spectrum, k = 1) {
			// Calculate the tristimulus values
			const xCapital = k * numericalSum(triStimulusValues, (val, i) => colorSample[i] * spectrum[i] * val[1]);
			const yCapital = k * numericalSum(triStimulusValues, (val, i) => colorSample[i] * spectrum[i] * val[2]);
			const zCapital = k * numericalSum(triStimulusValues, (val, i) => colorSample[i] * spectrum[i] * val[3]);

			// Calculate the chromaticity coordinates
			const x = xCapital / (xCapital + yCapital + zCapital);
			const y = yCapital / (xCapital + yCapital + zCapital);

			return { x, y, X: xCapital, Y: yCapital, Z: zCapital };
		}

		// Convert CIE 1931 chromaticity coordinates to CIE 1960 chromaticity coordinates
		function cie1931ToCie1960(x, y) {
			// Calculate the CIE 1960 chromaticity coordinates u and v
			const u = 4 * x / (-2 * x + 12 * y + 3);
			const v = 6 * y / (-2 * x + 12 * y + 3);
			return [u, v];
		}

		// Calculate the correlated color temperature (CCT)
		function correlatedColorTemperature(xt, yt) {
			const [ut, vt] = cie1931ToCie1960(xt, yt);
			// Use the distance function to calculate the separation
			const deltaC = cct_uv.map(([u, v]) => distance(ut, vt, u, v));
			const n = deltaC.indexOf(Math.min(...deltaC));
			if (deltaC[n] > 0.05) {
				return -1;
			}
			return blackBodyLocus[n][0];
		}

		// Generate the blackbody spectrum of a specific color temperature and perform normalization processing
		function generateBlackbodySpectrum(cct) {
			if (cct === -1) cct = 4000;
			// Define two intermediate constants
			const a = 2 * Math.PI * h * c ** 2;
			const b = h * c / k;
			// Calculate the blackbody spectrum using the global variable wavelengths
			const pLambda = wavelengths.map(wl => a * Math.pow(wl * 1e-9, -5) / (Math.exp(b / (wl * 1e-9 * cct)) - 1));
			// Normalize the spectrum
			return normalizeSpectrum(pLambda);
		}

		// Calculate the reconstructed daylight spectrum of a given color temperature and perform normalization processing
		function composedDaylight(cct) {
			let xd;
			if (cct > 25000) {
				xd = 0.250;
			} else if (cct > 7000) {
				xd = -2.0064e9 / cct ** 3 + 1.9018e6 / cct ** 2 + 0.24748e3 / cct + 0.237040;
			} else if (cct >= 4000) {
				xd = -4.6070e9 / cct ** 3 + 2.9678e6 / cct ** 2 + 0.09911e3 / cct + 0.244063;
			} else {
				xd = 0.380;
			}
			const yd = -3.000 * xd ** 2 + 2.870 * xd - 0.275;

			const denominator = 0.0241 + 0.2562 * xd - 0.7341 * yd;
			const m1 = (-1.3515 - 1.7703 * xd + 5.9114 * yd) / denominator;
			const m2 = (0.0300 - 31.4424 * xd + 30.0717 * yd) / denominator;

			const spectrum = compositeDaylightVector.map(row => row[1] + m1 * row[2] + m2 * row[3]);

			// Normalize the spectrum
			return normalizeSpectrum(spectrum);
		}

		// Calculate the spectrum of the mixed reference light source with a color temperature ranging from 4000K to 5000K (for TM-30 calculation)
		function mixBlackbodyDaylight(cct) {
			const tb = 4000;
			const te = 5000;

			// Generate the blackbody spectrum
			const srp = generateBlackbodySpectrum(cct);
			// Generate the reconstructed daylight spectrum
			const srd = composedDaylight(cct);

			// Calculate the normalization coefficient
			const srpIntegral = numericalSum(srp, (val, i) => val * triStimulusValues[i][2]);
			const srdIntegral = numericalSum(srd, (val, i) => val * triStimulusValues[i][2]);

			// Normalization processing
			const normalizedSrp = srp.map(val => val * (100 / srpIntegral));
			const normalizedSrd = srd.map(val => val * (100 / srdIntegral));

			// Calculate the mixed spectrum
			const mixedSpectrum = normalizedSrp.map((val, i) => ((cct - tb) / (te - tb)) * normalizedSrd[i] + ((te - cct) / (te - tb)) * normalizedSrp[i]);

			// Normalize the spectrum
			return normalizeSpectrum(mixedSpectrum);
		}

		// Generate the reference spectrum (blackbody, reconstructed daylight, or mixed spectrum) of a specific color temperature
		function generateTM30Spectrum(cct) {
			if (cct === -1) cct = 4000;
			if (cct <= 4000) {
				// Generate the blackbody spectrum
				return generateBlackbodySpectrum(cct);
			} else if (cct >= 5000) {
				// Generate the reconstructed daylight spectrum
				return composedDaylight(cct);
			} else {
				// Generate the mixed spectrum (4000 K < CCT < 5000 K)
				return mixBlackbodyDaylight(cct);
			}
		}

		// Calculate the required parameters for the color adaptation shift of the color rendering index
		function colorAdaptShift(u, v) {
			// Calculate c and d using Formula (1-258) from Selection and Evaluation of LED Devices
			const c = (4 - u - 10 * v) / v;
			const d = (1.708 * v + 0.404 - 1.481 * u) / v;
			return [c, d];
		}

		// Color Rendering Index Calculation Function
		function colorRenderingIndex(testingSpectrum) {
			// Calculate the chromaticity coordinates and normalization coefficient kt of the test spectrum
			const { x: xt, y: yt, k: kt } = lightSourceCoordinate(testingSpectrum);

			// Calculate the correlated color temperature Tc of the light source under test
			const cct = correlatedColorTemperature(xt, yt);

			// Determine the reference illuminant based on the color temperature of the light source under test
			const referenceSpectrum = cct <= 5000 ? generateBlackbodySpectrum(cct) : composedDaylight(cct);

			// Calculate the chromaticity coordinates and normalization coefficient kr of the reference illuminant
			const { x: xr, y: yr, k: kr } = lightSourceCoordinate(referenceSpectrum);

			const sampleNumber = 15;
			const xti = new Array(sampleNumber).fill(0);
			const yti = new Array(sampleNumber).fill(0);
			const yCapitalTi = new Array(sampleNumber).fill(0);
			const xri = new Array(sampleNumber).fill(0);
			const yri = new Array(sampleNumber).fill(0);
			const yCapitalRi = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				const colorSample = colorSampleReflectance.map(row => row[i + 1]);
				const { x: xti_i, y: yti_i, Y: yCapitalTi_i } = colorSampleCoordinate(colorSample, testingSpectrum, kt);
				const { x: xri_i, y: yri_i, Y: yCapitalRi_i } = colorSampleCoordinate(colorSample, referenceSpectrum, kr);

				xti[i] = xti_i;
				yti[i] = yti_i;
				yCapitalTi[i] = yCapitalTi_i;
				xri[i] = xri_i;
				yri[i] = yri_i;
				yCapitalRi[i] = yCapitalRi_i;
			}

			// Convert the chromaticity coordinates of the light source under test, reference illuminant, and color samples to CIE 1960 chromaticity coordinates
			const [ut, vt] = cie1931ToCie1960(xt, yt);
			const [ur, vr] = cie1931ToCie1960(xr, yr);

			const uti = new Array(sampleNumber).fill(0);
			const vti = new Array(sampleNumber).fill(0);
			const uri = new Array(sampleNumber).fill(0);
			const vri = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				const [uti_i, vti_i] = cie1931ToCie1960(xti[i], yti[i]);
				const [uri_i, vri_i] = cie1931ToCie1960(xri[i], yri[i]);

				uti[i] = uti_i;
				vti[i] = vti_i;
				uri[i] = uri_i;
				vri[i] = vri_i;
			}

			// Calculate the chromatic adaptation chromaticity shift correction using Equations (1-257) and (1-258) from "LED Device Selection and Evaluation"
			const [ct, dt] = colorAdaptShift(ut, vt);
			const [cr, dr] = colorAdaptShift(ur, vr);

			const cti = new Array(sampleNumber).fill(0);
			const dti = new Array(sampleNumber).fill(0);
			const upti = new Array(sampleNumber).fill(0);
			const vpti = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				const [cti_i, dti_i] = colorAdaptShift(uti[i], vti[i]);

				cti[i] = cti_i;
				dti[i] = dti_i;

				upti[i] = (10.872 + 0.404 * cr / ct * cti_i - 4 * dr / dt * dti_i) /
							(16.518 + 1.481 * cr / ct * cti_i - dr / dt * dti_i);
				vpti[i] = 5.520 / (16.518 + 1.481 * cr / ct * cti_i - dr / dt * dti_i);
			}

			// Calculate the CIE 1964 color difference W*U*V* using Equation (1-259) from "LED Device Selection and Evaluation
			const wati = new Array(sampleNumber).fill(0);
			const uati = new Array(sampleNumber).fill(0);
			const vati = new Array(sampleNumber).fill(0);
			const wari = new Array(sampleNumber).fill(0);
			const uari = new Array(sampleNumber).fill(0);
			const vari = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				wati[i] = 25 * Math.pow(yCapitalTi[i], 1 / 3) - 17;
				uati[i] = 13 * wati[i] * (upti[i] - ur);
				vati[i] = 13 * wati[i] * (vpti[i] - vr);

				wari[i] = 25 * Math.pow(yCapitalRi[i], 1 / 3) - 17;
				uari[i] = 13 * wari[i] * (uri[i] - ur);
				vari[i] = 13 * wari[i] * (vri[i] - vr);
			}

			// Calculate the color difference ΔE using Equation (1-259) and the special color rendering index Ri using Equation (1-246) from "LED Device Selection and Evaluation"
			const deltaEi = new Array(sampleNumber).fill(0);
			const ri = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				deltaEi[i] = Math.sqrt(
					Math.pow(wari[i] - wati[i], 2) +
					Math.pow(uari[i] - uati[i], 2) +
					Math.pow(vari[i] - vati[i], 2)
				);

				ri[i] = 100 - 4.6 * deltaEi[i];
			}

			// Calculate the general color rendering index Ra using Equation (1-247) from "LED Device Selection and Evaluation"
				let raSum = 0;
				for (let i = 0; i < 8; i++) {
					raSum += ri[i];
				}
				const ra = raSum / 8;
			
			// Calculate the special color rendering index Re
				let reSum = 0;
				for (let i = 0; i < 15; i++) {
					reSum += ri[i];
				}
				const re = reSum / 15;

			return [ra, re, ri];
		}

		// Function to calculate luminous efficacy
		function calculateEfficacy(spectrum, wpe = 60) {
			// Calculate the inner product of the spectrum and the second column of the color matching function (luminous flux)
			const numerator = numericalSum(spectrum, (val, i) => val * triStimulusValues[i][2]);
			// Calculate the integral of the spectrum itself (i.e., radiant power)
			const denominator = numericalSum(spectrum, v => v);
			// Calculate luminous efficacy considering WPE  
			return (683 * numerator) / denominator * (wpe / 100);
		}

		// Function to calculate MPR and MEDR
		function calculateMPR(spectrum) {
			// Calculate melanopic flux
			const melanopicFlux = 832 * numericalSum(spectrum, (val, i) => val * melanopicPhotopic[i][1]);
			// Calculate luminous flux
			const photopicFlux = 683 * numericalSum(spectrum, (val, i) => val * melanopicPhotopic[i][2]);
			// Calculate MPR
			const MPR = melanopicFlux / photopicFlux
			// Calculate MEDR
			const MEDR = MPR / 832 * 1000 / 1.326
			return [MPR, MEDR];
		}

		// Calculate SP Ratio for street lighting
		function calculateSPR(spectrum) {
			// Calculate scotopic luminous flux 
			const scotopicFlux = 1700 * numericalSum(spectrum, (val, i) => val * melanopicPhotopic[i][3]);
			// Calculate photopic luminous flux
			const photopicFlux = 683 * numericalSum(spectrum, (val, i) => val * melanopicPhotopic[i][2]);
			// Calculate SPR
			const SPR = scotopicFlux / photopicFlux
			return SPR;
		}

		// Calculate the spectral fitting coefficient GFC
		// (per Chinese full-spectrum certification specs CTC0001-2023 / Solar-like Spectrum Evaluation Specification):
		// GFC = |Σ S_test·S_ref dλ| / ( (Σ S_test² dλ)^(1/2) · (Σ S_ref² dλ)^(1/2) )   (cosine similarity)
		// GFC ≥ 0.995 acceptable, ≥ 0.999 good (Hernández-Andrés et al.)
		function calculateGFC(spectrum, cct) {
			// Target spectrum per TM-30 3.3 reference: blackbody ≤ 4000 K, daylight ≥ 5000 K, blend between
			const ref = cct === -1 ? generateTM30Spectrum(4000) : generateTM30Spectrum(cct);
			// Cosine similarity between the test and target spectra (both on the 380-780 nm / 1 nm grid)
			const dot = numericalSum(spectrum, (val, i) => val * ref[i]);
			const normTest = Math.sqrt(numericalSum(spectrum, val => val * val));
			const normRef = Math.sqrt(numericalSum(ref, val => val * val));
			return dot / (normTest * normRef);
		}

		// Calculate the Spectral Similarity Index (SSI) per the Academy of Motion Picture Arts and
		// Sciences specification S-2019-001 (ANSI/AMPAS ST 422), using the blackbody spectrum at the
		// test source CCT as the reference illuminant:
		// 1) interpolate both SPDs to 1 nm from 375 to 675 nm (zero-padded below 380 nm);
		// 2) integrate into 10 nm bins (30 samples) and normalize each to unity total power;
		// 3) relative difference vector = (test - ref) / (ref + 1/30);
		// 4) weight it, pad one zero at each end (32 values), convolve with {0.22, 0.56, 0.22};
		// 5) SSI = round(100 - 32 · ||smoothed vector||)
		function calculateSSI(spectrum, cct) {
			if (cct === -1) cct = 4000;
			const ref = generateBlackbodySpectrum(cct);
			// 1 nm samples from 375 to 675 nm (test input starts at 380 nm, so 375-379 nm = 0)
			const to1nm = spd => {
				const arr = [];
				for (let lam = 375; lam <= 675; lam++) {
					arr.push(lam < 380 ? 0 : spd[lam - 380]);
				}
				return arr;
			};
			const test1 = to1nm(spectrum);
			const ref1 = to1nm(ref);
			// 2) integrate into 10 nm bins and normalize to unity
			const bin = arr => {
				const b = [];
				for (let i = 0; i < 30; i++) {
					let s = 0;
					for (let j = 0; j < 10; j++) s += arr[i * 10 + j];
					b.push(s);
				}
				const total = b.reduce((a, v) => a + v, 0);
				return b.map(v => v / total);
			};
			const t = bin(test1);
			const r = bin(ref1);
			// 3) relative difference vector
			const relDiff = t.map((v, k) => (v - r[k]) / (r[k] + 1 / 30));
			// 4) spectral weighting (5 taper values at the short end, 1 elsewhere)
			const weights = [4 / 15, 22 / 45, 32 / 45, 8 / 9, 44 / 45];
			const weighted = relDiff.map((v, k) => v * (k < weights.length ? weights[k] : 1));
			// pad one zero at each end → 32 values, then convolve with {0.22, 0.56, 0.22} → 30 values
			const padded = [0, ...weighted, 0];
			const smoothed = [];
			for (let i = 0; i < 30; i++) {
				smoothed.push(0.22 * padded[i] + 0.56 * padded[i + 1] + 0.22 * padded[i + 2]);
			}
			// 5) vector magnitude → SSI
			const magnitude = Math.sqrt(smoothed.reduce((a, v) => a + v * v, 0));
			return Math.round(100 - 32 * magnitude);
		}

		// Calculate blue light content G-Index
		function calculateGindex(spectrum) {
			// Calculate the total blue light below 500 nm
			const blueLight = spectrum.slice(0, 121).reduce((acc, curr) => acc + curr, 0);
			// Calculate photopic luminous flux
			const photopicFlux = numericalSum(spectrum, (val, i) => val * melanopicPhotopic[i][2]);
			// Calculate G-Index
			const G_Index = -2.5 * Math.log10(blueLight / photopicFlux);
			return G_Index;
		}

		// Calculate blue light content such as P500, P520, P560, etc.
		function blueContentBelow(spectrum, cutoffNm) {
			const startNm = 380;
			const endIndex = cutoffNm - startNm + 1;
			const blue = spectrum.slice(0, endIndex).reduce((a, v) => a + v, 0);
			const totalPower = spectrum.reduce((a, v) => a + v, 0);
			return blue / totalPower;
		}

		// Calculate blue light hazard index Kb,v
		function calculateKbv(spectrum) {
			// Calculate the radiant flux weighted by blue light hazard
			const blueFlux = numericalSum(spectrum, (val, i) => val * blueLightHazard[i][1]);
			// Calculate photopic luminous flux 
			const photopicFlux = 683 * numericalSum(spectrum, (val, i) => val * melanopicPhotopic[i][2]);
			// Calculate Kb,v 
			const Kbv = blueFlux / photopicFlux;
			return Kbv;
		}

		// Calculate horticulture lighting
		function calculateHortiData(spectrum, wpe = 60) {
			// Calculate electrical power
			const radiationPower = numericalSum(spectrum, v => v) / wpe * 100;
			// Calculate intermediate quantity
			const radiationData = h * c * na * radiationPower;
			// Calculate PPF/W
			// Create a copy of the spectrum
			let spectrumPPF = spectrum.slice(); // Use slice() to create a copy
			for (let i = 0; i < 20; i++) {
				spectrumPPF[i] = 0; // Set 380–399 nm to zero
			}
			for (let i = spectrumPPF.length - 80; i < spectrumPPF.length; i++) {
				spectrumPPF[i] = 0; // Set 701–780 nm to zero
			}
			const ppfPerWatt = 1e-3 * numericalSum(spectrumPPF, (val, i) => val * hortiCurve[i][0]) / radiationData;
			// Calculate BPF/W
			const bpfPerWatt = 1e-3 * numericalSum(spectrum, (val, i) => val * hortiCurve[i][0]) / radiationData;
			// Calculate YPF/W
			const ypfPerWatt = 1e-3 * numericalSum(spectrum, (val, i) => val * hortiCurve[i][0] * hortiCurve[i][1]) / radiationData;
			// Calculate DIN/W
			const dinPerWatt = 1e-3 * numericalSum(spectrum, (val, i) => val * hortiCurve[i][0] * hortiCurve[i][2]) / radiationData;
			
			return [ppfPerWatt, bpfPerWatt, ypfPerWatt, dinPerWatt];
		}

		// Calculate photon (PPF) band ratios and RGB percentages
		// Photon count at each wavelength is proportional to spectral power x wavelength
		function calculatePhotonBands(spectrum) {
			// Relative photon flux per nm
			const photons = spectrum.map((v, i) => v * (380 + i));
			// Sum photons within [a, b) nm
			const band = (a, b) => {
				let s = 0;
				for (let i = Math.max(0, a - 380); i < Math.min(spectrum.length, b - 380); i++) s += photons[i];
				return s;
			};
			const uv = band(380, 400);
			const blue = band(400, 500);
			const green = band(500, 600);
			const red = band(600, 700);
			const fr = band(700, 780);
			const total = uv + blue + green + red + fr;
			return {
				rb: red / blue,
				rfr: red / fr,
				bluePct: blue / total * 100,
				greenPct: green / total * 100,
				redPct: red / total * 100
			};
		}

		// Function to calculate COI
		function calculateCOI(spectrum) {
			// Reference light source's CIE Lab chromaticity coordinates (4000K blackbody radiator)
			const L100_ref = 30.4;
			const a100_ref = 57.0;
			const b100_ref = 28.6;
			const L50_ref = 19.8;
			const a50_ref = 26.9;
			const b50_ref = 7.8;

			// Initialize variables
			let X100 = 0, Y100 = 0, Z100 = 0;
			let X50 = 0, Y50 = 0, Z50 = 0;
			let Xs = 0, Ys = 0, Zs = 0;

			// Extract spectral data at 5 nm intervals
			for (let i = 0; i < COIdata.length; i++) {
				const wavelength = COIdata[i][0];
				const x = COIdata[i][1];
				const y = COIdata[i][2];
				const z = COIdata[i][3];
				const R100 = COIdata[i][4];
				const R50 = COIdata[i][5];
				
				// Find the corresponding spectral intensity
				const index = wavelength - 380;
				const intensity = spectrum[index];

				// Calculate tristimulus values, multiply by wavelength interval (Δλ = 5)
				X100 += intensity * R100 * x * 5;
				Y100 += intensity * R100 * y * 5;
				Z100 += intensity * R100 * z * 5;

				X50 += intensity * R50 * x * 5;
				Y50 += intensity * R50 * y * 5;
				Z50 += intensity * R50 * z * 5;
				
				Xs += intensity * x * 5;
				Ys += intensity * y * 5;
				Zs += intensity * z * 5;
			}

			// Calculate CIE Lab chromaticity coordinates
			const L100 = 116 * Math.cbrt(Y100 / Ys) - 16;
			const a100 = 500 * (Math.cbrt(X100 / Xs) - Math.cbrt(Y100 / Ys));
			const b100 = 200 * (Math.cbrt(Y100 / Ys) - Math.cbrt(Z100 / Zs));

			const L50 = 116 * Math.cbrt(Y50 / Ys) - 16;
			const a50 = 500 * (Math.cbrt(X50 / Xs) - Math.cbrt(Y50 / Ys));
			const b50 = 200 * (Math.cbrt(Y50 / Ys) - Math.cbrt(Z50 / Zs));

			// Calculate color difference
			const deltaE100 = Math.sqrt(Math.pow(L100 - L100_ref, 2) + Math.pow(a100 - a100_ref, 2) + Math.pow(b100 - b100_ref, 2));
			const deltaE50 = Math.sqrt(Math.pow(L50 - L50_ref, 2) + Math.pow(a50 - a50_ref, 2) + Math.pow(b50 - b50_ref, 2));

			// Calculate COI
			const COI = (deltaE100 + deltaE50) / 2;

			return COI;
		}

		// Calculate the tristimulus values of TM-30 color samples under the light source illumination
		function colorSampleStimulus(colorSample, spectrum, k = 1) {
			// Calculate tristimulus values            
			const xCapital = k * numericalSum(triStimulusValues10, (val, i) => colorSample[i] * spectrum[i] * val[1]);
					const yCapital = k * numericalSum(triStimulusValues10, (val, i) => colorSample[i] * spectrum[i] * val[2]);
					const zCapital = k * numericalSum(triStimulusValues10, (val, i) => colorSample[i] * spectrum[i] * val[3]);

			return [xCapital, yCapital, zCapital];
		}

		// Calculate tristimulus values for all TM-30 color samples
		function calculateAllColorSamplesStimulus(cesReflectance, spectrum) {
			// Calculate the normalization coefficient k of the light source firstly
			const { k } = lightSourceStimulus(spectrum);

			const results = [];
			for (let i = 1; i < cesReflectance[0].length; i++) {
				const colorSample = cesReflectance.map(row => row[i]);
				const [x10, y10, z10] = colorSampleStimulus(colorSample, spectrum, k);
				results.push([x10, y10, z10]);
			}
			return results;
		}

		// Von Kries chromatic adaptation
		function vonKriesAdapt(r, g, b, rw, gw, bw) {
			const rc = 100 * r / rw;
			const gc = 100 * g / gw;
			const bc = 100 * b / bw;
			return [rc, gc, bc];
		}

		// Convert XYZ to CAT02 RGB 
		function xyzToRgb(x, y, z) {
			const mcat02 = [
				[0.7328, 0.4296, -0.1624],
				[-0.7036, 1.6975, 0.0061],
				[0.0030, 0.0136, 0.9834]
			];

			const xyz = [x, y, z];
			const rgb = matrixMultiply(mcat02, xyz);
			return [rgb[0], rgb[1], rgb[2]];
		}

		// Convert CAT02 RGB to XYZ
		function rgbToXyz(r, g, b) {
			const m1cat02 = [
				[1.096124, -0.278869, 0.182745],
				[0.454369, 0.473533, 0.072098],
				[-0.009628, -0.005698, 1.015326]
			];

			const rgb = [r, g, b];
			const xyz = matrixMultiply(m1cat02, rgb);
			return [xyz[0], xyz[1], xyz[2]];
		}

		// Hunt-Pointer-Estevez transform
		function huntPointerEstevez(x, y, z) {
			const hpe = [
				[0.38971, 0.68898, -0.07868],
				[-0.22981, 1.18340, 0.04641],
				[0, 0, 1]
			];

			const xyz = [x, y, z];
			const rpgpbp = matrixMultiply(hpe, xyz);
			return [rpgpbp[0], rpgpbp[1], rpgpbp[2]];
		}

		// Luminance adaptation
		function luminanceAdaptation(rp, gp, bp) {
			const fl = 0.7937;
			const ra = 400 * (fl * rp / 100) ** 0.42 / (27.13 + (fl * rp / 100) ** 0.42) + 0.1;
			const ga = 400 * (fl * gp / 100) ** 0.42 / (27.13 + (fl * gp / 100) ** 0.42) + 0.1;
			const ba = 400 * (fl * bp / 100) ** 0.42 / (27.13 + (fl * bp / 100) ** 0.42) + 0.1;
			return [ra, ga, ba];
		}

		// Calculate chromaticity and achromatic response
		function channelAb(r, g, b) {
			const aw = r - 12 / 11 * g + 1 / 11 * b;
			const bw = 1 / 9 * (r + g - 2 * b);
			const aW = 1.0003 * (2 * r + g + 1 / 20 * b - 0.305);
			return [aw, bw, aW];
		}

		// Helper function: matrix multiplication
		function matrixMultiply(matrix, vector) {
			const result = [];
			for (let i = 0; i < matrix.length; i++) {
				let sum = 0;
				for (let j = 0; j < vector.length; j++) {
					sum += matrix[i][j] * vector[j];
				}
				result.push(sum);
			}
			return result;
		}

		// Calculate hue bin angle
		function countHueAngle(hueAngle = new Array(99).fill(0)) {
			// Use the map method to calculate the bin number for each hue angle 
			return hueAngle.map(angle => Math.floor(angle / 22.5) + 1);
		}

		// Calculate the area of a polygon (calculate color gamut)
		function polygonArea(a, b) {
			// Ensure the input arrays a and b have the same length 
			if (a.length !== b.length) {
				throw new Error("The lengths of the input arrays a and b must be the same");
			}

			// Get the length of the array  
			const n = a.length;

			// Concatenate arrays a and b end to end
			a = a.concat(a[0]);
			b = b.concat(b[0]);

			let area = 0;
			for (let i = 0; i < n; i++) {
				area += a[i] * b[i + 1] - a[i + 1] * b[i];
			}
			area = 0.5 * Math.abs(area);
			return area;
		}
		
		// Fixed TM-30 graphic palette: computed once by running the full TM-30
		// pipeline with the test spectrum equal to a fixed D65 illuminant, so the
		// 99 CES bar colours and the 16 hue-bin wedge colours never depend on the
		// user's input spectrum
		let tm30FixedColorCache = null;
		function getTm30FixedGraphicColors() {
			if (!tm30FixedColorCache) {
				const d65 = generateTM30Spectrum(6500);
				const result = calculateTM30(d65, true);
				tm30FixedColorCache = { cesColors: result[11], binColors: result[12] };
			}
			return tm30FixedColorCache;
		}

		// Calculate Rf, Rg, etc, TM-30 parameter
		function calculateTM30(testingSpectrum, buildingFixedPalette = false) {
			// Calculate the CIE 1931 chromaticity coordinates of the light source under test
			const { x, y } = lightSourceCoordinate(testingSpectrum);
			// Calculate the correlated color temperature Tc of the light source under test
			const tc = correlatedColorTemperature(x, y);
			
			// Determine the reference illuminant based on the color temperature of the light source under test
			const referenceSpectrum = generateTM30Spectrum(tc);
			
			// Calculate the CIE 1964 tristimulus values and normalization coefficient kt of the light source under test
			const { xCapital: xt, yCapital: yt, zCapital: zt, k: kt } = lightSourceStimulus(testingSpectrum);
			
			// Calculate the CIE 1964 tristimulus values and normalization coefficient kr of the reference illuminant
			const { xCapital: xr, yCapital: yr, zCapital: zr, k: kr } = lightSourceStimulus(referenceSpectrum);
			
			// Calculate the CIE 1964 chromaticity coordinates of color samples under the light source under test and the reference illuminant
			const sampleNumber = 99;
			// Initialize tristimulus values of color samples under the light source under test (10° field of view)
			const xwt = new Array(sampleNumber).fill(0);
			const ywt = new Array(sampleNumber).fill(0);
			const zwt = new Array(sampleNumber).fill(0);
			// Initialize tristimulus values of color samples under the reference illuminant (10° field of view)
			const xwr = new Array(sampleNumber).fill(0);
			const ywr = new Array(sampleNumber).fill(0);
			const zwr = new Array(sampleNumber).fill(0);
			for (let i = 1; i < sampleNumber + 1; i++) { // Start processing from the second column
				const colorSample = cesReflectance.map(row => row[i]); // Extract the reflectance data of the i-th column
				// Call the colorSampleStimulus function and destructure the returned array  
				const [xwt_i, ywt_i, zwt_i] = colorSampleStimulus(colorSample, testingSpectrum, kt);
				const [xwr_i, ywr_i, zwr_i] = colorSampleStimulus(colorSample, referenceSpectrum, kr);
				xwt[i - 1] = xwt_i; // Adjust the index
				ywt[i - 1] = ywt_i;
				zwt[i - 1] = zwt_i;
				xwr[i - 1] = xwr_i;
				ywr[i - 1] = ywr_i;
				zwr[i - 1] = zwr_i;
			}
			// Calculate the RGB values of the light source under test and the reference illuminant
			const [rt, gt, bt] = xyzToRgb(xt, yt, zt);
			const [rr, gr, br] = xyzToRgb(xr, yr, zr);
			// Perform chromatic adaptation of the RGB values of the light source under test and reference illuminant to RcGcBc
			const [rct, gct, bct] = vonKriesAdapt(rt, gt, bt, rt, gt, bt);
			const [rcr, gcr, bcr] = vonKriesAdapt(rr, gr, br, rr, gr, br);
			// Inverse transform back to XYZ
			const [xct, yct, zct] = rgbToXyz(rct, gct, bct);
			const [xcr, ycr, zcr] = rgbToXyz(rcr, gcr, bcr);
			// Calculate R'G'B' 
			const [rpt, gpt, bpt] = huntPointerEstevez(xct, yct, zct);
			const [rpr, gpr, bpr] = huntPointerEstevez(xcr, ycr, zcr);
			// Perform luminance adaptation of the RGB values of the light source under test and reference illuminant to RaGaBaa
			const [rat, gat, bat] = luminanceAdaptation(rpt, gpt, bpt);
			const [rar, gar, bar] = luminanceAdaptation(rpr, gpr, bpr);
			// Calculate the RGB values of color samples under the light source under test and reference illuminant illumination
			const rwt = new Array(sampleNumber).fill(0);
			const gwt = new Array(sampleNumber).fill(0);
			const bwt = new Array(sampleNumber).fill(0);
			const rwr = new Array(sampleNumber).fill(0);
			const gwr = new Array(sampleNumber).fill(0);
			const bwr = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				const [rwt_i, gwt_i, bwt_i] = xyzToRgb(xwt[i], ywt[i], zwt[i]);
				const [rwr_i, gwr_i, bwr_i] = xyzToRgb(xwr[i], ywr[i], zwr[i]);
				rwt[i] = rwt_i;
				gwt[i] = gwt_i;
				bwt[i] = bwt_i;
				rwr[i] = rwr_i;
				gwr[i] = gwr_i;
				bwr[i] = bwr_i;
			}
				
			// Calculate the RcGcBc values of color samples under the light source under test and reference illuminant illumination
			const rcwt = new Array(sampleNumber).fill(0);
			const gcwt = new Array(sampleNumber).fill(0);
			const bcwt = new Array(sampleNumber).fill(0);
			const rcwr = new Array(sampleNumber).fill(0);
			const gcwr = new Array(sampleNumber).fill(0);
			const bcwr = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				[rcwt[i], gcwt[i], bcwt[i]] = vonKriesAdapt(rwt[i], gwt[i], bwt[i], rt, gt, bt);
				[rcwr[i], gcwr[i], bcwr[i]] = vonKriesAdapt(rwr[i], gwr[i], bwr[i], rr, gr, br);
			}
			// Calculate the RpGpBp values of color samples under the light source under test and reference illuminant illumination
			const rpwt = new Array(sampleNumber).fill(0);
			const gpwt = new Array(sampleNumber).fill(0);
			const bpwt = new Array(sampleNumber).fill(0);
			const rpwr = new Array(sampleNumber).fill(0);
			const gpwr = new Array(sampleNumber).fill(0);
			const bpwr = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				[rpwt[i], gpwt[i], bpwt[i]] = rgbToXyz(rcwt[i], gcwt[i], bcwt[i]);
				[rpwr[i], gpwr[i], bpwr[i]] = rgbToXyz(rcwr[i], gcwr[i], bcwr[i]);
				[rpwt[i], gpwt[i], bpwt[i]] = huntPointerEstevez(rpwt[i], gpwt[i], bpwt[i]);
				[rpwr[i], gpwr[i], bpwr[i]] = huntPointerEstevez(rpwr[i], gpwr[i], bpwr[i]);
			}
			// Calculate the RaGaBa values of color samples under the light source under test and reference illuminant illumination  
			const rawt = new Array(sampleNumber).fill(0);
			const gawt = new Array(sampleNumber).fill(0);
			const bawt = new Array(sampleNumber).fill(0);
			const rawr = new Array(sampleNumber).fill(0);
			const gawr = new Array(sampleNumber).fill(0);
			const bawr = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				[rawt[i], gawt[i], bawt[i]] = luminanceAdaptation(rpwt[i], gpwt[i], bpwt[i]);
				[rawr[i], gawr[i], bawr[i]] = luminanceAdaptation(rpwr[i], gpwr[i], bpwr[i]);
			}
			// Calculate the chromaticity aw, bw values and achromatic response A of color samples under the light source under test and reference illuminant illumination
			const awt_ab = new Array(sampleNumber).fill(0);
			const bwt_ab = new Array(sampleNumber).fill(0);
			const a_t = new Array(sampleNumber).fill(0);
			const awr_ab = new Array(sampleNumber).fill(0);
			const bwr_ab = new Array(sampleNumber).fill(0);
			const a_r = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				[awt_ab[i], bwt_ab[i], a_t[i]] = channelAb(rawt[i], gawt[i], bawt[i]);
				[awr_ab[i], bwr_ab[i], a_r[i]] = channelAb(rawr[i], gawr[i], bawr[i]);
			}
			// Calculate the achromatic response A of the light source under test and the reference illuminant
			const at = channelAb(rat, gat, bat)[2];
			const ar = channelAb(rar, gar, bar)[2];
			// Calculate the CIECAM02 color appearance model related lightness J, hue h, and colorfulness M
			const jt = new Array(sampleNumber).fill(0);
			const ht = new Array(sampleNumber).fill(0);
			const mt = new Array(sampleNumber).fill(0);
			const jr = new Array(sampleNumber).fill(0);
			const hr = new Array(sampleNumber).fill(0);
			const mr = new Array(sampleNumber).fill(0);
			const et_t = new Array(sampleNumber).fill(0);
			const et_r = new Array(sampleNumber).fill(0);
			const t_t = new Array(sampleNumber).fill(0);
			const t_r = new Array(sampleNumber).fill(0);
			const c_t = new Array(sampleNumber).fill(0);
			const c_r = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				jt[i] = 100 * (a_t[i] / at) ** (0.69 * 1.9272);
				jr[i] = 100 * (a_r[i] / ar) ** (0.69 * 1.9272);
				ht[i] = 180 / Math.PI * Math.atan2(bwt_ab[i], awt_ab[i]);
				if (ht[i] < 0) ht[i] += 360;
				hr[i] = 180 / Math.PI * Math.atan2(bwr_ab[i], awr_ab[i]);
				if (hr[i] < 0) hr[i] += 360;
				et_t[i] = 0.25 * (Math.cos(Math.PI / 180 * ht[i] + 2) + 3.8);
				et_r[i] = 0.25 * (Math.cos(Math.PI / 180 * hr[i] + 2) + 3.8);
				t_t[i] = (50000 / 13 * 1.0003 * et_t[i] * Math.sqrt(awt_ab[i] ** 2 + bwt_ab[i] ** 2)) / (rawt[i] + gawt[i] + 21 / 20 * bawt[i]);
				t_r[i] = (50000 / 13 * 1.0003 * et_r[i] * Math.sqrt(awr_ab[i] ** 2 + bwr_ab[i] ** 2)) / (rawr[i] + gawr[i] + 21 / 20 * bawr[i]);
				c_t[i] = t_t[i] ** 0.9 * Math.sqrt(jt[i] / 100) * (1.64 - 0.29 ** 0.2) ** 0.73;
				c_r[i] = t_r[i] ** 0.9 * Math.sqrt(jr[i] / 100) * (1.64 - 0.29 ** 0.2) ** 0.73;
				mt[i] = c_t[i] * 0.7937 ** 0.25;
				mr[i] = c_r[i] * 0.7937 ** 0.25;
			}
			// Calculate the hue bin to which the hue angle of the reference illuminant belongs
			const bin_number = countHueAngle(hr);
			// Convert J, h, M values to CAM02-UCS color coordinates J', a', b'
			const jpt_uc = new Array(sampleNumber).fill(0); // J' under the light source under test  
			const apt_uc = new Array(sampleNumber).fill(0); // a' under the light source under test 
			const bpt_uc = new Array(sampleNumber).fill(0); // b' under the light source under test 
			const jpr_uc = new Array(sampleNumber).fill(0); // J' under the reference illuminant 
			const apr_uc = new Array(sampleNumber).fill(0); // a' under the reference illuminant
			const bpr_uc = new Array(sampleNumber).fill(0); // b' under the reference illuminant 
			const mpt_uc = new Array(sampleNumber).fill(0); // M' under the light source under test
			const mpr_uc = new Array(sampleNumber).fill(0); // M' under the reference illuminant  
			for (let i = 0; i < sampleNumber; i++) {
				jpt_uc[i] = (1 + 100 * 0.007) * jt[i] / (1 + 0.007 * jt[i]);
				jpr_uc[i] = (1 + 100 * 0.007) * jr[i] / (1 + 0.007 * jr[i]);
				mpt_uc[i] = 1 / 0.0228 * Math.log(1 + 0.0228 * mt[i]);
				mpr_uc[i] = 1 / 0.0228 * Math.log(1 + 0.0228 * mr[i]);
				apt_uc[i] = mpt_uc[i] * Math.cos(Math.PI / 180 * ht[i]);
				apr_uc[i] = mpr_uc[i] * Math.cos(Math.PI / 180 * hr[i]);
				bpt_uc[i] = mpt_uc[i] * Math.sin(Math.PI / 180 * ht[i]);
				bpr_uc[i] = mpr_uc[i] * Math.sin(Math.PI / 180 * hr[i]);
			}
			// Calculate the color appearance difference de and its average de_ave
			const de = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				de[i] = Math.sqrt((jpt_uc[i] - jpr_uc[i]) ** 2 + (apt_uc[i] - apr_uc[i]) ** 2 + (bpt_uc[i] - bpr_uc[i]) ** 2);
				de[i] = Math.round(de[i] * 100) / 100;
			}
			const de_ave = de.reduce((a, b) => a + b, 0) / sampleNumber;                        
			// Convert the color appearance difference to the color fidelity index rfi and its average rf  
			const rfi = new Array(sampleNumber).fill(0);
			for (let i = 0; i < sampleNumber; i++) {
				rfi[i] = 10 * Math.log(Math.exp((100 - 6.73 * de[i]) / 10) + 1);
				rfi[i] = Math.round(rfi[i]);
			}
			const rf = 10 * Math.log(Math.exp((100 - 6.73 * de_ave) / 10) + 1);
			// Calculate the average within each hue angle bin
			const jptj = new Array(16).fill(0);
			const aptj = new Array(16).fill(0);
			const bptj = new Array(16).fill(0);
			const jprj = new Array(16).fill(0);
			const aprj = new Array(16).fill(0);
			const bprj = new Array(16).fill(0);
			// Initialize the sample count within each hue angle bin
			const per_bin_number = new Array(16).fill(0);
			// Per-bin accumulated XYZ of the samples under the test source (for the graphic colours)
			const binXt = new Array(16).fill(0);
			const binYt = new Array(16).fill(0);
			const binZt = new Array(16).fill(0);
			// Calculate the average within each hue angle bin
			for (let i = 0; i < sampleNumber; i++) {
				const binIndex = bin_number[i] - 1; // Hue bin numbers start from 1, array indices start from 0
				per_bin_number[binIndex] += 1;
				jptj[binIndex] += jpt_uc[i];
				aptj[binIndex] += apt_uc[i];
				bptj[binIndex] += bpt_uc[i];
				jprj[binIndex] += jpr_uc[i];
				aprj[binIndex] += apr_uc[i];
				bprj[binIndex] += bpr_uc[i];
				binXt[binIndex] += xwt[i];
				binYt[binIndex] += ywt[i];
				binZt[binIndex] += zwt[i];
			}
			// Calculate the average
			for (let i = 0; i < 16; i++) {
				if (per_bin_number[i] > 0) {
					jptj[i] /= per_bin_number[i];
					aptj[i] /= per_bin_number[i];
					bptj[i] /= per_bin_number[i];
					jprj[i] /= per_bin_number[i];
					aprj[i] /= per_bin_number[i];
					bprj[i] /= per_bin_number[i];
				}
			}
			// Calculate Rg
			const rg = 100 * polygonArea(aptj, bptj) / polygonArea(aprj, bprj);

			// New: local parameters per hue bin (TM-30 local vector graph data) 

			// Calculate the local saturation shift Rcshj and local hue shift Rhshj
			const rcshj = new Array(16).fill(0); // Local saturation shift per hue bin
			const rhshj = new Array(16).fill(0); // Local hue shift per hue bin
			const theta_j = new Array(16).fill(0); // Center angle of each hue bin
			for (let i = 0; i < 16; i++) {
				theta_j[i] = (2 * i + 1) * Math.PI / 16; // Bin center: π/16, 3π/16, ..., 31π/16
				const denom = Math.sqrt(aprj[i] ** 2 + bprj[i] ** 2); // Reference chroma magnitude |C'r,j|
				if (denom !== 0) { // Guard against empty bins
					rcshj[i] = ((aptj[i] - aprj[i]) * Math.cos(theta_j[i]) + (bptj[i] - bprj[i]) * Math.sin(theta_j[i])) / denom;
					rhshj[i] = (-(aptj[i] - aprj[i]) * Math.sin(theta_j[i]) + (bptj[i] - bprj[i]) * Math.cos(theta_j[i])) / denom;
				} else {
					rcshj[i] = 0;
					rhshj[i] = 0;
				}
			}

			// Calculate the local color fidelity Rfhj per hue bin
			const de_j = new Array(16).fill(0); // Accumulated ΔE per hue bin
			const rpfhj = new Array(16).fill(0); // Raw local color fidelity
			const rfhj = new Array(16).fill(0); // Normalized local color fidelity
			for (let i = 0; i < sampleNumber; i++) {
				const binIndex = bin_number[i] - 1;
				de_j[binIndex] += Math.sqrt((jpt_uc[i] - jpr_uc[i]) ** 2 + (apt_uc[i] - apr_uc[i]) ** 2 + (bpt_uc[i] - bpr_uc[i]) ** 2);
			}
			for (let i = 0; i < 16; i++) {
				if (per_bin_number[i] !== 0) {
					rpfhj[i] = 100 - 6.73 * de_j[i] / per_bin_number[i];
					rfhj[i] = 10 * Math.log(Math.exp(rpfhj[i] / 10) + 1);
				}
			}

			// Colour conversion helper: adapt an XYZ value from the given white point
			// to D65 (channel scaling), then convert to gamma-encoded sRGB
			const tmXyzToRgbStr = (X, Y, Z, w) => {
				const xs = X / w[0] * 0.95047, ys = Y / w[1], zs = Z / w[2] * 1.08883;
				const lin = [
					3.2406 * xs - 1.5372 * ys - 0.4986 * zs,
					-0.9689 * xs + 1.8758 * ys + 0.0415 * zs,
					0.0557 * xs - 0.2040 * ys + 1.0570 * zs
				];
				const enc = c => {
					c = Math.min(Math.max(c, 0), 1);
					return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
				};
				return 'rgb(' + lin.map(enc).join(', ') + ')';
			};
			// Graphic base colours are FIXED: they come from the cached D65 palette
			// (see getTm30FixedGraphicColors) so the graphic never changes appearance
			// with the input spectrum. Only when building that cached palette (test ==
			// reference == D65) are the colours taken from the current run itself.
			// The drift arrows, however, follow the official IES TM-30 tool and use
			// the TEST-source appearance of each bin (what its samples look like
			// under the test light), so they are always computed from this run.
			let cesColors, binColors, arrowColors;
			if (buildingFixedPalette) {
				cesColors = new Array(sampleNumber).fill('rgb(128, 128, 128)');
				for (let i = 0; i < sampleNumber; i++) {
					cesColors[i] = tmXyzToRgbStr(xwt[i], ywt[i], zwt[i], [xt, yt, zt]);
				}
				binColors = new Array(16).fill('rgb(128, 128, 128)');
				arrowColors = new Array(16).fill('rgb(128, 128, 128)');
				for (let j = 0; j < 16; j++) {
					if (per_bin_number[j] > 0) {
						binColors[j] = tmXyzToRgbStr(binXt[j] / per_bin_number[j], binYt[j] / per_bin_number[j], binZt[j] / per_bin_number[j], [xt, yt, zt]);
						arrowColors[j] = binColors[j];
					}
				}
			} else {
				const fixed = getTm30FixedGraphicColors();
				cesColors = fixed.cesColors;
				binColors = fixed.binColors;
				arrowColors = new Array(16).fill('rgb(128, 128, 128)');
				for (let j = 0; j < 16; j++) {
					if (per_bin_number[j] > 0) {
						arrowColors[j] = tmXyzToRgbStr(binXt[j] / per_bin_number[j], binYt[j] / per_bin_number[j], binZt[j] / per_bin_number[j], [xt, yt, zt]);
					}
				}
			}

			return [rf, rg, rcshj, rhshj, rfhj, rfi, aptj, bptj, aprj, bprj, per_bin_number, cesColors, binColors, arrowColors];
		}

		// ================= TM-30 colour vector graphic & local metric charts =================
		const TM30_FONT = "'Segoe UI', 'Microsoft YaHei', Arial, sans-serif";

		// Fixed per-bin colours of the drift arrows, taken verbatim from the
		// official IES TM-30 AdvancedCalculationTool workbook (chart "CVG": one
		// two-point line series per hue bin, each with its own solid fill).
		// They are a saturated rainbow ordered by hue bin, deliberately related
		// to — but not identical with — the pastel wedge colours, so the arrows
		// stay independent of the input spectrum.
		const TM30_ARROW_COLORS = [
			'#E62828', '#E74B4B', '#FB812E', '#FFB529',
			'#CBCA46', '#7EB94C', '#41C06D', '#009C7C',
			'#16BCB0', '#00A4BF', '#0085C3', '#3B62AA',
			'#6D68AE', '#6A4E85', '#9D69A1', '#A74F81'
		];

		// Draw a rotated (bottom-to-top) axis title, wrapped onto two lines
		// when it is longer than the available plot height
		function drawTM30AxisTitle(ctx, title, x, y, maxLen) {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(-Math.PI / 2);
			const k = title.indexOf(' (');
			if (ctx.measureText(title).width > maxLen && k > 0) {
				ctx.fillText(title.slice(0, k), 0, -5);
				ctx.fillText(title.slice(k + 1), 0, 10);
			} else {
				ctx.fillText(title, 0, 0);
			}
			ctx.restore();
		}

		// Colour vector graphic: 16 hue-bin coloured wedges, fixed black 0%-chroma
		// reference circle, smooth red test-gamut spline built from the per-bin
		// chroma ratio ct/cr at the test centroid hue angle (per TM-30 Annex E),
		// radial drift arrows from the circle to the curve, ±20% chroma rings,
		// hue-bin numbers, fixed Rf/Rg top-corner readouts and bottom-corner
		// readouts that follow the hovered hue bin (CCT/Duv outside)
		function drawTM30VectorGraphic(canvas, d) {
			const ctx = canvas.getContext('2d');
			// 2x supersampling: the backing store is twice the logical size, so text
			// and lines stay sharp on HiDPI screens; all geometry stays logical
			const K = 2;
			ctx.setTransform(K, 0, 0, K, 0, 0);
			const S = canvas.width / K;
			const cx = S / 2, cy = S / 2;

			// Mean radius of the reference gamut polygon (chroma normalisation basis)
			let rref = 0;
			for (let j = 0; j < 16; j++) rref += Math.sqrt(d.aprj[j] ** 2 + d.bprj[j] ** 2);
			rref /= 16;
			const wedgeR = 1.38 * rref;
			const scale = (S / 2 - 10) / wedgeR;
			const px = (a, b) => cx + a * scale;
			const py = (a, b) => cy - b * scale;
			// Clamp any data point to the wedge disc so a degenerate or extreme test
			// gamut can never draw outside the coloured circle
			const clampToDisc = (a, b) => {
				const r = Math.hypot(a, b);
				if (r <= wedgeR) return [a, b];
				const f = wedgeR / r;
				return [a * f, b * f];
			};

			// Coloured wedges: one hue bin each, filled with the bin-average sample colour
			for (let j = 0; j < 16; j++) {
				const a0 = (2 * j) * Math.PI / 16, a1 = (2 * j + 2) * Math.PI / 16;
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.arc(cx, cy, wedgeR * scale, -a1, -a0); // canvas y is mirrored
				ctx.closePath();
				ctx.fillStyle = d.binColors[j];
				ctx.fill();
			}

			// Dashed bin-boundary spokes
			ctx.strokeStyle = 'rgba(232, 232, 232, 0.6)';
			ctx.lineWidth = 1;
			ctx.setLineDash([5, 6]);
			for (let k = 0; k < 16; k++) {
				const a = k * Math.PI / 8;
				ctx.beginPath();
				ctx.moveTo(px(0.15 * rref * Math.cos(a)), py(0.15 * rref * Math.sin(a)));
				ctx.lineTo(px(wedgeR * Math.cos(a)), py(wedgeR * Math.sin(a)));
				ctx.stroke();
			}
			ctx.setLineDash([]);

			// Reference chroma circles at -20% and +20% (white); the 0% circle is
			// drawn separately in black below, like the official IES TM-30 tool
			ctx.strokeStyle = '#E8E8E8';
			ctx.lineWidth = 2;
			for (const f of [0.8, 1.2]) {
				ctx.beginPath();
				ctx.arc(cx, cy, f * rref * scale, 0, 2 * Math.PI);
				ctx.stroke();
			}
			// Ring labels
			ctx.font = 'bold 13px ' + TM30_FONT;
			ctx.fillStyle = '#E8E8E8';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
			ctx.shadowBlur = 4;
			ctx.fillText('-20%', cx - 4, cy + 0.8 * rref * scale - 8);
			ctx.fillText('+20%', cx - 4, cy + 1.2 * rref * scale - 8);
			ctx.shadowBlur = 0;

			// Reference 0%-chroma circle (black): after the chroma normalisation the
			// reference gamut always has the same mean radius rref, so — exactly as
			// in the official IES TM-30 calculator and the IES Excel workbook — it is
			// drawn as a fixed circle that never changes with the input spectrum
			ctx.strokeStyle = '#111';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(cx, cy, rref * scale, 0, 2 * Math.PI);
			ctx.stroke();

			// Test gamut curve (red): a smooth closed Catmull-Rom spline through the
			// 16 bin points, like the official tool — no polygon corners, no markers.
			// Per TM-30 Annex E the CVG does NOT plot the raw bin-averaged test
			// a',b' (their absolute values also carry per-sample scatter, which made
			// the curve wiggle far more than the official one). Instead each test
			// vertex sits at the hue angle of the bin's TEST centroid, with a radius
			// of the 0% circle (rref) scaled by that bin's chroma ratio ct/cr — the
			// ratio of the test centroid chroma to the reference centroid chroma, so
			// the curve deviation always matches Rcs,hj. Rg itself keeps using the
			// raw polygon, which is computed in calculateTM30.
			const testPts = [];
			for (let j = 0; j < 16; j++) {
				const ct = Math.hypot(d.aptj[j], d.bptj[j]);
				const cr = Math.hypot(d.aprj[j], d.bprj[j]);
				const ratio = cr > 0 ? ct / cr : 1;
				const ang = cr > 0 ? Math.atan2(d.bptj[j], d.aptj[j]) : (2 * j + 1) * Math.PI / 16;
				const ar = Math.min(rref * ratio, wedgeR); // clamp to the wedge disc
				testPts.push([cx + ar * scale * Math.cos(ang), cy - ar * scale * Math.sin(ang)]);
			}
			// Catmull-Rom basis for a closed spline through the 16 points
			const crSeg = (p0, p1, p2, p3, t) => {
				const t2 = t * t, t3 = t2 * t;
				return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
			};
			ctx.strokeStyle = '#e8000b';
			ctx.lineWidth = 3.5;
			ctx.lineJoin = 'round';
			ctx.beginPath();
			for (let j = 0; j < 16; j++) {
				const p0 = testPts[(j + 15) % 16], p1 = testPts[j], p2 = testPts[(j + 1) % 16], p3 = testPts[(j + 2) % 16];
				for (let s = 0; s < 12; s++) {
					const t = s / 12;
					const x = crSeg(p0[0], p1[0], p2[0], p3[0], t);
					const y = crSeg(p0[1], p1[1], p2[1], p3[1], t);
					if (j === 0 && s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
				}
			}
			ctx.closePath();
			ctx.stroke();

			// Drift arrows, built exactly like the official IES tool and the
			// AdvancedCalculationTool workbook: there each arrow is a two-point
			// line series whose endpoint cells (Results Numerical!AA:AD) are the
			// very same cells the red curve is plotted from. So the tail sits on
			// the black 0% circle at the CENTRE angle of its hue bin, and the head
			// sits exactly on the red curve's node for that bin. Because the
			// node's own hue angle differs from the bin centre angle, the arrow is
			// a true vector — it is neither radial nor aimed at the circle centre —
			// and it always starts on the circle and ends on the curve: no length
			// cap, so it never stops short. The colour is the fixed per-bin palette
			// of the workbook, so the arrows never change with the input spectrum.
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			for (let j = 0; j < 16; j++) {
				const aBin = (2 * j + 1) * Math.PI / 16;
				const x0 = cx + rref * scale * Math.cos(aBin);
				const y0 = cy - rref * scale * Math.sin(aBin);
				const x1 = testPts[j][0], y1 = testPts[j][1]; // red-curve node of this bin
				const dx = x1 - x0, dy = y1 - y0;
				const L = Math.hypot(dx, dy);
				if (L < 3) continue; // the curve sits on the circle: no vector to show
				const ux = dx / L, uy = dy / L;
				const nx = -uy, ny = ux;
				const hl = Math.max(5, Math.min(9, L * 0.55)); // arrowhead length
				const hw = hl * 0.40;                          // arrowhead half width
				const bx = x1 - ux * hl, by = y1 - uy * hl;    // base of the barbs
				const notchX = x1 - ux * hl * 0.62;            // stealth back notch
				const notchY = y1 - uy * hl * 0.62;
				const col = TM30_ARROW_COLORS[j];
				ctx.strokeStyle = col;
				ctx.fillStyle = col;
				// a dark halo keeps the arrow readable when its hue is close to
				// the pastel wedge underneath it (the workbook draws on white)
				ctx.shadowColor = 'rgba(10, 14, 18, 0.85)';
				ctx.shadowBlur = 3;
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(notchX, notchY);
				ctx.stroke();
				// stealth arrowhead, matching tailEnd type="stealth" of the workbook
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(bx + nx * hw, by + ny * hw);
				ctx.lineTo(notchX, notchY);
				ctx.lineTo(bx - nx * hw, by - ny * hw);
				ctx.closePath();
				ctx.fill();
			}
			ctx.shadowBlur = 0;
			ctx.lineCap = 'butt';

			// Hue-bin numbers (white with a dark outline for contrast on any wedge colour)
			ctx.font = 'bold 13px ' + TM30_FONT;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'rgba(30, 30, 30, 0.5)';
			ctx.fillStyle = '#E8E8E8';
			for (let j = 0; j < 16; j++) {
				const a = (2 * j + 1) * Math.PI / 16;
				const nx = 1.3 * rref * Math.cos(a), ny = 1.3 * rref * Math.sin(a);
				ctx.strokeText(String(j + 1), px(nx, ny), py(nx, ny));
				ctx.fillText(String(j + 1), px(nx, ny), py(nx, ny));
			}

			// Centre cross
			ctx.strokeStyle = 'rgba(232, 232, 232, 0.9)';
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
			ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
			ctx.stroke();

			// Corner readouts: Rf / Rg are fixed at the top corners; the bottom
			// corners show CCT / Duv by default and switch to the hovered hue
			// bin's local metrics (Rf,hj / Rcs,hj) while the cursor is inside
			// a wedge, restoring CCT / Duv when it leaves.
			const fmtCct = () => 'CCT: ' + (isFinite(d.cct) ? Math.round(d.cct) + ' K' : 'NG');
			const fmtDuv = () => 'Duv: ' + (isFinite(d.duv) ? d.duv.toFixed(4) : 'NG');
			const drawBottomCorners = (leftText, rightText) => {
				ctx.save();
				// Erase the previous readouts without biting into the wedges: the
				// hue-bin disc reaches into the bottom strip (its lowest point is
				// y = S - 10), so a plain rectangular clearRect used to cut small
				// notches out of the two bottom wedges. Clip the strip to the area
				// OUTSIDE the disc with the even-odd fill rule instead.
				ctx.beginPath();
				ctx.rect(0, S - 30, S, 30);
				ctx.moveTo(cx + wedgeR * scale + 2, cy);
				ctx.arc(cx, cy, wedgeR * scale + 2, 0, 2 * Math.PI);
				ctx.clip('evenodd');
				ctx.clearRect(0, S - 30, S, 30);
				ctx.restore();

				ctx.save();
				ctx.font = 'bold 13px ' + TM30_FONT;
				ctx.fillStyle = '#E8E8E8';
				ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
				ctx.shadowBlur = 4;
				ctx.textBaseline = 'alphabetic';
				ctx.textAlign = 'left';
				ctx.fillText(leftText, 12, S - 10);
				ctx.textAlign = 'right';
				ctx.fillText(rightText, S - 12, S - 10);
				ctx.restore();
			};
			drawBottomCorners(fmtCct(), fmtDuv());
			// top corners: Rf / Rg
			ctx.font = 'bold 13px ' + TM30_FONT;
			ctx.fillStyle = '#E8E8E8';
			ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
			ctx.shadowBlur = 4;
			ctx.textBaseline = 'alphabetic';
			ctx.textAlign = 'left';
			ctx.fillText('Rf: ' + Math.round(d.rf), 12, 22);
			ctx.textAlign = 'right';
			ctx.fillText('Rg: ' + Math.round(d.rg), S - 12, 22);
			ctx.shadowBlur = 0;

			// Hover interaction: pick the hue bin under the cursor and show its
			// local fidelity / chroma shift in the bottom corners
			canvas.addEventListener('mousemove', (e) => {
				const rect = canvas.getBoundingClientRect();
				const mx = (e.clientX - rect.left) * S / rect.width;
				const my = (e.clientY - rect.top) * S / rect.height;
				const dx = (mx - cx) / scale, dy = (cy - my) / scale; // data coords (y up)
				const r = Math.hypot(dx, dy);
				if (r <= wedgeR) {
					let a = Math.atan2(dy, dx);
					if (a < 0) a += 2 * Math.PI;
					const j = Math.min(Math.floor(a / (2 * Math.PI / 16)), 15);
					drawBottomCorners('Rf,h' + (j + 1) + ': ' + Math.round(d.rfhj[j]),
						'Rcs,h' + (j + 1) + ': ' + (d.rcshj[j] >= 0 ? '+' : '') + Math.round(d.rcshj[j] * 100) + '%');
				} else {
					drawBottomCorners(fmtCct(), fmtDuv());
				}
			});
			canvas.addEventListener('mouseleave', () => {
				drawBottomCorners(fmtCct(), fmtDuv());
			});
		}

		// Generic bar chart for the 16 hue-bin local metrics (page background, bin colours)
		function drawTM30LocalBarChart(canvas, values, colors, opts) {
			const ctx = canvas.getContext('2d');
			// 2x supersampling (see drawTM30VectorGraphic)
			const K = 2;
			ctx.setTransform(K, 0, 0, K, 0, 0);
			const W = canvas.width / K, H = canvas.height / K;
			ctx.fillStyle = '#1d2630';
			ctx.fillRect(0, 0, W, H);
			const mL = 66, mR = 12, mT = 12, mB = 34;
			const pw = W - mL - mR, ph = H - mT - mB;
			// Adaptive vertical range: the default span in opts is kept whenever
			// every value fits inside it, but whenever any bar would poke past an
			// edge the range grows to the next multiple of the default grid step
			// on that side, so every bar and its value label stay inside the plot
			// without clipping or overlapping the borders. Gridlines are drawn at
			// whole multiples of the same step, so tick labels stay clean numbers
			// (±40% → ±60%, ±0.4 → ±0.6, ...) however far the data reaches.
			const yStep = (opts.yMax - opts.yMin) / 4;
			const vMax = Math.max.apply(null, values), vMin = Math.min.apply(null, values);
			const yMin = Math.min(opts.yMin, Math.floor(vMin / yStep - 1e-9) * yStep);
			const yMax = Math.max(opts.yMax, Math.ceil(vMax / yStep + 1e-9) * yStep);
			const yOf = v => mT + ph * (1 - (v - yMin) / (yMax - yMin));

			// gridlines + tick labels
			ctx.font = '10px ' + TM30_FONT;
			const yLines = Math.round((yMax - yMin) / yStep);
			for (let k = 0; k <= yLines; k++) {
				const v = yMin + k * yStep;
				const y = yOf(v);
				ctx.strokeStyle = 'rgba(232, 232, 232, 0.25)';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(mL, y);
				ctx.lineTo(W - mR, y);
				ctx.stroke();
				ctx.fillStyle = '#E8E8E8';
				ctx.textAlign = 'right';
				ctx.textBaseline = 'middle';
				ctx.fillText(opts.tickFmt(v), mL - 6, y);
			}
			// zero / axis line
			const y0 = yOf(Math.min(Math.max(0, yMin), yMax));
			ctx.strokeStyle = '#E8E8E8';
			ctx.beginPath();
			ctx.moveTo(mL, y0);
			ctx.lineTo(W - mR, y0);
			ctx.stroke();

			// bars + value labels
			const slot = pw / 16;
			for (let j = 0; j < 16; j++) {
				const v = values[j];
				const bw = slot * 0.66;
				const x = mL + slot * (j + (1 - 0.66) / 2);
				const y = yOf(Math.min(Math.max(v, yMin), yMax));
				if (v !== 0 || yMin < 0) {
					ctx.fillStyle = colors[j];
					ctx.fillRect(x, Math.min(y, y0), bw, Math.max(Math.abs(y - y0), v === 0 ? 0 : 1));
				}
				ctx.fillStyle = '#E8E8E8';
				ctx.font = '9.5px ' + TM30_FONT;
				ctx.textAlign = 'center';
				if (v >= 0) {
					ctx.textBaseline = 'bottom';
					ctx.fillText(opts.fmt(v), x + bw / 2, y - 2);
				} else {
					ctx.textBaseline = 'top';
					ctx.fillText(opts.fmt(v), x + bw / 2, y + 2);
				}
				ctx.textBaseline = 'top';
				ctx.fillText(String(j + 1), x + bw / 2, mT + ph + 6);
			}
			// axis titles
			ctx.fillStyle = '#E8E8E8';
			ctx.font = '11px ' + TM30_FONT;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.fillText('Hue-Angle Bin (j)', mL + pw / 2, H - 6);
			drawTM30AxisTitle(ctx, opts.title, 27, mT + ph / 2, ph);
		}

		// 99-sample colour fidelity chart (bar colour = sample colour under the test source)
		function drawTM30SampleChart(canvas, values, colors) {
			const ctx = canvas.getContext('2d');
			// 2x supersampling (see drawTM30VectorGraphic)
			const K = 2;
			ctx.setTransform(K, 0, 0, K, 0, 0);
			const W = canvas.width / K, H = canvas.height / K;
			ctx.fillStyle = '#1d2630';
			ctx.fillRect(0, 0, W, H);
			const mL = 64, mR = 14, mT = 14, mB = 40;
			const pw = W - mL - mR, ph = H - mT - mB;
			const yOf = v => mT + ph * (1 - v / 100);

			ctx.font = '10px ' + TM30_FONT;
			for (let v = 0; v <= 100; v += 20) {
				const y = yOf(v);
				ctx.strokeStyle = 'rgba(232, 232, 232, 0.25)';
				ctx.beginPath();
				ctx.moveTo(mL, y);
				ctx.lineTo(W - mR, y);
				ctx.stroke();
				ctx.fillStyle = '#E8E8E8';
				ctx.textAlign = 'right';
				ctx.textBaseline = 'middle';
				ctx.fillText(String(v), mL - 6, y);
			}
			const slot = pw / values.length;
			for (let i = 0; i < values.length; i++) {
				const v = Math.min(Math.max(values[i], 0), 100);
				const bw = slot * 0.88;
				const x = mL + slot * (i + 0.06);
				ctx.fillStyle = colors[i];
				ctx.fillRect(x, yOf(v), bw, yOf(0) - yOf(v));
			}
			// x tick labels 1, 4, 7, ..., 97
			ctx.fillStyle = '#E8E8E8';
			ctx.font = '10px ' + TM30_FONT;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			for (let n = 1; n <= 97; n += 3) {
				ctx.fillText(String(n), mL + slot * (n - 1) + slot / 2, mT + ph + 6);
			}
			// axis titles
			ctx.fillStyle = '#E8E8E8';
			ctx.font = '12px ' + TM30_FONT;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.fillText('Color Evaluation Sample', mL + pw / 2, H - 8);
			drawTM30AxisTitle(ctx, 'Sample Color Fidelity (Rf,ces)', 27, mT + ph / 2, ph);

			// Hover tooltip: floating "Rf,cesN: value" readout next to the
			// cursor, like the official IES TM-30 calculation tool
			let tip = null;
			canvas.addEventListener('mousemove', (e) => {
				const rect = canvas.getBoundingClientRect();
				// map the cursor into LOGICAL drawing units (canvas.width / K, the
				// space the bar geometry lives in): using the raw backing-store
				// width doubles every index, which desynchronised the readout from
				// the hovered bar and silenced it past the middle of the chart
				const x = (e.clientX - rect.left) * (canvas.width / K) / rect.width;
				const i = Math.floor((x - mL) / slot);
				if (i >= 0 && i < values.length) {
					if (!tip) {
						tip = document.createElement('div');
						tip.className = 'tm30-tip';
						canvas.parentElement.appendChild(tip);
					}
					tip.textContent = 'Rf,ces' + (i + 1) + ': ' + Math.round(values[i]);
					// Badge background follows the hovered sample's colour, like
					// the official IES TM-30 tool; soft text shadow keeps the
					// white label readable on light sample colours
					tip.style.backgroundColor = colors[i];
					tip.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.55)';
					const pr = canvas.parentElement.getBoundingClientRect();
					tip.style.left = (e.clientX - pr.left + 14) + 'px';
					tip.style.top = (e.clientY - pr.top - 12) + 'px';
					tip.style.display = 'block';
				} else if (tip) {
					tip.style.display = 'none';
				}
			});
			canvas.addEventListener('mouseleave', () => {
				if (tip) tip.style.display = 'none';
			});
		}

		// Calculate the Euclidean distance between two color coordinates
		function distance(x1, y1, x2, y2) {
			return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
		}

		// Calculate the cross product of vectors from a point to two other points
		function crossProduct(x1, y1, x2, y2, x0, y0) {
			return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
		}

		// Test if the point under test is within the rectangular area with the vector as the diagonal
		function whetherRectangle(xt, yt, x1, y1, x2, y2) {
			return (xt - x1) * (xt - x2) <= 0 && (yt - y1) * (yt - y2) <= 0;
		}

		// Calculate the determinant value formed by a, b, c, d
		function detValue(a, b, c, d) {
			return a * d - b * c;
		}

		// Find the coordinates of the intersection point of two lines determined by four points
		function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
			const denominator = detValue(
				detValue(1, y1, 1, y2) / detValue(x1, y1, x2, y2),
				detValue(x1, 1, x2, 1) / detValue(x1, y1, x2, y2),
				detValue(1, y3, 1, y4) / detValue(x3, y3, x4, y4),
				detValue(x3, 1, x4, 1) / detValue(x3, y3, x4, y4)
			);

			const numeratorX = detValue(
				1, detValue(x1, 1, x2, 1) / detValue(x1, y1, x2, y2),
				1, detValue(x3, 1, x4, 1) / detValue(x3, y3, x4, y4)
			);

			const numeratorY = detValue(
				detValue(1, y1, 1, y2) / detValue(x1, y1, x2, y2), 1,
				detValue(1, y3, 1, y4) / detValue(x3, y3, x4, y4), 1
			);

			const x = numeratorX / denominator;
			const y = numeratorY / denominator;

			return [x, y];
		}

		// Calculate the dominant wavelength and color purity for given chromaticity coordinates
		function calculateDominant(xw, yw, xt, yt) {
			const x = monochromaticData.map(row => row[1]);
			const y = monochromaticData.map(row => row[2]);
			const waveLength = monochromaticData.map(row => row[0]);

			for (let i = 0; i < waveLength.length - 1; i++) {
				const cp1 = crossProduct(x[i], y[i], xt, yt, xw, yw);
				const cp2 = crossProduct(x[i + 1], y[i + 1], xt, yt, xw, yw);

				if (cp1 * cp2 <= 0) {
					if (whetherRectangle(xt, yt, xw, yw, x[i + 1], y[i + 1])) {
						if (Math.abs(cp1) <= Math.abs(cp2)) {
							const lambdaD = waveLength[i];
							const colorPurity = distance(xw, yw, xt, yt) / distance(xw, yw, x[i], y[i]);
							return { lambdaD, colorPurity };
						} else {
							const lambdaD = waveLength[i + 1];
							const colorPurity = distance(xw, yw, xt, yt) / distance(xw, yw, x[i + 1], y[i + 1]);
							return { lambdaD, colorPurity };
						}
					}
				}
			}
			return { lambdaD: null, colorPurity: null };
		}

		// Calculate the complementary wavelength and color purity for given chromaticity coordinates
		function calculateComplementary(xw, yw, xt, yt) {
			const x380 = monochromaticData[0][1];
			const y380 = monochromaticData[0][2];
			const x780 = monochromaticData[monochromaticData.length - 1][1];
			const y780 = monochromaticData[monochromaticData.length - 1][2];

			const [xp, yp] = lineIntersection(xw, yw, xt, yt, x380, y380, x780, y780);

			const x = monochromaticData.map(row => row[1]);
			const y = monochromaticData.map(row => row[2]);
			const waveLength = monochromaticData.map(row => row[0]);

			for (let i = 0; i < waveLength.length - 1; i++) {
				const cp1 = crossProduct(x[i], y[i], xt, yt, xw, yw);
				const cp2 = crossProduct(x[i + 1], y[i + 1], xt, yt, xw, yw);

				if (cp1 * cp2 <= 0) {
					if (Math.abs(cp1) <= Math.abs(cp2)) {
						const lambdaC = waveLength[i];
						const colorPurity = distance(xw, yw, xt, yt) / distance(xw, yw, xp, yp);
						return { lambdaC, colorPurity };
					} else {
						const lambdaC = waveLength[i + 1];
						const colorPurity = distance(xw, yw, xt, yt) / distance(xw, yw, xp, yp);
						return { lambdaC, colorPurity };
					}
				}
			}
			return { lambdaC: null, colorPurity: null };
		}

		// Determine whether the color point is in the dominant wavelength region or complementary wavelength region
		function judgeCoordinateType(xw, yw, xt, yt) {
			const x380 = monochromaticData[0][1];
			const y380 = monochromaticData[0][2];
			const x780 = monochromaticData[monochromaticData.length - 1][1];
			const y780 = monochromaticData[monochromaticData.length - 1][2];

			const k380 = (y380 - yw) / (x380 - xw);
			const b380 = yw - k380 * xw;

			const k780 = (y780 - yw) / (x780 - xw);
			const b780 = yw - k780 * xw;

			if ((yt - k380 * xt - b380) < 0 && (yt - k780 * xt - b780) < 0) {
				return false; // Complementary wavelength region 
			} else {
				return true; // Dominant wavelength region
			}
		}

		// Calculate dominant wavelength (or complementary wavelength) and color purity from CIE 1931 chromaticity coordinates
		function cie1931ToDominantWavelengthAndPurity(xt, yt) {
			// Default white point
			const whitePoint = { xw: 0.3333, yw: 0.3333 };

			const coordinateType = judgeCoordinateType(whitePoint.xw, whitePoint.yw, xt, yt);

			if (coordinateType) {
				const { lambdaD, colorPurity } = calculateDominant(whitePoint.xw, whitePoint.yw, xt, yt);
				return { wavelength: lambdaD, purity: colorPurity * 100, type: "Dominant" }; // Convert to percentage
			} else {
				const { lambdaC, colorPurity } = calculateComplementary(whitePoint.xw, whitePoint.yw, xt, yt);
				return { wavelength: lambdaC, purity: colorPurity * 100, type: "Complementary" }; // Convert to percentage
			}
		}

		// XYZ to RGB conversion for CQS
		function xyzToRgbCQS(x, y, z) {
			// Initialize transformation matrix M
			const m = [
				[0.7982, 0.3389, -0.1371],
				[-0.5918, 1.5512, 0.0406],
				[0.0008, 0.0239, 0.9753]
			];

			// Generate column vector from x, y, z
			const xyz = [x, y, z];

			// Calculate RGB values using matrix multiplication function
			const rgb = matrixMultiply(m, xyz);

			return [rgb[0], rgb[1], rgb[2]];
		}

		// Corresponding transformation
		function correspondingAdapt(rit, git, bit, rwt, gwt, bwt, rwr, gwr, bwr, ywt, ywr) {
			const a = ywt / ywr;
			const rc = rit * a * (rwr / rwt);
			const gc = git * a * (gwr / gwt);
			const bc = bit * a * (bwr / bwt);
			return [rc, gc, bc];
		}

		// RGB to XYZ conversion for CQS
		function rgbToXyzCQS(r, g, b) {
			// Initialize inverse transformation matrix M⁻¹
			const m1 = [
				[1.076450, -0.237662, 0.161212],
				[0.410964, 0.554342, 0.034694],
				[-0.010954, -0.013389, 1.024343]
			];

			// Generate column vector from r, g, b  
			const rgb = [r, g, b];

			// Calculate XYZ values using matrix multiplication function 
			const xyz = matrixMultiply(m1, rgb);

			// Extract each component of the xyz vector
			const x = xyz[0];
			const y = xyz[1];
			const z = xyz[2];

			return [x, y, z];
		}

		// Calculate CIELAB coordinates
		function labCalculate(xi, yi, zi, xw, yw, zw) {
			// Calculate L* value 
			const lCapital = 116 * Math.pow(yi / yw, 1 / 3) - 16;

			// Calculate a* value
			const a = 500 * (Math.pow(xi / xw, 1 / 3) - Math.pow(yi / yw, 1 / 3));

			// Calculate b* value
			const b = 200 * (Math.pow(yi / yw, 1 / 3) - Math.pow(zi / zw, 1 / 3));

			return [lCapital, a, b];
		}

		// Calculate saturation
		function chromaCalculate(a, b) {
			const c = Math.sqrt(a ** 2 + b ** 2);
			return c;
		}

		// CQS v9.0 test colour samples (15 Munsell samples, 380-780 nm @ 1 nm) -- source: luxpy _CRI_RFL["cqs"]["v9.0"]
		const LQ_CQS_RFL = globalThis.__lightingReferenceData.LQ_CQS_RFL;

		// Farnsworth-Munsell 100 hue test: 85 colour-cap reflectance spectra (380-780 nm @ 5 nm) -- source: LQMT metrics/Rd.csv
		const LQ_FM_RFL = globalThis.__lightingReferenceData.LQ_FM_RFL;

		// ================= Lighting Quality Parameters (MCPI / CDM) =================
		// Algorithm source: WHU-LQCV LQMT v1.0.0 (github.com/WHU-LQCV/LQMT, official toolbox of the
		// Chinese team standard "Comprehensive Evaluation Method for Colour Quality of White
		// Light Sources") and its supporting spreadsheet.
		//   MCPI = 0.62 x CQS Qa (v9.0) + 0.38 x CDI76
		//   CDM  = -0.07 x Rd (FM-100 hue ordering error) + 0.93 x Sneutral (Smet 2014 Linvar)
		//   MCPIr = MCPI / MCPI(ref illuminant @ CCT) x 100 ; CDMr = (1 - (CDMref - CDM) / |CDMref|) x 100
		// CQS Qa v9.0: CIELAB + CMCCAT2000-matrix von Kries adaptation (D = 1), RMS dE' with
		// chroma-enhancement compensation capped at 10, logistic scaling with factor 3.2.

		// Adapt a set of sample tristimulus values from one white point to another
		// (CMCCAT2000 sensor matrix, degree of adaptation D = 1, as in luxpy CQS v9.0)
		function lqAdaptXYZ(xyzArr, srcWhite, dstWhite) {
			const m = [[0.7982, 0.3389, -0.1371], [-0.5918, 1.5512, 0.0406], [0.0008, 0.0239, 0.9753]];
			const mi = [[1.076450, -0.237662, 0.161212], [0.410964, 0.554342, 0.034694], [-0.010954, -0.013389, 1.024343]];
			const sw = [
				m[0][0] * srcWhite[0] + m[0][1] * srcWhite[1] + m[0][2] * srcWhite[2],
				m[1][0] * srcWhite[0] + m[1][1] * srcWhite[1] + m[1][2] * srcWhite[2],
				m[2][0] * srcWhite[0] + m[2][1] * srcWhite[1] + m[2][2] * srcWhite[2]
			];
			const dw = [
				m[0][0] * dstWhite[0] + m[0][1] * dstWhite[1] + m[0][2] * dstWhite[2],
				m[1][0] * dstWhite[0] + m[1][1] * dstWhite[1] + m[1][2] * dstWhite[2],
				m[2][0] * dstWhite[0] + m[2][1] * dstWhite[1] + m[2][2] * dstWhite[2]
			];
			return xyzArr.map(xyz => {
				let rgb = [
					m[0][0] * xyz[0] + m[0][1] * xyz[1] + m[0][2] * xyz[2],
					m[1][0] * xyz[0] + m[1][1] * xyz[1] + m[1][2] * xyz[2],
					m[2][0] * xyz[0] + m[2][1] * xyz[1] + m[2][2] * xyz[2]
				];
				rgb = [rgb[0] * dw[0] / sw[0], rgb[1] * dw[1] / sw[1], rgb[2] * dw[2] / sw[2]];
				return [
					mi[0][0] * rgb[0] + mi[0][1] * rgb[1] + mi[0][2] * rgb[2],
					mi[1][0] * rgb[0] + mi[1][1] * rgb[1] + mi[1][2] * rgb[2],
					mi[2][0] * rgb[0] + mi[2][1] * rgb[1] + mi[2][2] * rgb[2]
				];
			});
		}

		// CIE 1964 L*a*b* (with the standard low-trapiece linear branch)
		function lqLab(xyz, white) {
			const eps = 216 / 24389, kappa = 24389 / 27;
			const f = t => t > eps ? Math.cbrt(t) : (kappa * t + 16) / 116;
			const fx = f(xyz[0] / white[0]), fy = f(xyz[1] / white[1]), fz = f(xyz[2] / white[2]);
			return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
		}

		// CQS v9.0 general color quality scale Qa
		function lqCalcQaV9(spectrum) {
			// white tristimulus of test source (CIE 1931 2-deg, 1 nm grid)
			let Xw = 0, Yw = 0, Zw = 0;
			for (let i = 0; i < 401; i++) {
				Xw += spectrum[i] * triStimulusValues[i][1];
				Yw += spectrum[i] * triStimulusValues[i][2];
				Zw += spectrum[i] * triStimulusValues[i][3];
			}
			const kw = 100 / Yw;
			Xw *= kw; Zw *= kw; Yw = 100;
			const xwt = Xw / (Xw + Yw + Zw), ywt = Yw / (Xw + Yw + Zw);
			const cct = correlatedColorTemperature(xwt, ywt);
			if (cct === -1 || !isFinite(cct)) return NaN;

			// reference illuminant (CIE 13.3-1995 convention: blackbody below 5000 K, daylight above)
			const ref = cct <= 5000 ? generateBlackbodySpectrum(cct) : composedDaylight(cct);
			let Xr = 0, Yr = 0, Zr = 0;
			for (let i = 0; i < 401; i++) {
				Xr += ref[i] * triStimulusValues[i][1];
				Yr += ref[i] * triStimulusValues[i][2];
				Zr += ref[i] * triStimulusValues[i][3];
			}
			const kr = 100 / Yr;
			Xr *= kr; Zr *= kr; Yr = 100;
			const white = [Xr, Yr, Zr];

			// sample tristimulus values under both illuminants, chromatic adaptation, then dE'
			const xyzTest = [], xyzRef = [];
			for (let s = 0; s < 15; s++) {
				let Xt = 0, Yt = 0, Zt = 0, Xr2 = 0, Yr2 = 0, Zr2 = 0;
				for (let i = 0; i < 401; i++) {
					const rfl = LQ_CQS_RFL[i][s];
					Xt += spectrum[i] * rfl * triStimulusValues[i][1];
					Yt += spectrum[i] * rfl * triStimulusValues[i][2];
					Zt += spectrum[i] * rfl * triStimulusValues[i][3];
					Xr2 += ref[i] * rfl * triStimulusValues[i][1];
					Yr2 += ref[i] * rfl * triStimulusValues[i][2];
					Zr2 += ref[i] * rfl * triStimulusValues[i][3];
				}
				xyzTest.push([Xt * kw, Yt * kw, Zt * kw]);
				xyzRef.push([Xr2 * kr, Yr2 * kr, Zr2 * kr]);
			}
			const adTest = lqAdaptXYZ(xyzTest, [Xw, Yw, Zw], white);
			const labT = adTest.map(x => lqLab(x, white));
			const labR = xyzRef.map(x => lqLab(x, white));

			// dE', with chroma increase compensation (capped at 10)
			let sum = 0;
			for (let s = 0; s < 15; s++) {
				const dL = labT[s][0] - labR[s][0], dA = labT[s][1] - labR[s][1], dB = labT[s][2] - labR[s][2];
				const dE = Math.sqrt(dL * dL + dA * dA + dB * dB);
				const cT = Math.hypot(labT[s][1], labT[s][2]), cR = Math.hypot(labR[s][1], labR[s][2]);
				const dC = cT - cR;
				let dEp = dE;
				if (dC > 0) dEp = Math.sqrt(Math.max(dE * dE - Math.min(dC, 10) * Math.min(dC, 10), 0));
				sum += dEp * dEp;
			}
			const rms = Math.sqrt(sum / 15);
			return 10 * Math.log(Math.exp((100 - 3.2 * rms) / 10) + 1);
		}

		// CDI76: colour discrimination index from the gamut area of the 8 CIE samples in u'v'
		function lqCalcCDI(spectrum) {
			let Ysum = 0;
			for (let w = 400; w <= 700; w += 5) Ysum += spectrum[w - 380] * triStimulusValues[w - 380][2];
			const k = 100 / Ysum;
			const uv = [];
			for (let s = 0; s < 8; s++) {
				let X = 0, Y = 0, Z = 0;
				for (let w = 400; w <= 700; w += 5) {
					const i = w - 380;
					const p = spectrum[i] * colorSampleReflectance[i][s + 1];
					X += p * triStimulusValues[i][1];
					Y += p * triStimulusValues[i][2];
					Z += p * triStimulusValues[i][3];
				}
				X *= k; Y *= k; Z *= k;
				const x = X / (X + Y + Z), y = Y / (X + Y + Z);
				const d = -2 * x + 12 * y + 3;
				uv.push([4 * x / d, 9 * y / d]);
			}
			let area = 0;
			for (let i = 0; i < 8; i++) {
				const j = (i + 1) % 8;
				area += uv[i][0] * uv[j][1] - uv[j][0] * uv[i][1];
			}
			return Math.abs(area) / 2 / 0.005 * 100;
		}

		// Rd: FM-100 hue-test ordering error (CIE 1964 10-deg + CIECAM02-UCS hue angles)
		function lqCalcRd(spectrum) {
			// 5 nm grid (nodes of the 1 nm input), CIE 1964 10-deg CMF
			const idx5 = [];
			for (let w = 380; w <= 780; w += 5) idx5.push(w - 380);
			const n5 = idx5.length; // 81
			let Yw = 0;
			for (let j = 0; j < n5; j++) Yw += spectrum[idx5[j]] * triStimulusValues10[idx5[j]][2];
			const k = 100 / Yw;
			const capXYZ = [];
			for (let c = 0; c < 85; c++) {
				let X = 0, Y = 0, Z = 0;
				for (let j = 0; j < n5; j++) {
					const i = idx5[j];
					const p = spectrum[i] * LQ_FM_RFL[c][j];
					X += p * triStimulusValues10[i][1];
					Y += p * triStimulusValues10[i][2];
					Z += p * triStimulusValues10[i][3];
				}
				capXYZ.push([X * k, Y * k, Z * k]);
			}
			// white point on the same grid
			let Xw = 0, Zw = 0;
			for (let j = 0; j < n5; j++) {
				const i = idx5[j];
				Xw += spectrum[i] * triStimulusValues10[i][1];
				Zw += spectrum[i] * triStimulusValues10[i][3];
			}
			const xyzw = [Xw * k, 100, Zw * k];

			// CIECAM02 forward (La = 100, Yb = 20, D = 1, avg surround), then CAM02-UCS hue angles
			const mcat = [[0.7328, 0.4296, -0.1624], [-0.7036, 1.6975, 0.0061], [0.0030, 0.0136, 0.9834]];
			const mhpe = [[0.38971, 0.68898, -0.07868], [-0.22981, 1.18340, 0.04641], [0.0, 0.0, 1.0]];
			// inv(mcat)
			const det = mcat[0][0] * (mcat[1][1] * mcat[2][2] - mcat[1][2] * mcat[2][1])
				- mcat[0][1] * (mcat[1][0] * mcat[2][2] - mcat[1][2] * mcat[2][0])
				+ mcat[0][2] * (mcat[1][0] * mcat[2][1] - mcat[1][1] * mcat[2][0]);
			const inv = [
				[(mcat[1][1] * mcat[2][2] - mcat[1][2] * mcat[2][1]) / det, (mcat[0][2] * mcat[2][1] - mcat[0][1] * mcat[2][2]) / det, (mcat[0][1] * mcat[1][2] - mcat[0][2] * mcat[1][1]) / det],
				[(mcat[1][2] * mcat[2][0] - mcat[1][0] * mcat[2][2]) / det, (mcat[0][0] * mcat[2][2] - mcat[0][2] * mcat[2][0]) / det, (mcat[0][2] * mcat[1][0] - mcat[0][0] * mcat[1][2]) / det],
				[(mcat[1][0] * mcat[2][1] - mcat[1][1] * mcat[2][0]) / det, (mcat[0][1] * mcat[2][0] - mcat[0][0] * mcat[2][1]) / det, (mcat[0][0] * mcat[1][1] - mcat[0][1] * mcat[1][0]) / det]
			];
			const mhpeInv = [
				[0, 0, 0], [0, 0, 0], [0, 0, 0]
			];
			for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
				let s = 0;
				for (let m = 0; m < 3; m++) s += mhpe[i][m] * inv[m][j];
				mhpeInv[i][j] = s;
			}
			const La = 100.0, Yb = 20.0, YwCam = 100.0, cSur = 0.69, Nc = 1.0;
			const nk = x => {
				const ax = Math.abs(x);
				return Math.sign(x) * 400 * (Math.pow(ax, 0.42) / (Math.pow(ax, 0.42) + 27.13)) + 0.1;
			};
			const kw1 = 1 / (5 * La + 1);
			const FL = 0.2 * Math.pow(kw1, 4) * (5 * La) + 0.1 * Math.pow(1 - Math.pow(kw1, 4), 2) * Math.pow(5 * La, 1 / 3);
			const nCam = Yb / YwCam;
			const Nbb = 0.725 * Math.pow(1 / nCam, 0.2), Ncb = Nbb;

			const rgbw = [
				mcat[0][0] * xyzw[0] + mcat[0][1] * xyzw[1] + mcat[0][2] * xyzw[2],
				mcat[1][0] * xyzw[0] + mcat[1][1] * xyzw[1] + mcat[1][2] * xyzw[2],
				mcat[2][0] * xyzw[0] + mcat[2][1] * xyzw[1] + mcat[2][2] * xyzw[2]
			];
			const gain = [YwCam / rgbw[0], YwCam / rgbw[1], YwCam / rgbw[2]]; // D = 1
			const rgbwc = [100, 100, 100];
			const rgbwp = [
				mhpeInv[0][0] * rgbwc[0] + mhpeInv[0][1] * rgbwc[1] + mhpeInv[0][2] * rgbwc[2],
				mhpeInv[1][0] * rgbwc[0] + mhpeInv[1][1] * rgbwc[1] + mhpeInv[1][2] * rgbwc[2],
				mhpeInv[2][0] * rgbwc[0] + mhpeInv[2][1] * rgbwc[1] + mhpeInv[2][2] * rgbwc[2]
			];
			const rgbwpa = rgbwp.map(v => nk(FL * v / 100));
			const Aw = (2 * rgbwpa[0] + rgbwpa[1] + rgbwpa[2] / 20 - 0.305) * Nbb;
			const zCam = 1.48 + Math.sqrt(nCam);
			const cCamExp = cSur * zCam;
			const FLq = Math.pow(FL, 0.25);
			const hueCorr = Math.pow(1.64 - Math.pow(0.29, nCam), 0.73);

			const caps = [];
			for (let c = 0; c < 85; c++) {
				const xyz = capXYZ[c];
				const rgb = [
					mcat[0][0] * xyz[0] + mcat[0][1] * xyz[1] + mcat[0][2] * xyz[2],
					mcat[1][0] * xyz[0] + mcat[1][1] * xyz[1] + mcat[1][2] * xyz[2],
					mcat[2][0] * xyz[0] + mcat[2][1] * xyz[1] + mcat[2][2] * xyz[2]
				];
				const rgbc = [rgb[0] * gain[0], rgb[1] * gain[1], rgb[2] * gain[2]];
				const rgbp = [
					mhpeInv[0][0] * rgbc[0] + mhpeInv[0][1] * rgbc[1] + mhpeInv[0][2] * rgbc[2],
					mhpeInv[1][0] * rgbc[0] + mhpeInv[1][1] * rgbc[1] + mhpeInv[1][2] * rgbc[2],
					mhpeInv[2][0] * rgbc[0] + mhpeInv[2][1] * rgbc[1] + mhpeInv[2][2] * rgbc[2]
				];
				const rgbpa = rgbp.map(v => nk(FL * v / 100));
				const aC = rgbpa[0] - 12 * rgbpa[1] / 11 + rgbpa[2] / 11;
				const bC = (rgbpa[0] + rgbpa[1] - 2 * rgbpa[2]) / 9;
				let h = Math.atan2(bC, aC) * 180 / Math.PI;
				if (h < 0) h += 360;
				const et = (Math.cos(h * Math.PI / 180 + 2) + 3.8) / 4;
				const A = (2 * rgbpa[0] + rgbpa[1] + rgbpa[2] / 20 - 0.305) * Nbb;
				const J = 100 * Math.pow(A / Aw, cCamExp);
				const t = (50000 / 13) * Nc * Ncb * et * Math.sqrt(aC * aC + bC * bC)
					/ (rgbpa[0] + rgbpa[1] + 21 * rgbpa[2] / 20);
				const C = Math.pow(Math.max(t, 0), 0.9) * Math.sqrt(J / 100) * hueCorr;
				const Mp = Math.log(1 + 0.0228 * C * FLq) / 0.0228;
				const Jp = 1.7 * J / (1 + 0.007 * J);
				const aU = Mp * Math.cos(h * Math.PI / 180), bU = Mp * Math.sin(h * Math.PI / 180);
				let hue = Math.atan2(bU, aU) * 180 / Math.PI;
				if (hue < 0) hue += 360;
				if (c >= 64 && hue < 180) hue += 360;
				caps.push({ id: c, hue: hue });
			}
			// rank-ordering error per tray (A: 0-21, B: 22-42, C: 43-63, D: 64-84)
			const trays = [caps.slice(0, 22), caps.slice(22, 43), caps.slice(43, 64), caps.slice(64)];
			const bases = [21, 20, 20, 20];
			let Rd = 0;
			trays.forEach((tr, ti) => {
				tr.sort((p, q) => p.hue - q.hue);
				let e = 2 * (bases[ti] + tr[0].id - tr[tr.length - 1].id);
				for (let i = 0; i < tr.length - 1; i++) e += 2 * (Math.abs(tr[i + 1].id - tr[i].id) - 1);
				Rd += e;
			});
			return Rd;
		}

		// Sneutral: degree of neutrality at the source chromaticity (Smet 2014 Linvar model, 10-deg)
		function lqCalcSneutral(spectrum) {
			let X = 0, Y = 0, Z = 0;
			for (let i = 0; i < 401; i++) {
				X += spectrum[i] * triStimulusValues10[i][1];
				Y += spectrum[i] * triStimulusValues10[i][2];
				Z += spectrum[i] * triStimulusValues10[i][3];
			}
			const x = X / (X + Y + Z), y = Y / (X + Y + Z);
			const d = -2 * x + 12 * y + 3;
			const u = 4 * x / d, v = 9 * y / d;
			const a1 = 1494.9, a2 = 981.9, a3 = 0.2081, a4 = 0.4596, a5 = -722.2, a6 = 8.1;
			const mExp = -0.5 * (a1 * Math.pow(u - a3, 2) + a2 * Math.pow(v - a4, 2) + 2 * a5 * (u - a3) * (v - a4));
			return a6 * Math.exp(mExp);
		}

		// Full Lighting-Quality parameter set for one spectrum
		function calculateLightQualityMetrics(spectrum) {
			const chrom = lightSourceCoordinate(spectrum);
			const cct = correlatedColorTemperature(chrom.x, chrom.y);
			// The metrics are only defined for a valid, nearby-white-light CCT (1000-100000 K);
			// outside that range the reference illuminant itself is undefined.
			if (!isFinite(cct) || cct < 1000 || cct > 100000) {
				return {
					cct, Qa: NaN, CDI: NaN, Rd: NaN, Sn: NaN, MCPI: NaN, CDM: NaN,
					MCPIr: NaN, CDMr: NaN, prefGrade: 'NG', discGrade: 'NG', refSpd: null
				};
			}
			const Qa = lqCalcQaV9(spectrum);
			const CDI = lqCalcCDI(spectrum);
			const Rd = lqCalcRd(spectrum);
			const Sn = lqCalcSneutral(spectrum);
			const MCPI = 0.62 * Qa + 0.38 * CDI;
			const CDM = -0.07 * Rd + 0.93 * Sn;
			// reference illuminant at the (integer) CCT of the test source, CIE 224 convention
			const refSpd = generateTM30Spectrum(Math.floor(cct));
			const MCPIref = 0.62 * lqCalcQaV9(refSpd) + 0.38 * lqCalcCDI(refSpd);
			const CDMref = -0.07 * lqCalcRd(refSpd) + 0.93 * lqCalcSneutral(refSpd);
			const MCPIr = (isFinite(MCPIref) && MCPIref !== 0) ? MCPI / MCPIref * 100 : NaN;
			const CDMr = (isFinite(CDMref) && CDMref !== 0) ? (1 - (CDMref - CDM) / Math.abs(CDMref)) * 100 : NaN;
			const prefGrade = !isFinite(MCPIr) ? 'NG' : (MCPIr >= 100 ? 'A' : MCPIr >= 97 ? 'B' : MCPIr >= 85 ? 'C' : 'D');
			let discGrade = 'NG';
			if (isFinite(CDMr)) {
				if (CDMr >= 105) discGrade = 'A';
				else if (cct < 5000) discGrade = CDMr >= 85 ? 'B' : CDMr >= 50 ? 'C' : 'D';
				else discGrade = CDMr >= 95 ? 'B' : CDMr >= 75 ? 'C' : 'D';
			}
			return { cct, Qa, CDI, Rd, Sn, MCPI, CDM, MCPIr, CDMr, prefGrade, discGrade, refSpd };
		}


		// Calculate CQS parameters
		function calculateCQS(testingSpectrum){
			// Calculate chromaticity coordinates and normalization coefficient kt of the spectrum under test
			const { x: xt, y: yt, k: kt, xCapital: xwt, yCapital: ywt, zCapital: zwt } = lightSourceCoordinate(testingSpectrum);

			// Calculate the correlated color temperature CCT of the light source under test
			const cct = correlatedColorTemperature(xt, yt);

			// Determine the reference illuminant based on the color temperature of the light source under test
			let referenceSpectrum;
			if (cct <= 5000) {
				referenceSpectrum = generateBlackbodySpectrum(cct);
			} else {
				referenceSpectrum = composedDaylight(cct);
			}

			// Calculate the chromaticity coordinates and normalization coefficient kr of the reference illuminant
			const { x: xr, y: yr, k: kr, xCapital: xwr, yCapital: ywr, zCapital: zwr } = lightSourceCoordinate(referenceSpectrum);

			// Initialize calculation parameters for color samples
			const sampleNumber = 15;
			// Initialize tristimulus values of color samples under the light source under test
			const xit = new Array(sampleNumber).fill(0);
			const yit = new Array(sampleNumber).fill(0);
			const zit = new Array(sampleNumber).fill(0);
			// Initialize tristimulus values of color samples under the reference illuminant
			const xir = new Array(sampleNumber).fill(0);
			const yir = new Array(sampleNumber).fill(0);
			const zir = new Array(sampleNumber).fill(0);

			// Calculate tristimulus values of color samples under both the light source under test and reference illuminant
			for (let i = 0; i < sampleNumber; i++) {
				const colorSample = cqsColorSample.map(row => row[i + 1]);
				const { X: xitValue, Y: yitValue, Z: zitValue } = colorSampleCoordinate(colorSample, testingSpectrum, kt);
				const { X: xirValue, Y: yirValue, Z: zirValue } = colorSampleCoordinate(colorSample, referenceSpectrum, kr);

				xit[i] = xitValue;
				yit[i] = yitValue;
				zit[i] = zitValue;
				xir[i] = xirValue;
				yir[i] = yirValue;
				zir[i] = zirValue;	
			}

			//  Calculate RGB values of the light source under test and reference illuminant
			const [rwt, gwt, bwt] = xyzToRgbCQS(xwt, ywt, zwt);
			const [rwr, gwr, bwr] = xyzToRgbCQS(xwr, ywr, zwr);

			// Initialize RGB values of color samples under the light source under test
			const rit = new Array(sampleNumber).fill(0);
			const git = new Array(sampleNumber).fill(0);
			const bit = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				[rit[i], git[i], bit[i]] = xyzToRgbCQS(xit[i], yit[i], zit[i]);
			}

			// Initialize RcGcBc values of color samples under the light source under test
			const rcit = new Array(sampleNumber).fill(0);
			const gcit = new Array(sampleNumber).fill(0);
			const bcit = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				[rcit[i], gcit[i], bcit[i]] = correspondingAdapt(rit[i], git[i], bit[i], rwt, gwt, bwt, rwr, gwr, bwr, ywt, ywr);
			}

			// Transform RcGcBc values of color samples back to XYZ 
			const xcit = new Array(sampleNumber).fill(0);
			const ycit = new Array(sampleNumber).fill(0);
			const zcit = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				[xcit[i], ycit[i], zcit[i]] = rgbToXyzCQS(rcit[i], gcit[i], bcit[i]);
			}

			// Initialize Lab values of color samples under both the light source under test and reference illuminant
			const lits = new Array(sampleNumber).fill(0);
			const aits = new Array(sampleNumber).fill(0);
			const bits = new Array(sampleNumber).fill(0);
			const lirs = new Array(sampleNumber).fill(0);
			const airs = new Array(sampleNumber).fill(0);
			const birs = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				[lits[i], aits[i], bits[i]] = labCalculate(xcit[i], ycit[i], zcit[i], xwt, ywt, zwt);
				[lirs[i], airs[i], birs[i]] = labCalculate(xir[i], yir[i], zir[i], xwr, ywr, zwr);
			}

			// Calculate saturation of the light source under test and reference illuminant 
			const cits = new Array(sampleNumber).fill(0);
			const cirs = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				cits[i] = chromaCalculate(aits[i], bits[i]);
				cirs[i] = chromaCalculate(airs[i], birs[i]);
			}

			// Calculate lightness difference, chroma difference, saturation difference, and color difference
			const deltaLi = new Array(sampleNumber).fill(0);
			const deltaAi = new Array(sampleNumber).fill(0);
			const deltaBi = new Array(sampleNumber).fill(0);
			const deltaCi = new Array(sampleNumber).fill(0);
			const deltaEi = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				deltaLi[i] = lits[i] - lirs[i];
				deltaAi[i] = aits[i] - airs[i];
				deltaBi[i] = bits[i] - birs[i];
				deltaCi[i] = cits[i] - cirs[i];
				deltaEi[i] = Math.sqrt(deltaLi[i] ** 2 + deltaAi[i] ** 2 + deltaBi[i] ** 2);
			}

			// Apply saturation factor correction
			const deltaEis = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				if (deltaCi[i] > 0) {
					deltaEis[i] = Math.sqrt(deltaEi[i] ** 2 - deltaCi[i] ** 2);
				} else {
					deltaEis[i] = deltaEi[i];
				}
			}

			// Calculate root mean square (RMS) of color differences
			let deltaERms = 0;
			for (let i = 0; i < sampleNumber; i++) {
				deltaERms += deltaEis[i] ** 2;
			}
			deltaERms = Math.sqrt(deltaERms / sampleNumber);

			// Calculate Qa_RMS
			let qaRms = 100 - 3.1 * deltaERms;

			// Perform 0-100 adjustment
			let qa100 = 10 * Math.log(Math.exp(qaRms / 10) + 1);

			// Apply color temperature factor correction
			let mcct;
			if (cct === -1 || cct >= 3500) {
				mcct = 1;
			} else {
				mcct = cct ** 3 * 9.2672e-11 - cct ** 2 * 8.3959e-7 + cct * 0.00255 - 1.612;
			}

			const qa = mcct * qa100;

			// Calculate special color quality metric Qi
			const qiPre = new Array(sampleNumber).fill(0);
			const qi100 = new Array(sampleNumber).fill(0);
			const qi = new Array(sampleNumber).fill(0);

			for (let i = 0; i < sampleNumber; i++) {
				qiPre[i] = 100 - 3.1 * deltaEis[i];
				qi100[i] = 10 * Math.log(Math.exp(qiPre[i] / 10) + 1);
				qi[i] = mcct * qi100[i];
			}

			// Calculate color fidelity index Qf 
			let deltaERmsQf = 0;
			for (let i = 0; i < sampleNumber; i++) {
				deltaERmsQf += deltaEi[i] ** 2;
			}
			deltaERmsQf = Math.sqrt(deltaERmsQf / sampleNumber);

			let qfRms = 100 - 2.93 * deltaERmsQf;
			let qf100 = 10 * Math.log(Math.exp(qfRms / 10) + 1);
			const qf = mcct * qf100;

			// Calculate color preference index Qp
			const ki = new Array(sampleNumber).fill(0);
				let deltaEisQp = new Array(sampleNumber).fill(0);

				for (let i = 0; i < sampleNumber; i++) {
					if (deltaCi[i] > 0) {
						deltaEisQp[i] = Math.sqrt(deltaEi[i] ** 2 - deltaCi[i] ** 2);
						ki[i] = 1;
					} else {
						deltaEisQp[i] = deltaEi[i];
						ki[i] = 0;
					}
				}

				let deltaERmsQp = 0;
				for (let i = 0; i < sampleNumber; i++) {
					deltaERmsQp += deltaEisQp[i] ** 2;
				}
				deltaERmsQp = Math.sqrt(deltaERmsQp / sampleNumber);

				let sumCiKi = 0;
				for (let i = 0; i < sampleNumber; i++) {
					sumCiKi += deltaCi[i] * ki[i];
				}

				let qpRms = 100 - 3.78 * (deltaERmsQp - sumCiKi / sampleNumber);
				let qp100 = 10 * Math.log(Math.exp(qpRms / 10) + 1);
				const qp = mcct * qp100;

				// Calculate the color gamut area Qg
				const qg = polygonArea(aits, bits) / 8210 * 100;
			
			return [qa, qi, qf, qp, qg];
		}

		// Convert XYZ to linear RGB
		function xy2RGB(x, y) {
			let dr, dg, db;
			const z = 1 - x - y
			dr = 0.4185 * x - 0.1587 * y - 0.0828 * z;
			dg = -0.0912 * x + 0.2524 * y + 0.0157 * z;
			db = 0.0009 * x - 0.0025 * y + 0.1786 * z;

			let max = Math.max(dr, dg, db);
			dr = dr / max * 255;
			dg = dg / max * 255;
			db = db / max * 255;

			dr = Math.max(dr, 0);
			dg = Math.max(dg, 0);
			db = Math.max(db, 0);

			dr = Math.min(dr, 255);
			dg = Math.min(dg, 255);
			db = Math.min(db, 255);

			let r = Math.round(dr);
			let g = Math.round(dg);
			let b = Math.round(db);

			return [r, g, b];
		}

		// Check if point is within the horseshoe-shaped gamut
		function isInGamut(x, y) {
			if (x < 0 || x > 0.8 || y < 0 || y > 0.9) return false;
			if (1 - x - y < 0) return false;
			
			const n = polygonX.length;
			let inside = false;

			for (let i = 0, j = n - 1; i < n; j = i++) {
				const p1x = polygonX[i];
				const p1y = polygonY[i];
				const p2x = polygonX[j];
				const p2y = polygonY[j];

				if (y > Math.min(p1y, p2y) && y <= Math.max(p1y, p2y) && x <= Math.max(p1x, p2x)) {
					if (p1y !== p2y) {
						const xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
						if (p1x === p2x || x <= xinters) {
							inside = !inside;
						}
					}
				}
			}

			return inside;
		}

		// Draw coordinate system
		function drawCoordinateSystem() {
			// Get drawing context
			const ctx = canvasCie.getContext('2d');

			// Chart parameters
			const margin = Math.floor(0.1 * canvasCie.width);

			// Coordinate range settings
			const xMin = -0.05, xMax = 0.8;
			const yMin = 0, yMax = 0.85;
			const width = canvasCie.width - 2 * margin;
			const height = canvasCie.height - 2 * margin;

			// Draw outer frame
			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth = 3;
			ctx.strokeRect(margin, margin, width, height);
			ctx.fillStyle = TLCI_TEXT;
			ctx.font = 'bold italic 30px Heiti SC';

			// Draw x-axis ticks
			for (let x = 0; x <= xMax; x += 0.1) {
				const canvasX = (x - xMin) / (xMax - xMin) * width + margin;

				// Main tick line
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(canvasX, height + margin);
				ctx.lineTo(canvasX, height + margin + 15);
				ctx.stroke();

				// Tick label
				ctx.fillText(x.toFixed(1), canvasX - 26, height + margin + 44);

				// Grid line
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(canvasX, margin);
				ctx.lineTo(canvasX, height + margin);
				ctx.stroke();

				// Intermediate dashed line
				if (x + 0.05 <= xMax) {
					const midX = canvasX + (0.05 / (xMax - xMin)) * width;
					ctx.beginPath();
					ctx.setLineDash([4, 2]);
					ctx.moveTo(midX, margin);
					ctx.lineTo(midX, height + margin);
					ctx.stroke();
					ctx.setLineDash([]);
				}
			}

			// Draw y-axis ticks
			for (let y = 0; y <= yMax; y += 0.1) {
				const canvasY = height - (y - yMin) / (yMax - yMin) * height + margin;

				// Main tick line
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(margin, canvasY);
				ctx.lineTo(margin - 15, canvasY);
				ctx.stroke();

				// Tick label
				ctx.fillText(y.toFixed(1), margin - 70, canvasY + 9);

				// Grid line
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(margin, canvasY);
				ctx.lineTo(width + margin, canvasY);
				ctx.stroke();

				// Intermediate dashed line
				if (y + 0.05 <= yMax) {
					const midY = canvasY - (0.05 / (yMax - yMin)) * height;
					ctx.beginPath();
					ctx.setLineDash([4, 2]);
					ctx.moveTo(margin, midY);
					ctx.lineTo(width + margin, midY);
					ctx.stroke();
					ctx.setLineDash([]);
				}
			}

			// Draw axis titles
			ctx.save(); // Save current state
			ctx.textAlign = 'center';
			ctx.font = 'bold italic 40px Heiti SC';
			ctx.fillText('x', margin + width / 2, canvasCie.height - margin / 4); // x-axis title
			ctx.fillText('y', margin / 4, margin + height / 2); // y-axis title
			ctx.restore(); // Restore state
		}

		// Draw black-body curve
		function drawBlackBodyCurve() {
			// Get drawing context
			const ctx = canvasCie.getContext('2d');

			// Chart parameters
			const margin = Math.floor(0.1 * canvasCie.width);

			// Coordinate range settings
			const xMin = -0.05, xMax = 0.8;
			const yMin = 0, yMax = 0.85;
			const width = canvasCie.width - 2 * margin;
			const height = canvasCie.height - 2 * margin;

			ctx.beginPath();
			let firstPoint = true;

			// Draw curve
			for (let i = 0; i < blackBodyLocus.length; i++) {
				const point = blackBodyLocus[i];
				const canvasX = (point[1] - xMin) / (xMax - xMin) * width + margin;
				const canvasY = height - (point[2] - yMin) / (yMax - yMin) * height + margin;

				if (firstPoint) {
					ctx.moveTo(canvasX, canvasY);
					firstPoint = false;
				} else {
					ctx.lineTo(canvasX, canvasY);
				}
			}

			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth = 2;
			ctx.stroke();

			// Label conventional CCT points (starting from 1800 K)
			const tempLabels = [1800, 2200, 2700, 3000, 3500, 4000, 5000, 5700, 6500, 10000];

			// Set font style
			ctx.font = 'bold italic 20px Heiti SC';

			for (let i = 0; i < blackBodyLocus.length; i++) {
				const point = blackBodyLocus[i];
				if (tempLabels.includes(point[0])) {
					const canvasX = (point[1] - xMin) / (xMax - xMin) * width + margin;
					const canvasY = height - (point[2] - yMin) / (yMax - yMin) * height + margin;

					// Calculate tangent angle
					let angle = 0;
					if (i > 0 && i < blackBodyLocus.length - 1) {
						const prev = blackBodyLocus[i-1];
						const next = blackBodyLocus[i+1];
						const dx = next[1] - prev[1];
						const dy = next[2] - prev[2];
						angle = Math.atan2(dy, dx);
					}

					// Draw tick line (above)
					ctx.beginPath();
					ctx.moveTo(canvasX, canvasY);
					const tickLen = 15;
					const tickX = canvasX - Math.cos(angle + Math.PI/2) * tickLen;
					const tickY = canvasY + Math.sin(angle + Math.PI/2) * tickLen;
					ctx.lineTo(tickX, tickY);
					ctx.strokeStyle = TLCI_AXIS;
					ctx.lineWidth = 2;
					ctx.stroke();

					// Draw label (parallel to tick line)
					ctx.save();
					ctx.translate(tickX, tickY);
					ctx.rotate(-angle + Math.PI/2);
					ctx.textAlign = 'center';
					ctx.textBaseline = 'bottom';

					// First draw white stroke text (outline effect)
					ctx.strokeStyle = TLCI_HALO;
					ctx.lineWidth = 4;
					ctx.strokeText(point[0].toString(), 26, 10);

					// Then draw black filled text
					ctx.fillStyle = TLCI_TEXT;
					ctx.fillText(point[0].toString(), 26, 10);
					ctx.restore();
				}
			}

			// Label special CCT point (∞K)
			ctx.font = 'bold italic 28px Heiti SC';
			const canvasX0 = (0.239918 - xMin) / (xMax - xMin) * width + margin;
			const canvasY0 = height - (0.234182 - yMin) / (yMax - yMin) * height + margin;
			angle = -3*Math.PI/4+Math.PI/24;
			// Draw tick line (above)
			ctx.beginPath();
			ctx.moveTo(canvasX0, canvasY0);
			const tickLen = 15;
			const tickX = canvasX0 - Math.cos(angle + Math.PI/2) * tickLen;
			const tickY = canvasY0 + Math.sin(angle + Math.PI/2) * tickLen;
			ctx.lineTo(tickX, tickY);
			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth = 2;
			ctx.stroke();
			// Draw label (parallel to tick line)
			ctx.save();
			ctx.translate(tickX, tickY);
			ctx.rotate(-angle + Math.PI/2);
			ctx.textAlign = 'right';
			ctx.textBaseline = 'bottom';

			// First draw white stroke text (outline effect)
			ctx.strokeStyle = TLCI_HALO;
			ctx.lineWidth = Math.floor(3);
			ctx.strokeText('∞', 27, 15);

			// Then draw black filled text
			ctx.fillStyle = TLCI_TEXT;
			ctx.fillText('∞', 27, 15);
			ctx.restore();
		}

		// Draw wavelength labels
		function drawWavelengthLabels() {
			// Get drawing context
			const ctx = canvasCie.getContext('2d');

			// Chart parameters
			const margin = Math.floor(0.1 * canvasCie.width);

			// Coordinate range settings
			const xMin = -0.05, xMax = 0.8;
			const yMin = 0, yMax = 0.85;
			const width = canvasCie.width - 2 * margin;
			const height = canvasCie.height - 2 * margin;

			// Set font style
			ctx.font = 'bold italic 24px Heiti SC';  // bold italic
			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth = 1;

			// Label wavelengths 450-650 nm, every 10 nm
			for (let i = 0; i < monochromaticData.length; i++) {
				const wavelength = monochromaticData[i][0];
				if (wavelength >= 450 && wavelength <= 650 && wavelength != 640 && wavelength != 630 && wavelength != 460 && wavelength % 10 === 0) {
					const x = monochromaticData[i][1];
					const y = monochromaticData[i][2];

					const canvasX = (x - xMin) / (xMax - xMin) * width + margin;
					const canvasY = height - (y - yMin) / (yMax - yMin) * height + margin;

					// Calculate tangent angle
					let angle = 0;
					if (i > 0 && i < monochromaticData.length - 1) {
						const prev = monochromaticData[i-1];
						const next = monochromaticData[i+1];
						const dx = next[1] - prev[1];
						const dy = next[2] - prev[2];
						angle = Math.atan2(dy, dx);
					}

					// Draw tick line
					ctx.beginPath();
					ctx.moveTo(canvasX, canvasY);
					const tickLen = 15;  // tick line length

					// Calculate tick line end and label position
					const tickX = canvasX + Math.cos(angle + Math.PI/2) * tickLen;
					const tickY = canvasY - Math.sin(angle + Math.PI/2) * tickLen;

					ctx.lineTo(tickX, tickY);
					ctx.strokeStyle = TLCI_AXIS;
					ctx.lineWidth = 3;
					ctx.stroke();

					// Adjust text alignment (choose alignment direction automatically according to angle)
					if (angle + Math.PI/2 > 2*Math.PI/3 && angle + Math.PI/2 < 3*Math.PI/2) {
						ctx.textAlign = 'right';  // left label right-aligned
						labelOffset = 10;  // distance between label and tick line
					} else {
						ctx.textAlign = 'center';   // right label left-aligned
					}
					ctx.textBaseline = 'middle';

					// Use labelOffset directly as spacing (no textRadius added)
					const labelX = tickX + Math.cos(angle + Math.PI/2) * labelOffset;
					const labelY = tickY - Math.sin(angle + Math.PI/2) * labelOffset;
					const text = wavelength.toString();

					// Draw label (with white outline)
					ctx.save();
					ctx.translate(labelX, labelY);

					// First draw white stroke (outline effect)
					ctx.strokeStyle = TLCI_HALO;
					ctx.lineWidth = 4;
					ctx.strokeText(text, 0, 0);

					// Then draw black text
					ctx.fillStyle = TLCI_TEXT;
					ctx.fillText(text, 0, 0);
					ctx.restore();
				}
			}
		}

		// Draw CIE 1931 chromaticity diagram
		function drawCieDiagram() {
			// Get drawing context
			const ctx = canvasCie.getContext('2d');

			// Chart parameters
			const margin = Math.floor(0.1 * canvasCie.width);
			const scale = canvasCie.width / 800

			// Coordinate range settings
			const xMin = -0.05, xMax = 0.8;
			const yMin = 0, yMax = 0.85;
			const width = canvasCie.width - 2 * margin;
			const height = canvasCie.height - 2 * margin;

			// Draw coordinate system (this clears the canvas)
			drawCoordinateSystem();

			// Create a temporary canvas to draw the chromaticity diagram
			const tempCanvas = document.createElement('canvas');
			const tempCtx = tempCanvas.getContext('2d');
			tempCanvas.width = width;
			tempCanvas.height = height;

			// Create image data
			const imageData = ctx.createImageData(width, height);
			const data = imageData.data;

			// Draw interior colors of the gamut
			for (let y = 0; y < height; y++) { // start from 0, end at height
				for (let x = 0; x < width; x++) { // start from 0, end at width
					// Convert to CIE xy coordinates
					const cieX = xMin + (x / width) * (xMax - xMin);
					const cieY = yMin + ((height - y) / height) * (yMax - yMin);

					// Check if inside the gamut
					if (!isInGamut(cieX, cieY)) {
						// Outside gamut, keep transparent
						continue;
					}

					// Convert to sRGB
					const [r, g, b] = xy2RGB(cieX, cieY);

					// Set pixel color
					const idx = (y * width + x) * 4;
					data[idx] = r;
					data[idx + 1] = g;
					data[idx + 2] = b;
					data[idx + 3] = 240; // keep a certain transparency (alpha = 240)
				}
			}

			// Draw image data onto the temporary canvas
			tempCtx.putImageData(imageData, 0, 0);

			// Set drawing mode to 'source-over' to ensure the chromaticity diagram does not overwrite the coordinate system
			ctx.globalCompositeOperation = 'source-over';

			// Draw the temporary canvas onto the main canvas
			ctx.drawImage(tempCanvas, margin, margin);

			// Get boundary points
			const boundaryPoints = monochromaticData.map(item => ({
				x: item[1],
				y: item[2]
			}));

			// Draw black boundary line
			ctx.beginPath();
			boundaryPoints.forEach((p, i) => {
				const canvasX = (p.x - xMin) / (xMax - xMin) * width + margin;
				const canvasY = height - (p.y - yMin) / (yMax - yMin) * height + margin;

				if (i === 0) {
					ctx.moveTo(canvasX, canvasY);
				} else {
					ctx.lineTo(canvasX, canvasY);
				}
			});
			ctx.closePath();
			ctx.strokeStyle = TLCI_AXIS;
			ctx.lineWidth = 2;
			ctx.stroke();

			// Draw black-body line and labels
			drawBlackBodyCurve()

			// Draw wavelength labels
			drawWavelengthLabels()
		}

		// Draw CIE 1931 chromaticity coordinates
		function drawCoordinate(x_1931 = 0.3333, y_1931 = 0.3333){
			// Get drawing context
			const ctx = canvasCoordinate.getContext('2d');

			// Chart parameters
			const margin = Math.floor(0.1 * canvasCoordinate.width);
			const scale = canvasCoordinate.width / 800

			// Coordinate range settings
			const xMin = -0.05, xMax = 0.8;
			const yMin = 0, yMax = 0.85;
			const width = canvasCoordinate.width - 2 * margin;
			const height = canvasCoordinate.height - 2 * margin;

			const pixelX = margin + (x_1931 - xMin) * (width / (xMax - xMin));
			const pixelY = margin + height - (y_1931 - yMin) * (height / (yMax - yMin));

			ctx.clearRect(0, 0, canvasCoordinate.width, canvasCoordinate.height);

			ctx.fillStyle = '#E8E8E8';
			ctx.strokeStyle = TLCI_HALO;
			ctx.lineWidth = 2 * scale;
			ctx.beginPath();
			ctx.arc(
				pixelX,
				pixelY,
				5 * scale, 0, Math.PI * 2
			);
			ctx.fill();
			ctx.stroke();
		}
		
				// Linear Interpolation from 5‑nm Sequence to 1‑nm Grid (380‑780 nm)
		function tlciInterp5to1(series) {
			const out = new Array(wavelengths.length);
			for (let i = 0; i < wavelengths.length; i++) {
				const lam = wavelengths[i];
				if (lam < 380 || lam > 760) { out[i] = 0; continue; }
				const x = (lam - 380) / 5;
				const i0 = Math.min(Math.floor(x), series.length - 2);
				const fr = x - i0;
				out[i] = series[i0] * (1 - fr) + series[i0 + 1] * fr;
			}
			return out;
		}

		function tlciPrepareData() {
			if (TLCI_CAM_1NM !== null) return;
			TLCI_CAM_1NM = [tlciInterp5to1(TLCI_CAM_R_5NM),
							tlciInterp5to1(TLCI_CAM_G_5NM),
							tlciInterp5to1(TLCI_CAM_B_5NM)];
			TLCI_TCS_1NM = TLCI_TCS_5NM.map(tlciInterp5to1);
		}

		const tlciOetf = v => v < 0.018 ? 4.5 * v : 1.099 * Math.pow(Math.max(v, 0.018), 0.45) - 0.099;

		// Vector × Matrix (rows = output channels)
		function tlciMatVec(a, M) {
			return [0, 1, 2].map(r => a[0] * M[r][0] + a[1] * M[r][1] + a[2] * M[r][2]);
		}

		// EBU Standard Camera Pipeline: White‑balance to 0.9 neutral reflectance → 3×3 Optimization Matrix → 90%‑Saturation Matrix → BT.709 OETF
		function tlciCameraPipeline(spectrum, cam, tcs) {
			const n = spectrum.length;
			const rgbN = [0, 0, 0];
			for (let j = 0; j < n; j++) {
				for (let c = 0; c < 3; c++) rgbN[c] += spectrum[j] * 0.9 * cam[c][j];
			}
			const out = [], clipped = [];
			for (let i = 0; i < 24; i++) {
				const rgb = [0, 0, 0];
				for (let j = 0; j < n; j++) {
					const sc = spectrum[j] * tcs[i][j];
					rgb[0] += sc * cam[0][j];
					rgb[1] += sc * cam[1][j];
					rgb[2] += sc * cam[2][j];
				}
				rgb[0] /= rgbN[0];
				rgb[1] /= rgbN[1];
				rgb[2] /= rgbN[2];
				const m = tlciMatVec(rgb, TLCI_M_CAMERA);
				const sat = tlciMatVec(m, TLCI_M_SAT);
				clipped.push(m.some(v => v < 0) || sat.some(v => v < 0));
				out.push(sat.map(v => Math.min(tlciOetf(Math.max(v, 0)), TLCI_SWING_WHITE)));
			}
			return [out, clipped];
		}

		function tlciXyzToLab(xyz) {
			const f = t => t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29;
			const fx = f(xyz[0] / TLCI_WHITE_D65[0]);
			const fy = f(xyz[1] / TLCI_WHITE_D65[1]);
			const fz = f(xyz[2] / TLCI_WHITE_D65[2]);
			return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
		}

		// CIEDE2000 (kL = kC = kH = 1)
		function tlciDeltaE2000(lab1, lab2) {
			const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2];
			const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];
			const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
			const Cbar = (C1 + C2) / 2;
			const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
			const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
			const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
			const h1p = (a1p === 0 && b1 === 0) ? 0 : ((Math.atan2(b1, a1p) * 180 / Math.PI) % 360 + 360) % 360;
			const h2p = (a2p === 0 && b2 === 0) ? 0 : ((Math.atan2(b2, a2p) * 180 / Math.PI) % 360 + 360) % 360;
			const dLp = L2 - L1, dCp = C2p - C1p;
			let dhp = 0;
			if (C1p * C2p !== 0) {
				dhp = h2p - h1p;
				if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
			}
			const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);
			const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
			let hbp = (h1p + h2p) / 2;
			if (C1p * C2p !== 0 && Math.abs(h1p - h2p) > 180) hbp += (h1p + h2p < 360) ? 180 : -180;
			const T = 1 - 0.17 * Math.cos((hbp - 30) * Math.PI / 180) + 0.24 * Math.cos(2 * hbp * Math.PI / 180)
				+ 0.32 * Math.cos((3 * hbp + 6) * Math.PI / 180) - 0.20 * Math.cos((4 * hbp - 63) * Math.PI / 180);
			const dtheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
			const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
			const SL = 1 + 0.015 * Math.pow(Lbp - 50, 2) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
			const SC = 1 + 0.045 * Cbp;
			const SH = 1 + 0.015 * Cbp * T;
			const RT = -Math.sin(2 * dtheta * Math.PI / 180) * RC;
			const tL = dLp / SL, tC = dCp / SC, tH = dHp / SH;
			return Math.sqrt(tL * tL + tC * tC + tH * tH + RT * tC * tH);
		}

		// TLCI‑2012 Reference Illuminant:
		// CCT <  3400 K -> Planck (black‑body) radiation
		// CCT >= 5000 K -> CIE daylight
		// 3400‑5000 K -> Per EBU Tech 3355, linearly interpolate normalized P(3400K) and D(5000K) at 560 nm = 100
		// after normalization
		// Reuse existing generateBlackbodySpectrum / composedDaylight of this program directly for spectra.
		function tlciReferenceSpectrum(cct) {
			if (!(cct > 0)) return generateBlackbodySpectrum(4000);
			if (cct < 3400) return generateBlackbodySpectrum(cct);
			if (cct >= 5000) return composedDaylight(cct);
			const idx560 = 560 - wavelengths[0];
			const norm560 = sp => {
				const r = sp[idx560] || 1;
				return sp.map(v => 100 * v / r);
			};
			const p34 = norm560(generateBlackbodySpectrum(3400));
			const d50 = norm560(composedDaylight(5000));
			return p34.map((v, j) => (v * (5000 - cct) + d50[j] * (cct - 3400)) / 1600);
		}

		// TLCI‑2012 main calculation: returns Qa and sub‑scores Q1‑Q18 for 18 patches
		// Sub‑scores adopt the same formulation as Qa: Qi = 100 / (1 + (ΔE00_i / 3.16)^2.4)
		function calculateTLCI(spectrum, cct) {
			tlciPrepareData();
			const ref = tlciReferenceSpectrum(cct);
			const [rgbT, clipT] = tlciCameraPipeline(spectrum, TLCI_CAM_1NM, TLCI_TCS_1NM);
			const [rgbR, clipR] = tlciCameraPipeline(ref, TLCI_CAM_1NM, TLCI_TCS_1NM);

			const patches = [];
			for (let i = 0; i < 18; i++) {
				if (clipT[i] || clipR[i]) {
					patches.push({ name: TLCI_PATCH_NAMES[i], de: null, score: null, clipped: true });
					continue;
				}
				const labT = tlciXyzToLab(tlciMatVec(rgbT[i].map(v => Math.pow(v, 2.4)), TLCI_M_DISPLAY));
				const labR = tlciXyzToLab(tlciMatVec(rgbR[i].map(v => Math.pow(v, 2.4)), TLCI_M_DISPLAY));
				const de = tlciDeltaE2000(labT, labR);
				patches.push({
					name: TLCI_PATCH_NAMES[i],
					de: de,
					score: 100 / (1 + Math.pow(de / TLCI_K_Q, TLCI_P_Q)),
					clipped: false
				});
			}

			const used = patches.filter(p => p.de !== null);
			let qa = NaN, dEa = NaN;
			if (used.length) {
				dEa = Math.pow(used.reduce((acc, p) => acc + Math.pow(p.de, 4), 0) / used.length, 0.25);
				qa = 100 / (1 + Math.pow(dEa / TLCI_K_Q, TLCI_P_Q));
			}
			return { qa: qa, dEa: dEa, patches: patches, referenceSpectrum: ref };
		}

		// Automatically select foreground color based on patch background color to ensure contrast under dark‑theme mode
		// Show spectra below results
		function displayCurrentSpectrum(wavelengths, intensities, referenceSpectrum, tm30ReferenceSpectrum) {
			const spectrumTable = document.createElement('table');
			spectrumTable.id = 'spectrumResultTable'; // Add ID for copy function
			const headerRow = document.createElement('tr');
			const headers = ['Wavelength (nm)', 'Original Spectrum', 'Reference Spectrum (Ra)', 'Reference Spectrum (TM‑30)'];
			headers.forEach(headerText => {
				const th = document.createElement('th');
				th.textContent = headerText;
				headerRow.appendChild(th);
			});
			spectrumTable.appendChild(headerRow);

			wavelengths.forEach((wavelength, index) => {
				const row = document.createElement('tr');
				row.innerHTML = `
					<td>${wavelength}</td>
					<td>${intensities[index].toFixed(6)}</td>
					<td>${referenceSpectrum[index].toFixed(6)}</td>
					<td>${tm30ReferenceSpectrum[index].toFixed(6)}</td>
				`;
				spectrumTable.appendChild(row);
			});

			const resultsDiv = document.getElementById('results');
			// Heading and the spectral data table share one card
			const specCard = document.createElement('div');
			specCard.className = 'result-card2';
			specCard.innerHTML = `
				<h2>Spectral Data</h2>
				<p>Detailed spectral data table below:</p>
			`;
			specCard.appendChild(spectrumTable);
			resultsDiv.appendChild(specCard);
		}

		// Copy to Clipboard: copies the "Original Spectrum" column only
		// (401 relative values, peak = 1, one value per line)
		function copyTable() {
			const values = [...document.querySelectorAll('#spectrumResultTable tr:not(:first-child)')]
				.map(tr => tr.children[1].textContent);
			if (!values.length) {
				showToast('No spectral data to copy. Please calculate first.');
				return;
			}
			navigator.clipboard.writeText(values.join('\n'))
				.then(() => showToast('Copied 401-point relative spectrum (peak = 1, one value per line)'))
				.catch(err => console.error('Copy spectrum failed:', err));
		}

		// Show a transient message next to the buttons; auto-hides after 3 seconds
		let toastTimer = null;
		function showToast(message) {
			const toast = document.getElementById('toastMsg');
			toast.textContent = message;
			toast.classList.add('show');
			clearTimeout(toastTimer);
			toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
		}

		// Export the spectral data table (wavelength + all spectra columns) as a CSV file
		function saveTableAsCsv() {
			const table = document.getElementById('spectrumResultTable');
			if (!table) {
				showToast('No spectral data to export. Please calculate first.');
				return;
			}
			const rows = [[...table.rows[0].cells].map(th => th.textContent)];
			for (let i = 1; i < table.rows.length; i++) {
				rows.push([...table.rows[i].cells].map(td => td.textContent));
			}
			const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
			const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'Spectral_Data.csv';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
			showToast('Saved 401-point spectral data to Spectral_Data.csv');
		}
		
		// Calculate and display results
		function calculate() {
			// On page load the input box is still empty: keep the built-in default
			// spectrum and skip parsing (and don't show an alert). Only when the
			// user has actually typed something is the input parsed and validated.
			if (document.getElementById('spectrum').value.trim()) {
				if (!loadData()) return;
			}

			// Get WPE value; default to 70 % if nothing is entered
			const wpeInput = document.getElementById('wpe').value;
			const wpe = wpeInput ? parseFloat(wpeInput) : 70;

			// Calculate chromaticity coordinates and correlated color temperature for the input spectrum
			const result = lightSourceCoordinate(intensities);
			const cct = correlatedColorTemperature(result.x, result.y);

			// Calculate CIE 1960 chromaticity coordinates
			const [u, v] = cie1931ToCie1960(result.x, result.y);

			// Calculate CIE 1976 u' and v'
			const up = u; // CIE 1976 u' equals CIE 1960 u
			const vp = (3 / 2) * v; // CIE 1976 v' equals 1.5 x CIE 1960 v

			let Duv;
			if (cct >= 1000 && cct <= 20000) {
				// Calculate Duv directly by index
				const startIndex = 1000; // Starting CCT of the black-body locus array
				const closestIndex = cct - startIndex;

				const xb = blackBodyLocus[closestIndex][1];
				const yb = blackBodyLocus[closestIndex][2];

				const [ub, vb] = cie1931ToCie1960(xb, yb);

				const sign = (v - vb) >= 0 ? 1 : -1;
				Duv = sign * Math.sqrt((u - ub) ** 2 + (v - vb) ** 2);
			} else {
				Duv = -1; // out of range
			}

			// Calculate dominant wavelength and color purity
			const dominantWavelengthAndPurity = cie1931ToDominantWavelengthAndPurity(result.x, result.y);
			const dominantWavelength = dominantWavelengthAndPurity.wavelength;
			const purity = dominantWavelengthAndPurity.purity;
			const wavelengthType = dominantWavelengthAndPurity.type;

			// Calculate COI
			const coi = calculateCOI(intensities);

			// Calculate luminous efficacy and LER
			const efficacy = calculateEfficacy(intensities, wpe);
			const LER = calculateEfficacy(intensities, 100);

			// Choose black-body spectrum or reconstituted daylight spectrum as reference for CRI, based on CCT
			const referenceSpectrum = cct <= 5000 ? generateBlackbodySpectrum(cct) : composedDaylight(cct);

			// Choose reference spectrum for TM-30 calculation based on CCT
			const tm30ReferenceSpectrum = generateTM30Spectrum(cct);

			// Calculate color rendering indices Ra, Re, Ri
			const [ra, re, specialRi] = colorRenderingIndex(intensities);

			// Calculate TLCI-2012 (Qa) and the per-patch scores Q1-Q18
			const tlci = calculateTLCI(intensities, cct);

			// Call TM-30 calculation function to compute Rf and Rg
			const [rf, rg, rcshj, rhshj, rfhj, rfi, aptj, bptj, aprj, bprj, perBin, cesColors, binColors, arrowColors] = calculateTM30(intensities);

			// Calculate MPR and MDER
			const [MPR, MDER] = calculateMPR(intensities);

			// Calculate SP Ratio
			const SPR = calculateSPR(intensities);

			// Calculate spectral fitting coefficient GFC and spectral similarity index SSI
			const GFC = calculateGFC(intensities, cct);
			const SSI = calculateSSI(intensities, cct);

			// Calculate Lighting Quality parameters (MCPI / CDM, per LQMT / team standard)
			const lq = calculateLightQualityMetrics(intensities);

			// Display chromaticity coordinates, CCT, Duv, dominant wavelength, color purity, COI, luminous efficacy and CRI
			const resultsDiv = document.getElementById('results');
			resultsDiv.innerHTML = `
				<div class="result-card1">
					<h3>Basic Parameters</h3>
					<p><strong>CIE 1931 coordinates:</strong> x=<span class="result-value">${result.x.toFixed(4)}</span>, y=<span class="result-value">${result.y.toFixed(4)}</span></p>
					<p><strong>CIE 1960 coordinates:</strong> u=<span class="result-value">${u.toFixed(4)}</span>, v=<span class="result-value">${v.toFixed(4)}</span></p>
					<p><strong>CIE 1976 coordinates:</strong> u'=<span class="result-value">${up.toFixed(4)}</span>, v'=<span class="result-value">${vp.toFixed(4)}</span></p>
					<p><strong>Correlated Color Temperature (CCT):</strong> <span class="result-value">${cct === -1 ? 'NG' : cct + ' K'}</span></p>
					<p><strong>Duv:</strong> <span class="result-value">${Duv === -1 ? 'NG' : Duv.toFixed(4)}</span></p>
					<p><strong>${wavelengthType === "Dominant" ? "Dominant Wavelength" : "Complementary Wavelength"}:</strong> <span class="result-value">${dominantWavelength.toFixed(1)} nm</span></p>
					<p><strong>Color Purity:</strong> <span class="result-value">${purity.toFixed(1)}%</span></p>
					<p><strong>COI:</strong> <span class="result-value">${coi.toFixed(2)}</span></p>
					<p><strong>LER:</strong> <span class="result-value">${LER.toFixed(1)} lm/W</span></p>
					<p><strong>WPE:</strong> <span class="result-value">${wpe.toFixed(1)}%</span></p>
					<p><strong>Luminous Efficacy:</strong> <span class="result-value">${efficacy.toFixed(1)} lm/W</span></p>
					<h3>Color Rendering Index (CRI)</h3>
					<p><strong>Ra:</strong> <span class="result-value">${ra.toFixed(1)}</span></p>
					<p><strong>Re:</strong> <span class="result-value">${re.toFixed(1)}</span></p>
					<p><strong>R9:</strong> <span class="result-value">${specialRi[8].toFixed(1)}</span></p>
					<h3>Studio Lighting Parameters</h3>
					<p><strong>SSI:</strong> <span class="result-value">${SSI.toFixed(1)}</span></p>
				</div>
			`;

			// Display TM-30 parameters, MPR and MDER
			resultsDiv.innerHTML += `
				<div class="result-card1">
					<h3>TM-30 Parameters</h3>
					<p><strong>Color Fidelity Index (Rf):</strong> <span class="result-value">${rf.toFixed(1)}</span></p>
					<p><strong>Color Gamut Index (Rg):</strong> <span class="result-value">${rg.toFixed(1)}</span></p>
					<p><strong>Local Saturation Shift (Rcs,h1):</strong> <span class="result-value">${(rcshj[0] * 100).toFixed(1)}%</span></p>
					<h3>Lighting Quality Parameters</h3>
					<p><strong>MCPI:</strong> <span class="result-value">${isFinite(lq.MCPI) ? lq.MCPI.toFixed(1) : 'NG'}</span></p>
					<p><strong>MCPIr (Preference):</strong> <span class="result-value">${isFinite(lq.MCPIr) ? lq.MCPIr.toFixed(1) : 'NG'} (${lq.prefGrade})</span></p>
					<p><strong>CDM:</strong> <span class="result-value">${isFinite(lq.CDM) ? lq.CDM.toFixed(3) : 'NG'}</span></p>
					<p><strong>CDMr (Discrimination):</strong> <span class="result-value">${isFinite(lq.CDMr) ? lq.CDMr.toFixed(1) : 'NG'} (${lq.discGrade})</span></p>
					<h3>Human Centric Lighting Parameters</h3>
					<p><strong>Melanopic / Photopic Ratio (MPR):</strong> <span class="result-value">${MPR.toFixed(3)}</span></p>
					<p><strong>Melanopic Daylight Efficacy Ratio (MDER):</strong> <span class="result-value">${MDER.toFixed(3)}</span></p>
					<p><strong>GFC:</strong> <span class="result-value">${GFC.toFixed(3)}</span></p>
					<h3>Street Lighting Parameters</h3>
					<p><strong>Scotopic / Photopic Ratio (SPR):</strong> <span class="result-value">${SPR.toFixed(2)}</span></p>
					<h3>Stadium Lighting Parameters</h3>
					<p><strong>Qa:</strong> <span class="result-value">${isFinite(tlci.qa) ? tlci.qa.toFixed(1) : 'NG'}</span></p>
				</div>
			`;

			// Calculate horticultural lighting parameters and blue light hazard
			const [ppfPerWatt, bpfPerWatt, ypfPerWatt, dinPerWatt] = calculateHortiData(intensities, wpe);
			const Kpv = efficacy / ppfPerWatt;

			// Calculate photon (PPF) band ratios: R/B, R/FR and RGB percentages
			const pb = calculatePhotonBands(intensities);

			// Calculate G-Index
			const G_Index = calculateGindex(intensities);

			// Calculate Kb,v
			const Kbv = calculateKbv(intensities);

			// Calculate blue light content below 500nm / 520nm / 560nm
			const P500 = blueContentBelow(intensities, 500) * 100;
			const P520 = blueContentBelow(intensities, 520) * 100;
			const P560 = blueContentBelow(intensities, 560) * 100;

			// Display horticultural lighting parameters and blue-light hazard
			resultsDiv.innerHTML += `
				<div class="result-card1">
					<h3>Horticulture Lighting Parameters</h3>
					<p><strong>PPF/W:</strong> <span class="result-value">${ppfPerWatt.toFixed(2)} µmol/J</span></p>
					<p><strong>BPF/W:</strong> <span class="result-value">${bpfPerWatt.toFixed(2)} µmol/J</span></p>
					<p><strong>YPF/W:</strong> <span class="result-value">${ypfPerWatt.toFixed(2)} µmol/J</span></p>
					<p><strong>DIN/W:</strong> <span class="result-value">${dinPerWatt.toFixed(2)} µmol/J</span></p>
					<p><strong>Kp,v:</strong> <span class="result-value">${Kpv.toFixed(1)}</span></p>
					<p><strong>R/B:</strong> <span class="result-value">${pb.rb.toFixed(1)}</span></p>
					<p><strong>R/FR:</strong> <span class="result-value">${pb.rfr.toFixed(1)}</span></p>
					<p><strong>B:</strong> <span class="result-value">${pb.bluePct.toFixed(1)}%</span></p>
					<p><strong>G:</strong> <span class="result-value">${pb.greenPct.toFixed(1)}%</span></p>
					<p><strong>R:</strong> <span class="result-value">${pb.redPct.toFixed(1)}%</span></p>
					<h3>Blue Light Content and Hazard</h3>
					<p><strong>G-Index:</strong> <span class="result-value">${G_Index.toFixed(2)}</span></p>
					<p><strong>P500:</strong> <span class="result-value">${P500.toFixed(1)}%</span></p>
					<p><strong>P520:</strong> <span class="result-value">${P520.toFixed(1)}%</span></p>
					<p><strong>P560:</strong> <span class="result-value">${P560.toFixed(1)}%</span></p>
					<p>
						<strong>Kb,v:</strong>
						<span class="result-value">${(() => {
							const [m, e] = Kbv.toExponential(2).split('e');
							return `${m}x10<sup>${parseInt(e, 10)}</sup>`;
						})()}</span>
					</p>
				</div>
			`;

			// Display color rendering index results(Ri) — heading and R1-R15 table
			// share one card
			const riCard = document.createElement('div');
			riCard.className = 'result-card2';
			riCard.innerHTML = '<h3>Special Color Rendering Indices (R1-R15):</h3>';

			// Create CRI table
			const riTable = document.createElement('table');
			riTable.className = 'ri-table';
			const riHeaderRow = document.createElement('tr');
			const riHeaders = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'];
			riHeaders.forEach(headerText => {
				const th = document.createElement('th');
				th.textContent = headerText;
				th.style.width = '6.67%';
				th.style.color = '#E8E8E8';
				th.style.fontWeight = 'bold';
				riHeaderRow.appendChild(th);
			});
			riTable.appendChild(riHeaderRow);

			const riRow = document.createElement('tr');
			const colors = [
				'rgb(184, 135, 127)', 'rgb(162, 143, 95)', 'rgb(137, 156, 68)', 'rgb(90, 161, 115)',
				'rgb(102, 158, 163)', 'rgb(113, 149, 196)', 'rgb(160, 135, 189)', 'rgb(187, 133, 174)',
				'rgb(181, 35, 55)', 'rgb(231, 199, 56)', 'rgb(19, 140, 99)', 'rgb(0, 76, 143)',
				'rgb(233, 189, 158)', 'rgb(87, 101, 57)', 'rgb(245, 204, 165)'
			];

			specialRi.forEach((value, index) => {
				const td = document.createElement('td');
				td.textContent = value.toFixed(1);
				td.style.color = '#E8E8E8';
				td.style.backgroundColor = colors[index];
				td.style.fontWeight = 'bold';
				td.style.width = '6.67%';
				riRow.appendChild(td);
			});
			riTable.appendChild(riRow);

			riCard.appendChild(riTable);
			resultsDiv.appendChild(riCard);

			// ---------------- TM-30 colour vector graphic & local metrics charts ----------------
			resultsDiv.innerHTML += `
				<div class="result-card2">
					<h3>TM-30 Color Vector Graphic &amp; Local Metrics</h3>
					<div class="tm30-grid">
						<canvas id="tm30-vector" width="940" height="940"></canvas>
						<div class="tm30-side">
							<canvas id="tm30-cs" width="1332" height="292"></canvas>
							<canvas id="tm30-hs" width="1332" height="292"></canvas>
							<canvas id="tm30-rf" width="1332" height="292"></canvas>
						</div>
					</div>
					<canvas id="tm30-ces" width="2336" height="540" style="margin-top:14px;"></canvas>
				</div>
			`;
			// (the five TM-30 canvases are painted at the end of calculate(), after all
			//  innerHTML updates, because re-serializing innerHTML clears canvas content)
			// ---------------- TLCI‑2012: heading, Qa and the Q1-Q18 patch table in one card ----------------
			const tlciCard = document.createElement('div');
			tlciCard.className = 'result-card2';
			tlciCard.innerHTML = `
				<h3>Television Lighting Consistency Index (TLCI-2012)</h3>
				<p><strong>Qa:</strong> <span class="result-value">${isFinite(tlci.qa) ? tlci.qa.toFixed(1) : 'NG'}</span></p>
				<p><strong>Color Patches (Q1-Q18):</strong></p>
			`;

			// TLCI‑2012: Q1‑Q18 patch table
			const tlciTable = document.createElement('table');
			tlciTable.className = 'tlci-table';
			const tlciHeaderRow = document.createElement('tr');
			for (let i = 1; i <= 18; i++) {
				const th = document.createElement('th');
				th.textContent = 'Q' + i;
				th.style.width = '5.56%';
				th.style.color = '#E8E8E8';
				th.title = TLCI_PATCH_NAMES[i - 1];
				tlciHeaderRow.appendChild(th);
			}
			tlciTable.appendChild(tlciHeaderRow);

			const tlciRow = document.createElement('tr');
			tlci.patches.forEach((patch, index) => {
				const td = document.createElement('td');
				td.style.width = '5.56%';
				td.style.fontWeight = 'bold';
				if (patch.score === null) {
					td.textContent = '—';
					td.style.backgroundColor = 'rgb(70, 78, 88)';
					td.style.color = '#E8E8E8';
					td.title = patch.name + ': RGB negative values clipped, excluded';
				} else {
					td.textContent = patch.score.toFixed(1);
					td.style.backgroundColor = 'rgb(' + TLCI_PATCH_RGB[index].join(', ') + ')';
					td.style.color = '#E8E8E8';
					td.title = patch.name + ': dE00 = ' + patch.de.toFixed(2);
				}
				tlciRow.appendChild(td);
			});
			tlciTable.appendChild(tlciRow);

			tlciCard.appendChild(tlciTable);
			resultsDiv.appendChild(tlciCard);


			// Calculate CQS
			const [qa, qi, qf, qp, qg] = calculateCQS(intensities);

			// Display CQS results — heading and the Q1-Q15 table in one card
			const cqsCard = document.createElement('div');
			cqsCard.className = 'result-card2';
			cqsCard.innerHTML = `
				<h3>Color Quality Scale (CQS)</h3>
				<p><strong>General Color Quality Scale (Qa):</strong> <span class="result-value">${qa.toFixed(1)}</span></p>
				<p><strong>Color Fidelity Index (Qf):</strong> <span class="result-value">${qf.toFixed(1)}</span></p>
				<p><strong>Color Preference Index (Qp):</strong> <span class="result-value">${qp.toFixed(1)}</span></p>
				<p><strong>Color Gamut Area Index (Qg):</strong> <span class="result-value">${qg.toFixed(1)}</span></p>
				<p><strong>Special Color Quality Scale (Q1-Q15):</strong></p>
			`;

			// Create CQS table
			const qiTable = document.createElement('table');
			qiTable.className = 'qi-table';
			const qiHeaderRow = document.createElement('tr');
			const qiHeaders = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15'];
			qiHeaders.forEach(headerText => {
				const th = document.createElement('th');
				th.textContent = headerText;
				th.style.width = '6.67%';
				th.style.color = '#E8E8E8';
				th.style.fontWeight = 'bold';
				qiHeaderRow.appendChild(th);
			});
			qiTable.appendChild(qiHeaderRow);

			const qiRow = document.createElement('tr');
			const cqsColors = [
				'rgb(127, 73, 127)', 'rgb(95, 82, 148)', 'rgb(33, 89, 155)', 'rgb(0, 123, 166)',
				'rgb(0, 153, 167)', 'rgb(0, 155, 137)', 'rgb(0, 157, 93)', 'rgb(117, 176, 74)',
				'rgb(182, 196, 62)', 'rgb(234, 201, 39)', 'rgb(216, 152, 29)', 'rgb(235, 141, 59)',
				'rgb(221, 110, 70)', 'rgb(173, 45, 59)', 'rgb(155, 57, 92)'
			];

			qi.forEach((value, index) => {
				const td = document.createElement('td');
				td.textContent = value.toFixed(1);
				td.style.color = '#E8E8E8';
				td.style.backgroundColor = cqsColors[index];
				td.style.fontWeight = 'bold';
				td.style.width = '6.67%';
				qiRow.appendChild(td);
			});
			qiTable.appendChild(qiRow);

			cqsCard.appendChild(qiTable);
			resultsDiv.appendChild(cqsCard);

			displayCurrentSpectrum(wavelengths, intensities, referenceSpectrum, tm30ReferenceSpectrum);

			// Paint the TM-30 vector graphic and metric charts (must run after every
			// resultsDiv.innerHTML += above, which would otherwise reset the canvases)
			drawTM30VectorGraphic(document.getElementById('tm30-vector'), {
				cct: cct, duv: Duv, rf: rf, rg: rg,
				rfhj: rfhj, rcshj: rcshj,
				arrowColors: arrowColors,
				aptj: aptj, bptj: bptj, aprj: aprj, bprj: bprj,
				binColors: binColors
			});
			drawTM30LocalBarChart(document.getElementById('tm30-cs'),
				rcshj.map(v => v * 100), binColors,
				{ yMin: -40, yMax: 40, title: 'Local Chroma Shift (Rcs,h1)', tickFmt: v => Math.round(v) + '%', fmt: v => Math.round(v) + '%' });
			drawTM30LocalBarChart(document.getElementById('tm30-hs'),
				rhshj, binColors,
				{ yMin: -0.4, yMax: 0.4, title: 'Local Hue Shift (Rhs,h1)', tickFmt: v => v.toFixed(1), fmt: v => v.toFixed(2) });
			drawTM30LocalBarChart(document.getElementById('tm30-rf'),
				rfhj, binColors,
				{ yMin: 0, yMax: 100, title: 'Local Color Fidelity (Rf,hj)', tickFmt: v => String(Math.round(v)), fmt: v => String(Math.round(v)) });
			drawTM30SampleChart(document.getElementById('tm30-ces'), rfi, cesColors);

			drawSpectral();
			drawCoordinate(result.x, result.y);
		}
		
		spectralCanvasInteraction();
cieCanvasInteraction();
drawCieDiagram();
calculate();
document.querySelectorAll('.legend-item input[type="checkbox"]').forEach(checkbox => checkbox.addEventListener('change', drawSpectral));

for (const [name,fn] of Object.entries({normalizeAndSmooth,calculate,saveTableAsCsv,copyTable})) document.querySelector(`[data-action="${name}"]`).addEventListener("click",fn);
