export function run(initialMuted, saveMuted, loaded) {
document.title = "墨弓对决 · 水墨火柴人射箭";
const style = document.createElement("style"); style.textContent = "\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_00__) format('woff2');unicode-range:U+8c19;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_01__) format('woff2');unicode-range:U+5533;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_02__) format('woff2');unicode-range:U+4fa5;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_03__) format('woff2');unicode-range:U+5201;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_04__) format('woff2');unicode-range:U+5d16, U+62fd, U+7784;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_05__) format('woff2');unicode-range:U+5f13;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_06__) format('woff2');unicode-range:U+5e, U+803b;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_07__) format('woff2');unicode-range:U+b0, U+84c4, U+9e64;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_08__) format('woff2');unicode-range:U+54ac, U+67f4, U+7b4b, U+9022;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_09__) format('woff2');unicode-range:U+4e43, U+6108, U+7686, U+7bad, U+94ae, U+9601;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_10__) format('woff2');unicode-range:U+5f92, U+614e, U+7b79;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_11__) format('woff2');unicode-range:U+52b2, U+62d6, U+654c, U+8986, U+94bb;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_12__) format('woff2');unicode-range:U+4ea6, U+5077, U+58a8, U+6e10, U+756a;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_13__) format('woff2');unicode-range:U+23, U+3d, U+4fa0, U+501f, U+5175, U+5b97, U+7a0d, U+865a, U+8d25, U+9635, U+9694, U+9aa8;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_14__) format('woff2');unicode-range:U+26, U+3c, U+53f3, U+5c04, U+5e78, U+5f39, U+76d6, U+7a33, U+7ec3, U+80dc, U+811a, U+9759;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_15__) format('woff2');unicode-range:U+2026, U+4e03, U+4e5d, U+53e6, U+5c42, U+677e, U+8d1f, U+8f93, U+96ea;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_16__) format('woff2');unicode-range:U+25, U+4e1d, U+4e60, U+4f4f, U+4fbf, U+516b, U+516d, U+51b3, U+521d, U+52bf, U+5747, U+5883, U+5c3d, U+5c40, U+601d, U+62c9, U+6309, U+6b62, U+6ee1, U+6f14, U+76d8, U+79bb, U+7ec8, U+843d, U+8d8a, U+8f83, U+9002, U+968f, U+96be, U+9884;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_17__) format('woff2');unicode-range:U+2b, U+4e94, U+4fee, U+5148, U+518d, U+51c6, U+51e0, U+5341, U+5411, U+5e08, U+620f, U+6218, U+62e9, U+6362, U+6613, U+706b, U+738b, U+73a9, U+754c, U+7559, U+7740, U+795e, U+7edc, U+8bc6, U+952e, U+97f3;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_18__) format('woff2');unicode-range:U+4e, U+4e8b-4e8c, U+4efb, U+4f55, U+4f7f, U+51fb, U+53bb, U+53d6, U+56db, U+573a, U+58f0, U+5b8c, U+5df2, U+5e38, U+5f97, U+6216, U+653e, U+672f, U+6807, U+6837, U+6b64, U+6bd4, U+6c34, U+6c42, U+6d88, U+6e38, U+771f, U+7ae0, U+7b2c, U+89c1, U+8a00, U+8def, U+8f7d, U+8fd0, U+9009, U+91cd, U+91cf, U+98ce;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_19__) format('woff2');unicode-range:U+3e, U+5f, U+7c, U+4e09, U+4e0b, U+4e0d-4e0e, U+4e2a, U+4e8e, U+4eba, U+4f1a, U+4f60, U+5168, U+5173, U+51fa, U+5206, U+529b, U+52a8, U+53d1, U+53ef, U+5408, U+56de, U+597d, U+5b66, U+5ba2, U+5bb6, U+5bf9, U+5ea6, U+5f00, U+5f0f, U+5fc3, U+610f, U+624b, U+6280, U+65e0, U+65f6, U+672c, U+6765, U+6cd5, U+6d3b, U+7528, U+7ebf, U+8005, U+884c, U+8bba, U+8bf7, U+901a, U+9053, U+9762, U+9898, U+9ad8;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_20__) format('woff2');unicode-range:U+20-22, U+27-2a, U+2c-3b, U+3f, U+41-4d, U+4f-50, U+52-5b, U+5d, U+61-7b, U+7d, U+b7, U+2014, U+3001-3002, U+4e00, U+4e2d, U+6709, U+70b9, U+7684, U+7f51, U+ff0c, U+ff1a;}\n@font-face{font-family:'Ma Shan Zheng';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_21__) format('woff2');unicode-range:U+a, U+20-23, U+25-3f, U+41-50, U+52-5b, U+5d-5f, U+61-7d, U+b0, U+b7, U+2014, U+2026;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_22__) format('woff2');unicode-range:U+8c19;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_23__) format('woff2');unicode-range:U+5533;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_24__) format('woff2');unicode-range:U+4fa5;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_25__) format('woff2');unicode-range:U+5201;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_26__) format('woff2');unicode-range:U+5d16, U+62fd, U+7784;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_27__) format('woff2');unicode-range:U+5f13;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_28__) format('woff2');unicode-range:U+5e, U+803b;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_29__) format('woff2');unicode-range:U+b0, U+84c4, U+9e64;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_30__) format('woff2');unicode-range:U+54ac, U+67f4, U+7b4b, U+9022;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_31__) format('woff2');unicode-range:U+4e43, U+6108, U+7686, U+7bad, U+94ae, U+9601;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_32__) format('woff2');unicode-range:U+5f92, U+614e, U+7b79;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_33__) format('woff2');unicode-range:U+52b2, U+62d6, U+654c, U+8986, U+94bb;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_34__) format('woff2');unicode-range:U+4ea6, U+5077, U+58a8, U+6e10, U+756a;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_35__) format('woff2');unicode-range:U+23, U+3d, U+4fa0, U+501f, U+5175, U+5b97, U+7a0d, U+865a, U+8d25, U+9635, U+9694, U+9aa8;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_36__) format('woff2');unicode-range:U+26, U+3c, U+53f3, U+5c04, U+5e78, U+5f39, U+76d6, U+7a33, U+7ec3, U+80dc, U+811a, U+9759;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_37__) format('woff2');unicode-range:U+2026, U+4e03, U+4e5d, U+53e6, U+5c42, U+677e, U+8d1f, U+8f93, U+96ea;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_38__) format('woff2');unicode-range:U+25, U+4e1d, U+4e60, U+4f4f, U+4fbf, U+516b, U+516d, U+51b3, U+521d, U+52bf, U+5747, U+5883, U+5c3d, U+5c40, U+601d, U+62c9, U+6309, U+6b62, U+6ee1, U+6f14, U+76d8, U+79bb, U+7ec8, U+843d, U+8d8a, U+8f83, U+9002, U+968f, U+96be, U+9884;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_39__) format('woff2');unicode-range:U+2b, U+4e94, U+4fee, U+5148, U+518d, U+51c6, U+51e0, U+5341, U+5411, U+5e08, U+620f, U+6218, U+62e9, U+6362, U+6613, U+706b, U+738b, U+73a9, U+754c, U+7559, U+7740, U+795e, U+7edc, U+8bc6, U+952e, U+97f3;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_40__) format('woff2');unicode-range:U+4e, U+4e8b-4e8c, U+4efb, U+4f55, U+4f7f, U+51fb, U+53bb, U+53d6, U+56db, U+573a, U+58f0, U+5b8c, U+5df2, U+5e38, U+5f97, U+6216, U+653e, U+672f, U+6807, U+6837, U+6b64, U+6bd4, U+6c34, U+6c42, U+6d88, U+6e38, U+771f, U+7ae0, U+7b2c, U+89c1, U+8a00, U+8def, U+8f7d, U+8fd0, U+9009, U+91cd, U+91cf, U+98ce;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_41__) format('woff2');unicode-range:U+3e, U+5f, U+7c, U+4e09, U+4e0b, U+4e0d-4e0e, U+4e2a, U+4e8e, U+4eba, U+4f1a, U+4f60, U+5168, U+5173, U+51fa, U+5206, U+529b, U+52a8, U+53d1, U+53ef, U+5408, U+56de, U+597d, U+5b66, U+5ba2, U+5bb6, U+5bf9, U+5ea6, U+5f00, U+5f0f, U+5fc3, U+610f, U+624b, U+6280, U+65e0, U+65f6, U+672c, U+6765, U+6cd5, U+6d3b, U+7528, U+7ebf, U+8005, U+884c, U+8bba, U+8bf7, U+901a, U+9053, U+9762, U+9898, U+9ad8;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_42__) format('woff2');unicode-range:U+20-22, U+27-2a, U+2c-3b, U+3f, U+41-4d, U+4f-50, U+52-5b, U+5d, U+61-7b, U+7d, U+b7, U+2014, U+3001-3002, U+4e00, U+4e2d, U+6709, U+70b9, U+7684, U+7f51, U+ff0c, U+ff1a;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_43__) format('woff2');unicode-range:U+a, U+20-23, U+25-3f, U+41-50, U+52-5b, U+5d-5f, U+61-7d, U+b0, U+b7, U+2014, U+2026;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_44__) format('woff2');unicode-range:U+8c19;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_45__) format('woff2');unicode-range:U+5533;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_46__) format('woff2');unicode-range:U+4fa5;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_47__) format('woff2');unicode-range:U+5201;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_48__) format('woff2');unicode-range:U+5d16, U+62fd, U+7784;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_49__) format('woff2');unicode-range:U+5f13;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_50__) format('woff2');unicode-range:U+5e, U+803b;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_51__) format('woff2');unicode-range:U+b0, U+84c4, U+9e64;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_52__) format('woff2');unicode-range:U+54ac, U+67f4, U+7b4b, U+9022;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_53__) format('woff2');unicode-range:U+4e43, U+6108, U+7686, U+7bad, U+94ae, U+9601;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_54__) format('woff2');unicode-range:U+5f92, U+614e, U+7b79;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_55__) format('woff2');unicode-range:U+52b2, U+62d6, U+654c, U+8986, U+94bb;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_56__) format('woff2');unicode-range:U+4ea6, U+5077, U+58a8, U+6e10, U+756a;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_57__) format('woff2');unicode-range:U+23, U+3d, U+4fa0, U+501f, U+5175, U+5b97, U+7a0d, U+865a, U+8d25, U+9635, U+9694, U+9aa8;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_58__) format('woff2');unicode-range:U+26, U+3c, U+53f3, U+5c04, U+5e78, U+5f39, U+76d6, U+7a33, U+7ec3, U+80dc, U+811a, U+9759;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_59__) format('woff2');unicode-range:U+2026, U+4e03, U+4e5d, U+53e6, U+5c42, U+677e, U+8d1f, U+8f93, U+96ea;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_60__) format('woff2');unicode-range:U+25, U+4e1d, U+4e60, U+4f4f, U+4fbf, U+516b, U+516d, U+51b3, U+521d, U+52bf, U+5747, U+5883, U+5c3d, U+5c40, U+601d, U+62c9, U+6309, U+6b62, U+6ee1, U+6f14, U+76d8, U+79bb, U+7ec8, U+843d, U+8d8a, U+8f83, U+9002, U+968f, U+96be, U+9884;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_61__) format('woff2');unicode-range:U+2b, U+4e94, U+4fee, U+5148, U+518d, U+51c6, U+51e0, U+5341, U+5411, U+5e08, U+620f, U+6218, U+62e9, U+6362, U+6613, U+706b, U+738b, U+73a9, U+754c, U+7559, U+7740, U+795e, U+7edc, U+8bc6, U+952e, U+97f3;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_62__) format('woff2');unicode-range:U+4e, U+4e8b-4e8c, U+4efb, U+4f55, U+4f7f, U+51fb, U+53bb, U+53d6, U+56db, U+573a, U+58f0, U+5b8c, U+5df2, U+5e38, U+5f97, U+6216, U+653e, U+672f, U+6807, U+6837, U+6b64, U+6bd4, U+6c34, U+6c42, U+6d88, U+6e38, U+771f, U+7ae0, U+7b2c, U+89c1, U+8a00, U+8def, U+8f7d, U+8fd0, U+9009, U+91cd, U+91cf, U+98ce;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_63__) format('woff2');unicode-range:U+3e, U+5f, U+7c, U+4e09, U+4e0b, U+4e0d-4e0e, U+4e2a, U+4e8e, U+4eba, U+4f1a, U+4f60, U+5168, U+5173, U+51fa, U+5206, U+529b, U+52a8, U+53d1, U+53ef, U+5408, U+56de, U+597d, U+5b66, U+5ba2, U+5bb6, U+5bf9, U+5ea6, U+5f00, U+5f0f, U+5fc3, U+610f, U+624b, U+6280, U+65e0, U+65f6, U+672c, U+6765, U+6cd5, U+6d3b, U+7528, U+7ebf, U+8005, U+884c, U+8bba, U+8bf7, U+901a, U+9053, U+9762, U+9898, U+9ad8;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_64__) format('woff2');unicode-range:U+20-22, U+27-2a, U+2c-3b, U+3f, U+41-4d, U+4f-50, U+52-5b, U+5d, U+61-7b, U+7d, U+b7, U+2014, U+3001-3002, U+4e00, U+4e2d, U+6709, U+70b9, U+7684, U+7f51, U+ff0c, U+ff1a;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_65__) format('woff2');unicode-range:U+a, U+20-23, U+25-3f, U+41-50, U+52-5b, U+5d-5f, U+61-7d, U+b0, U+b7, U+2014, U+2026;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_66__) format('woff2');unicode-range:U+8c19;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_67__) format('woff2');unicode-range:U+5533;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_68__) format('woff2');unicode-range:U+4fa5;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_69__) format('woff2');unicode-range:U+5201;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_70__) format('woff2');unicode-range:U+5d16, U+62fd, U+7784;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_71__) format('woff2');unicode-range:U+5f13;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_72__) format('woff2');unicode-range:U+5e, U+803b;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_73__) format('woff2');unicode-range:U+b0, U+84c4, U+9e64;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_74__) format('woff2');unicode-range:U+54ac, U+67f4, U+7b4b, U+9022;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_75__) format('woff2');unicode-range:U+4e43, U+6108, U+7686, U+7bad, U+94ae, U+9601;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_76__) format('woff2');unicode-range:U+5f92, U+614e, U+7b79;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_77__) format('woff2');unicode-range:U+52b2, U+62d6, U+654c, U+8986, U+94bb;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_78__) format('woff2');unicode-range:U+4ea6, U+5077, U+58a8, U+6e10, U+756a;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_79__) format('woff2');unicode-range:U+23, U+3d, U+4fa0, U+501f, U+5175, U+5b97, U+7a0d, U+865a, U+8d25, U+9635, U+9694, U+9aa8;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_80__) format('woff2');unicode-range:U+26, U+3c, U+53f3, U+5c04, U+5e78, U+5f39, U+76d6, U+7a33, U+7ec3, U+80dc, U+811a, U+9759;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_81__) format('woff2');unicode-range:U+2026, U+4e03, U+4e5d, U+53e6, U+5c42, U+677e, U+8d1f, U+8f93, U+96ea;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_82__) format('woff2');unicode-range:U+25, U+4e1d, U+4e60, U+4f4f, U+4fbf, U+516b, U+516d, U+51b3, U+521d, U+52bf, U+5747, U+5883, U+5c3d, U+5c40, U+601d, U+62c9, U+6309, U+6b62, U+6ee1, U+6f14, U+76d8, U+79bb, U+7ec8, U+843d, U+8d8a, U+8f83, U+9002, U+968f, U+96be, U+9884;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_83__) format('woff2');unicode-range:U+2b, U+4e94, U+4fee, U+5148, U+518d, U+51c6, U+51e0, U+5341, U+5411, U+5e08, U+620f, U+6218, U+62e9, U+6362, U+6613, U+706b, U+738b, U+73a9, U+754c, U+7559, U+7740, U+795e, U+7edc, U+8bc6, U+952e, U+97f3;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_84__) format('woff2');unicode-range:U+4e, U+4e8b-4e8c, U+4efb, U+4f55, U+4f7f, U+51fb, U+53bb, U+53d6, U+56db, U+573a, U+58f0, U+5b8c, U+5df2, U+5e38, U+5f97, U+6216, U+653e, U+672f, U+6807, U+6837, U+6b64, U+6bd4, U+6c34, U+6c42, U+6d88, U+6e38, U+771f, U+7ae0, U+7b2c, U+89c1, U+8a00, U+8def, U+8f7d, U+8fd0, U+9009, U+91cd, U+91cf, U+98ce;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_85__) format('woff2');unicode-range:U+3e, U+5f, U+7c, U+4e09, U+4e0b, U+4e0d-4e0e, U+4e2a, U+4e8e, U+4eba, U+4f1a, U+4f60, U+5168, U+5173, U+51fa, U+5206, U+529b, U+52a8, U+53d1, U+53ef, U+5408, U+56de, U+597d, U+5b66, U+5ba2, U+5bb6, U+5bf9, U+5ea6, U+5f00, U+5f0f, U+5fc3, U+610f, U+624b, U+6280, U+65e0, U+65f6, U+672c, U+6765, U+6cd5, U+6d3b, U+7528, U+7ebf, U+8005, U+884c, U+8bba, U+8bf7, U+901a, U+9053, U+9762, U+9898, U+9ad8;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_86__) format('woff2');unicode-range:U+20-22, U+27-2a, U+2c-3b, U+3f, U+41-4d, U+4f-50, U+52-5b, U+5d, U+61-7b, U+7d, U+b7, U+2014, U+3001-3002, U+4e00, U+4e2d, U+6709, U+70b9, U+7684, U+7f51, U+ff0c, U+ff1a;}\n@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:400;font-display:swap;src:url(__FONT_87__) format('woff2');unicode-range:U+a, U+20-23, U+25-3f, U+41-50, U+52-5b, U+5d-5f, U+61-7d, U+b0, U+b7, U+2014, U+2026;}\n/* ============ 墨弓对决 · 全局样式 ============ */\n* { margin: 0; padding: 0; box-sizing: border-box; }\n\nhtml, body {\n  width: 100%; height: 100%;\n  background: #2b2118;\n  overflow: hidden;\n  font-family: 'Noto Serif SC', serif;\n  -webkit-user-select: none; user-select: none;\n  touch-action: none;\n}\n\n#stage {\n  position: fixed; inset: 0;\n  display: flex; align-items: center; justify-content: center;\n  background: radial-gradient(ellipse at 50% 40%, #3a2e22 0%, #221a12 100%);\n}\n\n#game {\n  display: block;\n  background: #e9e1cf;\n  box-shadow: 0 0 60px rgba(0,0,0,.55);\n  cursor: crosshair;\n  touch-action: none;\n}\n\n/* ============ 覆盖层通用 ============ */\n.overlay {\n  position: absolute; inset: 0;\n  display: flex; align-items: center; justify-content: center;\n  background:\n    radial-gradient(ellipse at 50% 30%, rgba(233,225,207,.92) 0%, rgba(217,205,178,.94) 60%, rgba(196,182,150,.96) 100%);\n  z-index: 10;\n  transition: opacity .45s ease;\n}\n.overlay.hidden { opacity: 0; pointer-events: none; }\n\n.title-inner { text-align: center; max-width: 900px; padding: 20px; }\n\n.title-row {\n  display: flex; align-items: center; justify-content: center; gap: 26px;\n}\n\n.game-title {\n  font-family: 'Ma Shan Zheng', 'Noto Serif SC', serif;\n  font-size: clamp(64px, 11vw, 118px);\n  font-weight: 400;\n  color: #2b2118;\n  letter-spacing: .08em;\n  line-height: 1;\n  text-shadow: 2px 3px 0 rgba(43,33,24,.14);\n}\n\n.seal-stamp {\n  width: clamp(64px, 8vw, 92px); height: clamp(64px, 8vw, 92px);\n  background: #a32c22;\n  color: #f4eedd;\n  font-family: 'Ma Shan Zheng', serif;\n  font-size: clamp(40px, 5vw, 60px);\n  display: flex; align-items: center; justify-content: center;\n  border-radius: 10px;\n  transform: rotate(6deg);\n  box-shadow: 0 4px 14px rgba(163,44,34,.4), inset 0 0 0 3px rgba(244,238,221,.55), inset 0 0 0 6px #a32c22;\n  padding-bottom: 4px;\n}\n\n.subtitle {\n  margin-top: 10px;\n  font-size: clamp(15px, 2vw, 20px);\n  letter-spacing: .35em;\n  color: #6b5b43;\n}\n\n/* ============ 难度选择 ============ */\n.diff-list {\n  margin: 34px auto 0;\n  display: flex; gap: 22px; justify-content: center; flex-wrap: wrap;\n}\n\n.diff-card {\n  width: 236px;\n  padding: 22px 18px 20px;\n  background: linear-gradient(160deg, #f8f0dc 0%, #efe4c8 100%);\n  border: 2px solid #2b2118;\n  border-radius: 6px;\n  cursor: pointer;\n  font-family: 'Noto Serif SC', serif;\n  text-align: center;\n  position: relative;\n  box-shadow: 4px 5px 0 rgba(43,33,24,.28);\n  transition: transform .16s ease, box-shadow .16s ease;\n}\n.diff-card:hover {\n  transform: translateY(-5px) rotate(-.4deg);\n  box-shadow: 6px 9px 0 rgba(43,33,24,.32);\n}\n.diff-card:active { transform: translateY(-1px); }\n\n.diff-name {\n  display: block;\n  font-family: 'Ma Shan Zheng', serif;\n  font-size: 30px;\n  color: #2b2118;\n  letter-spacing: .12em;\n}\n.diff-tag {\n  position: absolute; top: 10px; right: 10px;\n  width: 30px; height: 30px;\n  background: #a32c22; color: #f4eedd;\n  font-size: 17px; line-height: 30px;\n  border-radius: 4px;\n  transform: rotate(8deg);\n}\n.diff-desc {\n  display: block;\n  margin-top: 12px;\n  font-size: 13.5px;\n  line-height: 1.75;\n  color: #6b5b43;\n}\n\n.rules-line {\n  margin-top: 30px;\n  font-size: 14.5px;\n  letter-spacing: .14em;\n  color: #85745a;\n}\n.offline-line {\n  margin-top: 8px;\n  font-size: 12px;\n  letter-spacing: .2em;\n  color: #b3a181;\n}\n\n/* ============ 终局界面 ============ */\n.match-result {\n  font-family: 'Ma Shan Zheng', serif;\n  font-size: clamp(56px, 9vw, 96px);\n  color: #2b2118;\n  letter-spacing: .1em;\n}\n.match-result .win { color: #a32c22; }\n.match-score {\n  margin-top: 6px;\n  font-size: clamp(30px, 4.5vw, 44px);\n  letter-spacing: .3em;\n  color: #85745a;\n}\n.match-comment {\n  margin-top: 14px;\n  font-size: 16px;\n  color: #6b5b43;\n  letter-spacing: .08em;\n}\n.match-buttons { margin-top: 40px; display: flex; gap: 24px; justify-content: center; }\n\n.big-btn {\n  font-family: 'Ma Shan Zheng', serif;\n  font-size: 26px;\n  letter-spacing: .15em;\n  padding: 12px 40px 14px;\n  color: #f4eedd;\n  background: #a32c22;\n  border: none; border-radius: 6px;\n  cursor: pointer;\n  box-shadow: 4px 5px 0 rgba(43,33,24,.3);\n  transition: transform .15s ease, box-shadow .15s ease;\n}\n.big-btn:hover { transform: translateY(-3px); box-shadow: 5px 8px 0 rgba(43,33,24,.34); }\n.big-btn.ghost {\n  background: transparent; color: #2b2118;\n  border: 2px solid #2b2118; box-shadow: 4px 5px 0 rgba(43,33,24,.18);\n}\n\n/* ============ 静音按钮 ============ */\n#mute-btn {\n  position: absolute; bottom: 14px; right: 16px; z-index: 20;\n  width: 40px; height: 40px;\n  background: rgba(43,33,24,.82);\n  color: #e9e1cf;\n  border: 1px solid rgba(233,225,207,.4);\n  border-radius: 50%;\n  font-family: 'Ma Shan Zheng', serif;\n  font-size: 19px;\n  cursor: pointer;\n  display: none;\n}\n#mute-btn:hover { background: rgba(163,44,34,.9); }\n\n"; for(let i=0;i<88;i++) style.textContent=style.textContent.replace(`__FONT_${String(i).padStart(2,'0')}__`,loaded[i]); document.head.append(style);
document.body.innerHTML = "\n    <div id=\"stage\">\n      <canvas id=\"game\" width=\"1280\" height=\"720\"></canvas>\n\n      <!-- 标题界面 -->\n      <div id=\"title-screen\" class=\"overlay\">\n        <div class=\"title-inner\">\n          <div class=\"title-row\">\n            <h1 class=\"game-title\">墨弓对决</h1>\n            <div class=\"seal-stamp\">射</div>\n          </div>\n          <p class=\"subtitle\">水墨火柴人 · 射箭论道 · 先胜三局者王</p>\n          <div class=\"diff-list\">\n            <button class=\"diff-card\" data-diff=\"easy\">\n              <span class=\"diff-name\">见习学徒</span>\n              <span class=\"diff-tag\">易</span>\n              <span class=\"diff-desc\">箭出渐有章法，初谙风势，适合活动筋骨</span>\n            </button>\n            <button class=\"diff-card\" data-diff=\"normal\">\n              <span class=\"diff-name\">弓术高手</span>\n              <span class=\"diff-tag\">中</span>\n              <span class=\"diff-desc\">箭箭咬风，落点刁钻，稍有不慎便落于下风</span>\n            </button>\n            <button class=\"diff-card\" data-diff=\"hard\">\n              <span class=\"diff-name\">神射宗师</span>\n              <span class=\"diff-tag\">难</span>\n              <span class=\"diff-desc\">箭无虚发，愈战愈识你弹道，一着不慎满盘皆输</span>\n            </button>\n          </div>\n          <p class=\"rules-line\">按住拖拽拉弓瞄准 · 松手放箭 · 拉得越满箭势越劲 · 留意风向与弹道预演</p>\n          <p class=\"offline-line\">水墨对决 · 三档对手</p>\n        </div>\n      </div>\n\n      <!-- 终局界面 -->\n      <div id=\"match-screen\" class=\"overlay hidden\">\n        <div class=\"title-inner\">\n          <h1 class=\"match-result\" id=\"match-result-text\">胜负已分</h1>\n          <p class=\"match-score\" id=\"match-score-text\">3 : 1</p>\n          <p class=\"match-comment\" id=\"match-comment\"></p>\n          <div class=\"match-buttons\">\n            <button id=\"btn-rematch\" class=\"big-btn\">再战此境</button>\n            <button id=\"btn-back\" class=\"big-btn ghost\">另择对手</button>\n          </div>\n        </div>\n      </div>\n\n      <button id=\"mute-btn\" title=\"声音开关\">音</button>\n    </div>\n\n    ";

(function(){
"use strict";

/* =====================================================================
 *  墨弓对决 · 水墨火柴人射箭
 *  原生 Canvas 游戏。
 *  水墨山水背景与书法字体。
 * ===================================================================== */
'use strict';

/* ---------------- 基础常量 ---------------- */
const W = 1280, H = 720;            // 逻辑分辨率
const GROUND_Y = 688;               // 地面高度
const GRAV = 980;                   // 重力加速度 px/s^2
const WIND_UNIT = 46;               // 每 1 级风的水平加速度
const ARROW_SPEED_MIN = 420, ARROW_SPEED_MAX = 1500;
const MAX_PULL = 250;               // 拉弓最大拖拽距离（逻辑像素）
const WIN_ROUNDS = 3;               // 先胜三局

const INK = '#2b2118';              // 浓墨
const INK_SOFT = 'rgba(43,33,24,.62)';
const PAPER = '#e9e1cf';
const CINNABAR = '#a32c22';         // 朱砂
const FADE_PAPER = '#f4eedd';

/* ---------------- 画布初始化（DPR 自适应 + 等比缩放） ---------------- */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const RS = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = W * RS; canvas.height = H * RS;

function fitStage() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}
window.addEventListener('resize', fitStage); fitStage();

/* ---------------- 工具函数 ---------------- */
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/** Box-Muller 高斯随机 */
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = clamp(t, 0, 1);
  const cx = ax + dx * t, cy = ay + dy * t;
  return Math.hypot(px - cx, py - cy);
}

/* ---------------- 素材加载 ---------------- */
const imgBackdrop = new Image();
imgBackdrop.src = '' + loaded[88] + '';
let assetsReady = false;
imgBackdrop.onload = () => { assetsReady = true; };

/* ---------------- 音频（WebAudio 合成，无任何外部文件） ---------------- */
let actx = null, masterGain = null;
let muted = initialMuted;

function ensureAudio() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = actx.createGain();
      masterGain.gain.value = muted ? 0 : 0.5;
      masterGain.connect(actx.destination);
    } catch (e) { /* 无音频环境时静默降级 */ }
  }
  if (actx && actx.state === 'suspended') actx.resume();
}
function setMuted(m) {
  muted = m;

  const btn = document.getElementById('mute-btn');
  btn.textContent = m ? '静' : '音';
  if (masterGain) masterGain.gain.value = m ? 0 : 0.5;
}
function tone(freq, dur, vol, type, slide) {
  if (!actx || muted) return;
  const t0 = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'triangle';
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(masterGain);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noiseBurst(dur, vol, hp) {
  if (!actx || muted) return;
  const t0 = actx.currentTime;
  const n = Math.floor(actx.sampleRate * dur);
  const buf = actx.createBuffer(1, n, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = actx.createBufferSource(); src.buffer = buf;
  const f = actx.createBiquadFilter();
  f.type = hp ? 'highpass' : 'lowpass';
  f.frequency.value = hp || 900;
  const g = actx.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(masterGain);
  src.start(t0);
}
const sndShoot   = () => { tone(210, 0.1, 0.5, 'triangle', 130); noiseBurst(0.06, 0.25, 1800); };
const sndHitBody = () => { tone(95, 0.16, 0.7, 'sine', 55); noiseBurst(0.08, 0.3, 500); };
const sndHitHead = () => { tone(150, 0.14, 0.65, 'square', 80); noiseBurst(0.05, 0.35, 1400); };
const sndThud    = () => { tone(65, 0.12, 0.35, 'sine', 40); };
const sndClick   = () => { tone(880, 0.05, 0.18, 'triangle', 700); };
const sndWin     = () => { tone(523, 0.16, 0.4); setTimeout(() => tone(659, 0.3, 0.4), 140); };
const sndLose    = () => { tone(196, 0.25, 0.4, 'sine', 150); setTimeout(() => tone(147, 0.4, 0.35, 'sine', 110), 160); };

/* ---------------- 难度配置 ---------------- */
const DIFFS = {
  easy:   { key: 'easy',   label: '见习学徒', hp: 100, sa: 4.2, ss: 0.075, igW: 0.22, adapt: 0.93, think: [1.1, 1.8], comment: '胜负乃兵家常事，再练几回合便可见真章。' },
  normal: { key: 'normal', label: '弓术高手', hp: 112, sa: 2.0, ss: 0.038, igW: 0.05, adapt: 0.87, think: [0.85, 1.35], comment: '好一场势均力敌的较量，箭逢对手。' },
  hard:   { key: 'hard',   label: '神射宗师', hp: 125, sa: 0.55, ss: 0.010, igW: 0.0,  adapt: 0.80, think: [0.65, 1.0], comment: '宗师箭下一丝侥幸亦无——换个思路，借风使箭，或可偷得一线。' },
};

/* ---------------- 世界与实体状态 ---------------- */
const game = {
  state: 'title',      // title | banner | playerAim | fly | aiAim | resolve | stamp | match
  stateT: 0,
  diff: DIFFS.normal,
  round: 0,            // 从 1 计
  scoreP: 0, scoreA: 0,
  wind: 0,             // -3 ~ +3，正值向右吹
  timeScale: 1, slowT: 0,
  shakeT: 0, shakeMag: 0,
  turn: 'player',      // player | ai（本回合谁射）
  aiPlan: null, aiAimT: 0,
  resolveTimer: 0, resolveNext: null,
  stampText: '', stampIsWin: false,
  bannerText: '', bannerSub: '',
  started: false,
};

const player = makeFighter('player');
const ai = makeFighter('ai');
const arrows = [];        // 飞行中的箭
const stuckArrows = [];   // 插在地/人身上的箭
const particles = [];     // 墨滴粒子
const floats = [];        // 飘字
let platformL = null, platformR = null;
let mist = [];

function makeFighter(kind) {
  return {
    kind, x: 0, yFeet: 0, facing: kind === 'player' ? 1 : -1,
    hp: 100, hpMax: 100, hpFlash: 0,
    aimAngle: null, pull: 0,
    pose: 'idle', poseT: 0,          // idle | aim | release | hit | dead
    hitT: 0, breathe: Math.random() * TAU,
    deadFall: 0,                     // 倒地动画 0→1
  };
}

/** 开新局：随机布置两侧高台与风 */
function setupRound() {
  game.round++;
  const rng = mulberry32(Date.now() & 0xffff ^ (game.round * 7919));

  const hL = rand(150, 265);   // 高台顶距地面的高度
  const hR = rand(150, 265);
  platformL = makePlatform(215, GROUND_Y - hL, 250, rng, 'L');
  platformR = makePlatform(1065, GROUND_Y - hR, 250, rng, 'R');

  player.x = 215; player.yFeet = platformL.top;
  ai.x = 1065;    ai.yFeet = platformR.top;
  player.facing = 1; ai.facing = -1;

  player.hpMax = 100; player.hp = 100;
  ai.hpMax = game.diff.hp; ai.hp = game.diff.hp;
  for (const f of [player, ai]) {
    f.pose = 'idle'; f.hitT = 0; f.deadFall = 0; f.pull = 0; f.aimAngle = null; f.hpFlash = 0;
  }

  arrows.length = 0; stuckArrows.length = 0; particles.length = 0; floats.length = 0;
  rollWind(true);

  // 轮流先手：第 1、3、5…局玩家先，2、4、6…局 AI 先
  game.turn = (game.round % 2 === 1) ? 'player' : 'ai';
  game.bannerText = '第 ' + cnNum(game.round) + ' 局';
  game.bannerSub = (game.turn === 'player') ? '侠客先发' : game.diff.label + ' 先发 · 稳住阵脚';
  setAlivePoses();
  game.state = 'banner'; game.stateT = 0;
}

function makePlatform(cx, top, w, rng, tag) {
  // 用种子随机生成岩台边缘的抖点，画出水墨山石的轮廓
  const pts = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    pts.push({
      x: cx - w / 2 + (w * i) / n,
      jy: (rng() - 0.5) * 14,
      jx: (rng() - 0.5) * 10,
    });
  }
  const sideJitter = [];
  for (let i = 0; i < 4; i++) sideJitter.push((rng() - 0.5) * 26);
  return { cx, top, w, pts, sideJitter, tag,
    grass: [ {x: cx - w*0.32, s: 0.7 + rng()*0.6}, {x: cx + w*0.18, s: 0.5 + rng()*0.7} ] };
}

function rollWind(hard) {
  const drift = hard ? rand(-3, 3) : game.wind + rand(-1.2, 1.2);
  game.wind = clamp(Math.round(drift * 2) / 2, -3, 3);
}

function cnNum(n) {
  const c = '一二三四五六七八九十';
  if (n <= 10) return c[n - 1];
  return n;
}

function setAlivePoses() {
  if (player.hp > 0) player.pose = 'idle';
  if (ai.hp > 0) ai.pose = 'idle';
}

/* =====================================================================
 *  第二部分：物理 · 箭矢 · AI 弹道解算 · 回合流转
 * ===================================================================== */

/* ---------------- 火柴人骨架关键点 ---------------- */
function skeleton(f) {
  // 返回火柴人各关键点（逻辑坐标）。yFeet 为脚底。
  const s = 1;
  const breathe = (f.pose === 'idle') ? Math.sin(f.breathe) * 1.6 : 0;
  const hipY = f.yFeet - 42 * s + breathe * 0.3;
  const neckY = f.yFeet - 76 * s + breathe;
  const headR = 11.5;
  const headX = f.x + f.facing * 2, headY = neckY - headR - 3;
  return {
    headX, headY, headR,
    neck: { x: f.x, y: neckY },
    hip: { x: f.x + f.facing * 1, y: hipY },
    // 站姿双脚
    footF: { x: f.x + f.facing * 12, y: f.yFeet },
    footB: { x: f.x - f.facing * 11, y: f.yFeet },
    shoulder: { x: f.x + f.facing * 2, y: neckY + 5 },
  };
}

/** 弓的握点与箭尾位置 */
function bowPoints(f) {
  const sk = skeleton(f);
  const a = f.aimAngle == null ? 0 : f.aimAngle;
  const dx = Math.cos(a), dy = Math.sin(a);
  const grip = { x: sk.shoulder.x + dx * 27, y: sk.shoulder.y + dy * 27 };
  const nock = { x: grip.x - dx * (8 + f.pull * 24), y: grip.y - dy * (8 + f.pull * 24) };
  return { sk, grip, nock, a, dx, dy };
}

/* ---------------- 伤害判定 ---------------- */
function hitFighterTest(tipX, tipY, f) {
  if (f.hp <= 0) return null;
  const sk = skeleton(f);
  // 头颈
  if (Math.hypot(tipX - sk.headX, tipY - sk.headY) < sk.headR + 2.5) return { mult: 2.3, part: 'head' };
  if (segDist(tipX, tipY, sk.neck.x, sk.neck.y, sk.headX, sk.headY) < 5) return { mult: 2.0, part: 'head' };
  // 躯干
  if (segDist(tipX, tipY, sk.neck.x, sk.neck.y, sk.hip.x, sk.hip.y) < 7) return { mult: 1.0, part: 'body' };
  // 双腿
  if (segDist(tipX, tipY, sk.hip.x, sk.hip.y, sk.footF.x, sk.footF.y) < 5.5) return { mult: 0.6, part: 'limb' };
  if (segDist(tipX, tipY, sk.hip.x, sk.hip.y, sk.footB.x, sk.footB.y) < 5.5) return { mult: 0.6, part: 'limb' };
  // 手臂（瞄准时手臂沿瞄准线伸出去，单独判定）
  const armSeg = getArmSeg(f, sk);
  if (armSeg) {
    if (segDist(tipX, tipY, armSeg.a.x, armSeg.a.y, armSeg.b.x, armSeg.b.y) < 5) return { mult: 0.6, part: 'limb' };
  }
  return null;
}
function getArmSeg(f, sk) {
  if (f.pose === 'aim' || f.pose === 'release') {
    const bp = bowPoints(f);
    return { a: sk.shoulder, b: bp.grip };
  }
  // 垂手
  return { a: sk.shoulder, b: { x: sk.shoulder.x + f.facing * 4, y: sk.shoulder.y + 26 } };
}

/* ---------------- 发射一支箭 ---------------- */
function fireArrow(f, speed, angle) {
  const bp = bowPoints(f);
  const nx = bp.nock.x + bp.dx * 30, ny = bp.nock.y + bp.dy * 30;
  arrows.push({
    x: nx, y: ny,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle, shooter: f.kind, trail: [],
  });
  f.pose = 'release'; f.poseT = 0;
  sndShoot();
  game.state = 'fly'; game.stateT = 0;
}

/* ---------------- 箭的物理更新（含子步防穿透） ---------------- */
function updateArrows(dt) {
  const windAcc = game.wind * WIND_UNIT;
  for (let i = arrows.length - 1; i >= 0; i--) {
    const ar = arrows[i];
    const SUB = 3, sdt = dt / SUB;
    let done = false;
    for (let s = 0; s < SUB && !done; s++) {
      const px = ar.x, py = ar.y;
      ar.vy += GRAV * sdt;
      ar.vx += windAcc * sdt;
      ar.x += ar.vx * sdt;
      ar.y += ar.vy * sdt;
      ar.angle = Math.atan2(ar.vy, ar.vx);
      // 箭尖位置（箭长 34，尾部在 ar.x/y，箭头在前方）
      const tipX = ar.x + Math.cos(ar.angle) * 17, tipY = ar.y + Math.sin(ar.angle) * 17;

      // 命中武者
      const targets = ar.shooter === 'player' ? [ai] : [player];
      for (const t of targets) {
        const hit = hitFighterTest(tipX, tipY, t);
        if (hit) { resolveHit(ar, t, hit, tipX, tipY); done = true; break; }
      }
      if (done) break;
      // 高台
      if (pointInPlatform(tipX, tipY, platformL)) { stickArrow(ar, tipX, tipY, 'rock'); sndThud(); dustPuff(tipX, tipY); startResolve(0.85); done = true; break; }
      if (pointInPlatform(tipX, tipY, platformR)) { stickArrow(ar, tipX, tipY, 'rock'); sndThud(); dustPuff(tipX, tipY); startResolve(0.85); done = true; break; }
      // 地面
      if (tipY >= GROUND_Y) { stickArrow(ar, tipX, GROUND_Y, 'ground'); sndThud(); dustPuff(tipX, GROUND_Y); startResolve(0.85); done = true; break; }
      // 飞出边界
      if (ar.x < -100 || ar.x > W + 100 || ar.y > H + 120) { startResolve(0.55); done = true; break; }
    }
    if (!done) {
      ar.trail.push({ x: ar.x, y: ar.y, a: 1 });
      if (ar.trail.length > 26) ar.trail.shift();
    }
    if (done) arrows.splice(i, 1);
  }
  // 拖尾淡出在渲染时按索引衰减即可
}

function pointInPlatform(x, y, p) {
  return p && y >= p.top && y <= H && x >= p.cx - p.w / 2 - 6 && x <= p.cx + p.w / 2 + 6;
}
function stickArrow(ar, x, y, what) {
  stuckArrows.push({ x, y, angle: ar.angle, what });
}

function startResolve(t) {
  game.state = 'resolve'; game.stateT = 0; game.resolveTimer = t;
}

function resolveHit(ar, target, hit, hx, hy) {
  const base = 24 + Math.hypot(ar.vx, ar.vy) / 1500 * 12;
  let dmg = base * hit.mult * rand(0.85, 1.15);
  dmg = Math.round(dmg);
  target.hp = Math.max(0, target.hp - dmg);
  target.hpFlash = 1;
  target.pose = 'hit'; target.poseT = 0;
  stickArrow(ar, hx, hy, 'body');
  inkSplatter(hx, hy, hit.part === 'head' ? 30 : 20, target.hp <= 0);
  shake(hit.part === 'head' ? 9 : 5, 0.3);

  if (hit.part === 'head') {
    floats.push({ text: '会心一击', x: hx, y: hy - 46, vy: -34, life: 1.4, size: 30, color: CINNABAR, font: 'Ma Shan Zheng' });
    sndHitHead();
  } else {
    sndHitBody();
  }
  floats.push({ text: '-' + dmg, x: hx + rand(-8, 8), y: hy - 18, vy: -42, life: 1.1, size: 22, color: CINNABAR, font: 'Noto Serif SC' });

  if (target.hp <= 0) {
    // 斩杀：慢镜头
    game.slowT = 1.15;
    inkSplatter(hx, hy, 46, true);
    shake(12, 0.5);
  }
  startResolve(target.hp <= 0 ? 1.5 : 0.95);
}

/* ---------------- 粒子与特效 ---------------- */
function inkSplatter(x, y, n, big) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(40, big ? 380 : 260);
    particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(30, 160),
      r: rand(1.5, big ? 6 : 4.2), life: rand(0.5, 1.1), t: 0,
      color: Math.random() < 0.82 ? INK : CINNABAR,
    });
  }
}
function dustPuff(x, y) {
  for (let i = 0; i < 7; i++) {
    particles.push({
      x: x + rand(-4, 4), y: y + rand(-3, 1),
      vx: rand(-70, 70), vy: rand(-90, -20),
      r: rand(1.5, 3.4), life: rand(0.35, 0.7), t: 0, color: 'rgba(120,105,82,1)',
    });
  }
}
function shake(mag, t) { game.shakeMag = Math.max(game.shakeMag, mag); game.shakeT = Math.max(game.shakeT, t); }

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t >= p.life) { particles.splice(i, 1); continue; }
    p.vy += GRAV * 0.55 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > GROUND_Y - 1) { p.y = GROUND_Y - 1; p.vy *= -0.28; p.vx *= 0.6; }
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i];
    f.life -= dt; f.y += f.vy * dt; f.vy *= 0.94;
    if (f.life <= 0) floats.splice(i, 1);
  }
}

/* =====================================================================
 *  AI 弹道解算：粗搜 + 细化，含风补偿；难度决定误差与识风概率
 * ===================================================================== */
function simulateShot(x0, y0, speed, angle, windAcc, aimX, aimY) {
  // 返回轨迹与目标点的最小距离（不检测碰撞，纯运动学）
  let x = x0, y = y0;
  let vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
  const dt = 1 / 60;
  let minD = 1e9;
  for (let i = 0; i < 240; i++) {
    vy += GRAV * dt; vx += windAcc * dt;
    x += vx * dt; y += vy * dt;
    if (y > GROUND_Y + 30) break;
    const d = Math.hypot(x - aimX, y - aimY);
    if (d < minD) minD = d;
    if (minD < 4) break;
  }
  return minD;
}

function aiComputePlan() {
  const D = game.diff;
  const sk = skeleton(ai);
  const bp0 = { x: sk.shoulder.x - 25, y: sk.shoulder.y };  // 出手点近似
  const useWind = Math.random() >= D.igW;
  const windAcc = useWind ? game.wind * WIND_UNIT : 0;

  // 迭代缩差：局数越多，宗师越识破你的走位习惯
  const adaptMul = Math.pow(D.adapt, game.round - 1);
  const sa = D.sa * adaptMul;   // 角度误差 σ（度）
  const ss = D.ss * adaptMul;   // 力度误差 σ

  // 目标点：躯干中部（高手偶尔瞄头）；画布 y 向下，头顶 y 更小
  const tsk = skeleton(player);
  const aimBody = { x: tsk.neck.x, y: tsk.neck.y + 14 };
  const aimHead = { x: tsk.headX, y: tsk.headY };
  const aim = (D.key === 'hard' && Math.random() < 0.45) || (D.key === 'normal' && Math.random() < 0.2)
    ? aimHead : aimBody;

  // 画布坐标 y 向下：AI 朝左射，「向上 a 度」对应 va = π + a
  let best = { angle: -0.5, speed: 1000, miss: 1e9 };
  // 粗搜：-25°（向下俯射）～ 80°（抛射），0.5° 步进 + 更密的速度档
  for (let deg = -25; deg <= 80; deg += 0.5) {
    for (const sp of [600, 750, 900, 1000, 1100, 1200, 1300, 1400, 1500]) {
      const a = deg * Math.PI / 180;
      const va = Math.PI + a;
      const m = simulateShot(bp0.x, bp0.y, sp, va, windAcc, aim.x, aim.y);
      if (m < best.miss) best = { angle: va, speed: sp, miss: m };
    }
  }
  // 细化
  const cDeg = (best.angle - Math.PI) * 180 / Math.PI;
  for (let d = cDeg - 1.5; d <= cDeg + 1.5; d += 0.1) {
    for (let sp = best.speed - 120; sp <= best.speed + 120; sp += 15) {
      if (sp < ARROW_SPEED_MIN || sp > ARROW_SPEED_MAX) continue;
      const a = d * Math.PI / 180, va = Math.PI + a;
      const m = simulateShot(bp0.x, bp0.y, sp, va, windAcc, aim.x, aim.y);
      if (m < best.miss) best = { angle: va, speed: sp, miss: m };
    }
  }
  // 施加难度误差
  const errA = gauss() * sa * Math.PI / 180;
  const errS = 1 + gauss() * ss;
  return { angle: best.angle + errA, speed: clamp(best.speed * errS, ARROW_SPEED_MIN, ARROW_SPEED_MAX) };
}

/* ---------------- AI 回合 ---------------- */
function beginAiTurn() {
  game.state = 'aiAim'; game.stateT = 0; game.aiAimT = 0;
  game.aiPlan = aiComputePlan();
  ai.aimAngle = Math.PI + 0.35;   // 从一个舒展的起手角（略抬弓）开始
  ai.pull = 0;
  ai.pose = 'aim';
}
function updateAiAim(dt) {
  const D = game.diff;
  const dur = lerp(D.think[0], D.think[1], 0.5);
  game.aiAimT += dt;
  const t = clamp(game.aiAimT / dur, 0, 1);
  ai.pull = t;
  // 起手角平滑过渡到目标角，带一点手抖
  const wig = Math.sin(t * 10) * (1 - t) * 0.05;
  ai.aimAngle = lerp(Math.PI + 0.35, game.aiPlan.angle, t) + wig;
  if (t >= 1) {
    fireArrow(ai, game.aiPlan.speed, game.aiPlan.angle);
    game.aiPlan = null;
  }
}

/* ---------------- 回合流转 ---------------- */
function advanceAfterResolve() {
  if (player.hp <= 0 || ai.hp <= 0) {
    const playerWon = ai.hp <= 0;
    if (playerWon) { game.scoreP++; sndWin(); } else { game.scoreA++; sndLose(); }
    game.stampText = playerWon ? '胜' : '负';
    game.stampIsWin = playerWon;
    (playerWon ? player : ai).pose = 'idle';
    (playerWon ? ai : player).pose = 'dead';
    game.state = 'stamp'; game.stateT = 0;
    return;
  }
  // 换边
  if (game.turn === 'player') {
    game.turn = 'ai';
    rollWind(false);
    beginAiTurn();
  } else {
    game.turn = 'player';
    rollWind(false);
    game.state = 'playerAim'; game.stateT = 0;
    player.pose = 'idle';
  }
}

function endMatch() {
  game.state = 'match';
  const won = game.scoreP > game.scoreA;
  const el = document.getElementById('match-screen');
  document.getElementById('match-result-text').textContent = won ? '技高一筹' : '箭落人败';
  document.getElementById('match-result-text').style.color = won ? CINNABAR : INK;
  document.getElementById('match-score-text').textContent = game.scoreP + ' 比 ' + game.scoreA;
  document.getElementById('match-comment').textContent =
    (won ? '此番论箭，' : '对手言道：') +
    (won ? game.diff.comment : '阁下箭势已尽，回去再修三载，随时回来雪耻。');
  el.classList.remove('hidden');
  document.getElementById('mute-btn').style.display = 'block';
}

/* ---------------- 玩家输入 ---------------- */
let aiming = false, aimStart = null, aimCur = null;

function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}

canvas.addEventListener('pointerdown', e => {
  ensureAudio();
  if (game.state !== 'playerAim') return;
  if (e.button === 2) { cancelAim(); return; }
  aiming = true;
  aimStart = toLogical(e); aimCur = aimStart;
  player.pose = 'aim';
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!aiming) return;
  aimCur = toLogical(e);
});
canvas.addEventListener('pointerup', e => {
  if (!aiming) return;
  aiming = false;
  const v = aimVector();
  if (v && v.power > 0.1) {
    player.aimAngle = v.angle; player.pull = v.power;
    fireArrow(player, ARROW_SPEED_MIN + v.power * (ARROW_SPEED_MAX - ARROW_SPEED_MIN), v.angle);
  } else {
    cancelAim();
  }
});
canvas.addEventListener('contextmenu', e => { e.preventDefault(); cancelAim(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape') cancelAim(); });

function aimVector() {
  if (!aimStart || !aimCur) return null;
  const dx = aimStart.x - aimCur.x, dy = aimStart.y - aimCur.y;
  const len = Math.hypot(dx, dy);
  if (len < 6) return null;
  return { angle: Math.atan2(dy, dx), power: clamp(len / MAX_PULL, 0, 1) };
}
function cancelAim() {
  aiming = false; aimStart = null; aimCur = null;
  player.pull = 0; player.aimAngle = null;
  if (game.state === 'playerAim') player.pose = 'idle';
}

/* ---------------- 弹道预演（玩家瞄准时） ---------------- */
function previewTrajectory() {
  const v = aimVector();
  if (!v || v.power <= 0.02) return null;
  const speed = ARROW_SPEED_MIN + v.power * (ARROW_SPEED_MAX - ARROW_SPEED_MIN);
  const bp = bowPoints({ ...player, aimAngle: v.angle, pull: v.power });
  let x = bp.nock.x + bp.dx * 30, y = bp.nock.y + bp.dy * 30;
  let vx = Math.cos(v.angle) * speed, vy = Math.sin(v.angle) * speed;
  const windAcc = game.wind * WIND_UNIT;
  const pts = [];
  let impact = null;
  const dt = 1 / 60;
  for (let i = 0; i < 110; i++) {
    vy += GRAV * dt; vx += windAcc * dt;
    x += vx * dt; y += vy * dt;
    if (i % 4 === 0) pts.push({ x, y });
    const tipX = x + Math.cos(Math.atan2(vy, vx)) * 17, tipY = y + Math.sin(Math.atan2(vy, vx)) * 17;
    if (hitFighterTest(tipX, tipY, ai) || pointInPlatform(tipX, tipY, platformL) ||
        pointInPlatform(tipX, tipY, platformR) || tipY >= GROUND_Y) {
      impact = { x: tipX, y: tipY };
      break;
    }
    if (x < -80 || x > W + 80 || y > H + 100) break;
  }
  return { pts, impact, angle: v.angle, power: v.power };
}

/* =====================================================================
 *  第三部分：渲染 · 主循环 · UI 绑定
 * ===================================================================== */

/* ---------------- 背景 ---------------- */
function drawBackdrop(g) {
  if (assetsReady) {
    // 等比 cover 铺满
    const ir = imgBackdrop.width / imgBackdrop.height, cr = W / H;
    let dw, dh;
    if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
    g.drawImage(imgBackdrop, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  }
  // 纸色罩染 + 四角晕影，突出前景
  g.fillStyle = 'rgba(233,225,207,.16)'; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(43,33,24,.26)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);

  // 流动的薄雾
  for (const m of mist) {
    m.x += m.v * 0.016;
    if (m.x - m.w / 2 > W + 100) m.x = -m.w / 2 - 100;
    g.save();
    g.globalAlpha = m.a;
    g.fillStyle = '#f4eedd';
    g.beginPath();
    g.ellipse(m.x, m.y, m.w / 2, m.h / 2, 0, 0, TAU);
    g.filter = 'blur(1px)';
    g.fill();
    g.restore();
  }
}
function initMist() {
  mist = [
    { x: 300, y: 420, w: 520, h: 90, a: 0.13, v: 5.5 },
    { x: 800, y: 520, w: 640, h: 110, a: 0.11, v: 3.8 },
    { x: 1100, y: 360, w: 420, h: 70, a: 0.09, v: 7.2 },
  ];
}

/* ---------------- 地面与高台 ---------------- */
// 预生成地面飞白笔触，避免每帧随机导致闪烁
const groundStrokes = [];
for (let i = 0; i < 14; i++) {
  groundStrokes.push({
    x1: rand(0, W * 0.3), y: GROUND_Y + 14 + i * ((H - GROUND_Y - 20) / 14),
    x2: rand(W * 0.6, W), dy: rand(-2, 2),
  });
}
function drawGround(g) {
  g.fillStyle = 'rgba(59,49,38,.9)';
  g.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  // 地面顶部一笔浓墨
  g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, GROUND_Y + 2);
  for (let x = 0; x <= W; x += 60) g.lineTo(x, GROUND_Y + 2 + Math.sin(x * 0.021) * 2.5);
  g.stroke();
  // 飞白笔触纹理（预生成）
  g.strokeStyle = 'rgba(233,225,207,.10)'; g.lineWidth = 2;
  for (const s of groundStrokes) {
    g.beginPath(); g.moveTo(s.x1, s.y); g.lineTo(s.x2, s.y + s.dy); g.stroke();
  }
}

function drawPlatform(g, p) {
  const half = p.w / 2;
  // 岩体：不规则多边形，向下延伸到画布底
  g.beginPath();
  g.moveTo(p.pts[0].x + p.pts[0].jx, p.top + p.pts[0].jy);
  for (let i = 1; i < p.pts.length; i++) g.lineTo(p.pts[i].x + p.pts[i].jx, p.top + p.pts[i].jy);
  // 右侧往下
  g.lineTo(p.cx + half + p.sideJitter[0], p.top + 90);
  g.lineTo(p.cx + half + p.sideJitter[1], p.top + 220);
  g.lineTo(p.cx + half - 8 + p.sideJitter[2], H);
  g.lineTo(p.cx - half + 8 + p.sideJitter[3], H);
  g.lineTo(p.cx - half + p.sideJitter[2] * 0.6, p.top + 200);
  g.lineTo(p.cx - half + p.sideJitter[3] * 0.6, p.top + 80);
  g.closePath();
  const grad = g.createLinearGradient(0, p.top, 0, H);
  grad.addColorStop(0, '#463a2c');
  grad.addColorStop(0.5, '#332a1f');
  grad.addColorStop(1, '#241d15');
  g.fillStyle = grad;
  g.fill();

  // 台面浓墨笔锋
  g.strokeStyle = INK; g.lineWidth = 5.5; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(p.pts[0].x, p.top + p.pts[0].jy);
  for (let i = 1; i < p.pts.length; i++) g.lineTo(p.pts[i].x + p.pts[i].jx, p.top + p.pts[i].jy);
  g.stroke();

  // 淡墨皴法纹理
  g.strokeStyle = 'rgba(233,225,207,.08)'; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const x0 = p.cx - half + 20 + i * (p.w - 40) / 5;
    g.beginPath();
    g.moveTo(x0, p.top + 18 + (i % 2) * 12);
    g.quadraticCurveTo(x0 + 14, p.top + 70 + i * 10, x0 - 8, p.top + 130 + i * 16);
    g.stroke();
  }
  // 台顶草叶
  g.strokeStyle = 'rgba(43,33,24,.75)'; g.lineWidth = 2;
  for (const gr of p.grass) {
    for (let b = -2; b <= 2; b++) {
      g.beginPath();
      g.moveTo(gr.x + b * 3, p.top - 1);
      g.quadraticCurveTo(gr.x + b * 3 + b * 2, p.top - 9 * gr.s, gr.x + b * 5 + b * 3, p.top - 15 * gr.s);
      g.stroke();
    }
  }
}

/* ---------------- 火柴人绘制（水墨笔意） ---------------- */
function inkLine(g, x1, y1, x2, y2, w, alpha) {
  g.globalAlpha = alpha == null ? 1 : alpha;
  g.strokeStyle = INK;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.globalAlpha = 1;
}

function drawStickman(g, f) {
  const sk = skeleton(f);
  const dead = f.pose === 'dead';

  g.save();
  if (f.pose === 'hit') {
    // 受击后仰抖动
    const k = Math.max(0, 1 - f.poseT * 3);
    g.translate(f.x, f.yFeet);
    g.rotate(-f.facing * 0.22 * k);
    g.translate(-f.x, -f.yFeet);
  }

  if (dead) {
    // 倒地：一笔横陈
    const fall = f.deadFall;
    const gy = f.yFeet - 6;
    g.globalAlpha = 1;
    g.fillStyle = INK;
    // 头
    g.beginPath();
    g.arc(f.x - f.facing * (26 + 8 * fall), gy - 6, sk.headR, 0, TAU);
    g.fill();
    // 躯干横线
    inkLine(g, f.x - f.facing * 14, gy - 4, f.x + f.facing * 18, gy - 2, 4.4);
    // 腿
    inkLine(g, f.x + f.facing * 18, gy - 2, f.x + f.facing * 34, gy, 4);
    inkLine(g, f.x + f.facing * 18, gy - 2, f.x + f.facing * 30, gy + 5, 4);
    // 手臂摊开
    inkLine(g, f.x - f.facing * 12, gy - 4, f.x - f.facing * 20, gy + 4, 3.4);
    inkLine(g, f.x - f.facing * 10, gy - 5, f.x - f.facing * 6, gy + 6, 3.4);
    g.restore();
    return;
  }

  // 双腿（弓步）
  inkLine(g, sk.hip.x, sk.hip.y, sk.footF.x, sk.footF.y, 4.4);
  inkLine(g, sk.hip.x, sk.hip.y, sk.footB.x, sk.footB.y, 4.4);
  // 躯干
  inkLine(g, sk.hip.x, sk.hip.y, sk.neck.x, sk.neck.y, 4.8);
  // 头（实心墨团）
  g.fillStyle = INK;
  g.beginPath(); g.arc(sk.headX, sk.headY, sk.headR, 0, TAU); g.fill();
  // 发带一抹朱砂
  g.strokeStyle = CINNABAR; g.lineWidth = 2.6;
  g.beginPath();
  g.arc(sk.headX, sk.headY, sk.headR - 3, Math.PI * (f.facing === 1 ? 1.15 : 1.35), Math.PI * (f.facing === 1 ? 1.85 : 1.65));
  g.stroke();

  const aimPose = (f.pose === 'aim' || f.pose === 'release');
  if (aimPose && f.aimAngle != null) {
    const bp = bowPoints(f);
    const a = f.aimAngle, dx = Math.cos(a), dy = Math.sin(a);
    const px = -dy, py = dx;   // 垂直方向
    const pull = f.pull;

    // 后手：肩 → 弓弦搭箭处
    inkLine(g, sk.shoulder.x, sk.shoulder.y, bp.nock.x, bp.nock.y, 4);
    // 前手：肩 → 弓握点
    inkLine(g, sk.shoulder.x, sk.shoulder.y, bp.grip.x, bp.grip.y, 4);

    // 弓身：两条二次曲线拼出弓臂
    const belly = 15 + pull * 9;
    const tip1 = { x: bp.grip.x + px * 25 - dx * 7, y: bp.grip.y + py * 25 - dy * 7 };
    const tip2 = { x: bp.grip.x - px * 25 - dx * 7, y: bp.grip.y - py * 25 - dy * 7 };
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 3.6; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(tip1.x, tip1.y);
    g.quadraticCurveTo(bp.grip.x + dx * belly + px * 6, bp.grip.y + dy * belly + py * 6, bp.grip.x, bp.grip.y);
    g.quadraticCurveTo(bp.grip.x + dx * belly - px * 6, bp.grip.y + dy * belly - py * 6, tip2.x, tip2.y);
    g.stroke();

    // 弓弦（拉满时绷成两段折线）
    g.strokeStyle = 'rgba(233,225,207,.9)'; g.lineWidth = 1.4;
    const nX = bp.nock.x, nY = bp.nock.y;
    g.beginPath();
    g.moveTo(tip1.x, tip1.y); g.lineTo(nX, nY); g.lineTo(tip2.x, tip2.y);
    g.stroke();

    // 搭在弦上的箭
    drawArrowShape(g, nX, nY, a, true);

    // 拉满时弓弦处的蓄力墨晕
    if (pull > 0.65) {
      g.globalAlpha = (pull - 0.65) * 1.2 * (0.6 + 0.4 * Math.sin(f.breathe * 5));
      g.strokeStyle = CINNABAR; g.lineWidth = 2;
      g.beginPath(); g.arc(nX, nY, 12 + (pull - 0.65) * 22, 0, TAU); g.stroke();
      g.globalAlpha = 1;
    }
  } else {
    // 垂手（随呼吸轻摆）
    const sway = Math.sin(f.breathe * 0.9) * 2;
    inkLine(g, sk.shoulder.x, sk.shoulder.y, sk.shoulder.x + f.facing * 5 + sway, sk.shoulder.y + 27, 4);
    inkLine(g, sk.shoulder.x, sk.shoulder.y, sk.shoulder.x - f.facing * 4 - sway, sk.shoulder.y + 26, 4);
    // 背上的箭壶（玩家）
    if (f.kind === 'player') {
      const qx = f.x - f.facing * 14, qy = sk.neck.y - 2;
      inkLine(g, qx, qy, qx - f.facing * 7, qy - 26, 3, 0.9);
      g.strokeStyle = INK_SOFT; g.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(qx - f.facing * 9 + i * 3, qy - 24);
        g.lineTo(qx - f.facing * 12 + i * 3, qy - 34);
        g.stroke();
      }
    }
  }

  g.restore();
}

/* ---------------- 箭矢绘制 ---------------- */
function drawArrowShape(g, x, y, angle, nocked) {
  g.save();
  g.translate(x, y); g.rotate(angle);
  const L = 34;
  // 杆
  g.strokeStyle = '#3d2f1f'; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-L * 0.6, 0); g.lineTo(L * 0.4, 0); g.stroke();
  // 箭头（墨锋）
  g.fillStyle = INK;
  g.beginPath();
  g.moveTo(L * 0.4 + 6, 0);
  g.lineTo(L * 0.4 - 3, -3.2); g.lineTo(L * 0.4 - 3, 3.2);
  g.closePath(); g.fill();
  // 朱砂尾羽
  g.strokeStyle = CINNABAR; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-L * 0.6, 0); g.lineTo(-L * 0.6 - 7, -4.5); g.stroke();
  g.beginPath(); g.moveTo(-L * 0.6, 0); g.lineTo(-L * 0.6 - 7, 4.5); g.stroke();
  if (nocked) {
    // 箭尾搭弦处小点
    g.fillStyle = CINNABAR;
    g.beginPath(); g.arc(-L * 0.6, 0, 1.8, 0, TAU); g.fill();
  }
  g.restore();
}

function drawFlyingArrows(g) {
  for (const ar of arrows) {
    // 拖尾（墨点渐隐）
    for (let i = 0; i < ar.trail.length; i++) {
      const t = ar.trail[i];
      const k = i / ar.trail.length;
      g.globalAlpha = k * 0.35;
      g.fillStyle = INK;
      g.beginPath(); g.arc(t.x, t.y, 1 + k * 1.6, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    drawArrowShape(g, ar.x, ar.y, ar.angle, false);
  }
}

/* ---------------- HUD ---------------- */
function drawHpBar(g, x, y, w, h, frac, flash, alignRight) {
  // 笔锋外框
  g.strokeStyle = INK; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath();
  if (!alignRight) g.rect(x, y, w, h); else g.rect(x - w, y, w, h);
  g.stroke();
  // 填充：浓墨
  const fw = w * clamp(frac, 0, 1);
  g.fillStyle = INK;
  if (!alignRight) g.fillRect(x + 2, y + 2, Math.max(0, fw - 4), h - 4);
  else g.fillRect(x - 2 - Math.max(0, fw - 4), y + 2, Math.max(0, fw - 4), h - 4);
  // 受击红闪
  if (flash > 0) {
    g.globalAlpha = flash * 0.55;
    g.fillStyle = CINNABAR;
    if (!alignRight) g.fillRect(x, y, w, h); else g.fillRect(x - w, y, w, h);
    g.globalAlpha = 1;
  }
}

function drawHUD(g) {
  // 名号
  g.fillStyle = INK;
  g.font = "26px 'Ma Shan Zheng', serif";
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillText('侠客', 40, 34);
  g.textAlign = 'right';
  g.fillText(game.diff.label, W - 40, 34);

  drawHpBar(g, 40, 44, 300, 15, player.hp / player.hpMax, player.hpFlash, false);
  drawHpBar(g, W - 40, 44, 300, 15, ai.hp / ai.hpMax, ai.hpFlash, true);

  // HP 数字
  g.font = "13px 'Noto Serif SC', serif";
  g.fillStyle = INK_SOFT;
  g.textAlign = 'left';
  g.fillText(Math.ceil(player.hp) + ' / ' + player.hpMax, 40, 76);
  g.textAlign = 'right';
  g.fillText(Math.ceil(ai.hp) + ' / ' + ai.hpMax, W - 40, 76);

  // 中上：局分与印章
  g.textAlign = 'center';
  g.font = "20px 'Ma Shan Zheng', serif";
  g.fillStyle = INK;
  g.fillText('第 ' + cnNum(game.round) + ' 局', W / 2, 36);
  // 战绩小印章
  for (let i = 0; i < WIN_ROUNDS; i++) {
    drawSeal(g, W / 2 - 62 - i * 34, 48, 24, i < game.scoreP, '侠');
    drawSeal(g, W / 2 + 62 + i * 34, 48, 24, i < game.scoreA, '敌');
  }

  // 风向标（布条）
  drawWindBanner(g, W / 2, 96);

  // 玩家瞄准时的操作提示（在深色地面上，用纸色字）
  if (game.state === 'playerAim' && !aiming) {
    g.globalAlpha = 0.65 + 0.25 * Math.sin(game.stateT * 3);
    g.font = "17px 'Noto Serif SC', serif";
    g.fillStyle = FADE_PAPER;
    g.textAlign = 'left';
    g.fillText('按住拖拽拉弓 · 松手放箭 · 右键或 Esc 取消', 40, H - 22);
    g.globalAlpha = 1;
  }

  // 瞄准参数（带纸色底衬）
  if (aiming) {
    const v = aimVector();
    if (v) {
      const deg = Math.round(-v.angle * 180 / Math.PI);
      const label = deg + '° · 势 ' + Math.round(v.power * 100);
      g.font = "18px 'Noto Serif SC', serif";
      const tw = g.measureText(label).width;
      g.fillStyle = 'rgba(244,238,221,.85)';
      g.beginPath();
      g.roundRect(player.x - tw / 2 - 10, player.yFeet - 132, tw + 20, 28, 6);
      g.fill();
      g.fillStyle = INK;
      g.textAlign = 'center';
      g.fillText(label, player.x, player.yFeet - 111);
    }
  }

  // AI 拉弓提示（带纸色底衬保证可读）
  if (game.state === 'aiAim') {
    g.font = "17px 'Noto Serif SC', serif";
    const label = game.diff.label + ' 拉弓中…';
    const tw = g.measureText(label).width;
    g.fillStyle = 'rgba(244,238,221,.85)';
    g.beginPath();
    g.roundRect(ai.x - tw / 2 - 10, ai.yFeet - 138, tw + 20, 28, 6);
    g.fill();
    g.fillStyle = CINNABAR;
    g.textAlign = 'center';
    g.fillText(label, ai.x, ai.yFeet - 117);
  }
}

function drawSeal(g, x, y, s, active, label) {
  g.save();
  g.translate(x, y);
  g.rotate(0.08 * (label === '敌' ? -1 : 1));
  g.globalAlpha = active ? 1 : 0.18;
  g.fillStyle = active ? CINNABAR : INK;
  g.beginPath(); g.roundRect(-s / 2, -s / 2, s, s, 4); g.fill();
  if (active) {
    g.strokeStyle = 'rgba(244,238,221,.8)'; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6, 3); g.stroke();
  }
  g.fillStyle = active ? FADE_PAPER : 'rgba(43,33,24,.5)';
  g.font = s * 0.58 + "px 'Ma Shan Zheng', serif";
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(active ? label : '·', 0, 1);
  g.restore();
  g.textBaseline = 'alphabetic';
}

function drawWindBanner(g, cx, y) {
  const w = game.wind;
  g.save();
  g.translate(cx, y);
  // 布条
  g.fillStyle = 'rgba(244,238,221,.92)';
  g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.roundRect(-78, -16, 156, 32, 5); g.fill(); g.stroke();
  g.fillStyle = INK;
  g.font = "17px 'Noto Serif SC', serif";
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (Math.abs(w) < 0.01) {
    g.fillText('风止', 0, 1);
  } else {
    const dir = w > 0 ? 1 : -1;
    const n = Math.max(1, Math.round(Math.abs(w)));
    // 左侧「风」字
    g.font = "16px 'Ma Shan Zheng', serif";
    g.fillText('风', -52, 1);
    // 箭头表示吹向
    g.strokeStyle = CINNABAR; g.lineWidth = 2.4; g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const ax = -22 + i * 22 * dir + (dir < 0 ? 0 : 0);
      const a1 = ax, a2 = ax + 14 * dir;
      g.beginPath(); g.moveTo(Math.min(a1, a2), 0); g.lineTo(Math.max(a1, a2), 0); g.stroke();
      // 箭头尖
      g.beginPath();
      g.moveTo(a2, 0); g.lineTo(a2 - 5 * dir, -4); g.lineTo(a2 - 5 * dir, 4); g.closePath();
      g.fillStyle = CINNABAR; g.fill();
    }
    g.fillStyle = INK;
    g.font = "14px 'Noto Serif SC', serif";
    g.fillText(Math.abs(w).toString(), 60, 1);
  }
  g.restore();
  g.textBaseline = 'alphabetic';
}

/* ---------------- 弹道预演绘制 ---------------- */
function drawPreview(g) {
  if (game.state !== 'playerAim' || !aiming) return;
  const pv = previewTrajectory();
  if (!pv) return;
  // 墨点串
  for (let i = 0; i < pv.pts.length; i++) {
    const p = pv.pts[i];
    const k = 1 - i / pv.pts.length;
    g.globalAlpha = 0.14 + k * 0.5;
    g.fillStyle = INK;
    g.beginPath(); g.arc(p.x, p.y, 1.6 + k * 2.1, 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
  // 落点朱砂标记
  if (pv.impact) {
    g.strokeStyle = CINNABAR; g.lineWidth = 2.2;
    const r = 7 + Math.sin(game.stateT * 7) * 1.5;
    g.beginPath(); g.arc(pv.impact.x, pv.impact.y, r, 0, TAU); g.stroke();
    g.beginPath();
    g.moveTo(pv.impact.x - r - 4, pv.impact.y); g.lineTo(pv.impact.x - r + 2, pv.impact.y);
    g.moveTo(pv.impact.x + r - 2, pv.impact.y); g.lineTo(pv.impact.x + r + 4, pv.impact.y);
    g.stroke();
  }
  // 拉弓方向短墨线（从手指反方向示意）
  const v = pv;
  g.strokeStyle = 'rgba(43,33,24,.5)';
  g.lineWidth = 2; g.setLineDash([5, 5]);
  g.beginPath();
  g.moveTo(aimCur.x, aimCur.y); g.lineTo(aimStart.x, aimStart.y);
  g.stroke();
  g.setLineDash([]);
}

/* ---------------- 落定的箭 ---------------- */
function drawStuckArrows(g) {
  for (const s of stuckArrows) {
    drawArrowShape(g, s.x - Math.cos(s.angle) * 6, s.y - Math.sin(s.angle) * 6, s.angle, false);
  }
}

/* ---------------- 粒子 / 飘字 ---------------- */
function drawParticles(g) {
  for (const p of particles) {
    const k = 1 - p.t / p.life;
    g.globalAlpha = k * 0.9;
    g.fillStyle = p.color;
    g.beginPath(); g.arc(p.x, p.y, p.r * (0.4 + k * 0.6), 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
}
function drawFloats(g) {
  for (const f of floats) {
    g.globalAlpha = clamp(f.life, 0, 1);
    g.fillStyle = f.color;
    g.font = f.size + "px '" + (f.font || 'Ma Shan Zheng') + "', serif";
    g.textAlign = 'center';
    g.fillText(f.text, f.x, f.y);
  }
  g.globalAlpha = 1;
}

/* ---------------- 局banner与胜负印章 ---------------- */
function drawBanner(g) {
  if (game.state !== 'banner') return;
  const t = game.stateT;
  const aIn = clamp(t / 0.35, 0, 1);
  const aOut = 1 - clamp((t - 1.5) / 0.4, 0, 1);
  const a = Math.min(aIn, aOut);
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a;
  g.fillStyle = 'rgba(233,225,207,.72)';
  g.fillRect(0, H / 2 - 92, W, 150);
  g.fillStyle = INK;
  g.font = "64px 'Ma Shan Zheng', serif";
  g.textAlign = 'center';
  g.fillText(game.bannerText, W / 2, H / 2 + 4);
  g.font = "22px 'Noto Serif SC', serif";
  g.fillStyle = CINNABAR;
  g.fillText(game.bannerSub, W / 2, H / 2 + 46);
  g.restore();
}

function drawStamp(g) {
  if (game.state !== 'stamp' && game.state !== 'match') return;
  const t = game.stateT;
  const k = clamp(t / 0.28, 0, 1);
  const ease = 1 - Math.pow(1 - k, 3);
  const scale = 0.4 + ease * 0.6 + (1 - ease) * 0.25;
  const rot = (game.stampIsWin ? -0.1 : 0.08) * ease;
  g.save();
  g.translate(W / 2, H / 2 - 40);
  g.rotate(rot);
  g.scale(scale, scale);
  g.globalAlpha = 0.92 * ease;
  // 印章底
  g.fillStyle = game.stampIsWin ? CINNABAR : 'rgba(43,33,24,.9)';
  g.beginPath(); g.roundRect(-84, -84, 168, 168, 14); g.fill();
  g.strokeStyle = 'rgba(244,238,221,.75)'; g.lineWidth = 4;
  g.beginPath(); g.roundRect(-70, -70, 140, 140, 10); g.stroke();
  g.fillStyle = FADE_PAPER;
  g.font = "120px 'Ma Shan Zheng', serif";
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(game.stampText, 0, 8);
  g.restore();
  g.textBaseline = 'alphabetic';
}

/* ---------------- 主渲染 ---------------- */
function render() {
  const g = ctx;
  g.setTransform(RS, 0, 0, RS, 0, 0);
  g.clearRect(0, 0, W, H);

  // 屏幕震动
  if (game.shakeT > 0) {
    const m = game.shakeMag * (game.shakeT / 0.5);
    g.translate(rand(-m, m), rand(-m, m));
  }

  drawBackdrop(g);
  drawGround(g);
  if (platformL) drawPlatform(g, platformL);
  if (platformR) drawPlatform(g, platformR);

  if (game.state !== 'title') {
    drawStuckArrows(g);
    drawStickman(g, ai);
    drawStickman(g, player);
    drawFlyingArrows(g);
    drawParticles(g);
    drawPreview(g);
    drawHUD(g);
    drawFloats(g);
    drawBanner(g);
    drawStamp(g);
  }
}

/* ---------------- 主循环 ---------------- */
let lastT = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!lastT) { lastT = ts; return; }
  let dt = Math.min((ts - lastT) / 1000, 1 / 20);
  lastT = ts;

  // 慢镜头
  if (game.slowT > 0) { game.slowT -= dt; game.timeScale = 0.24; }
  else game.timeScale = Math.min(1, game.timeScale + dt * 2.4);
  const sdt = dt * game.timeScale;

  for (const f of [player, ai]) {
    f.breathe += sdt * 2.1;
    f.poseT += sdt;
    if (f.pose === 'release' && f.poseT > 0.3) f.pose = 'idle';
    if (f.pose === 'hit' && f.poseT > 0.55) f.pose = 'idle';
    f.hpFlash = Math.max(0, f.hpFlash - sdt * 2.2);
    if (f.pose === 'dead') f.deadFall = Math.min(1, f.deadFall + sdt * 3.2);
  }
  if (game.shakeT > 0) { game.shakeT -= dt; if (game.shakeT <= 0) game.shakeMag = 0; }

  switch (game.state) {
    case 'banner':
      game.stateT += dt;
      if (game.stateT > 1.95) {
        if (game.turn === 'player') { game.state = 'playerAim'; game.stateT = 0; }
        else beginAiTurn();
      }
      break;
    case 'playerAim':
      game.stateT += dt;
      if (aiming) {
        const v = aimVector();
        player.aimAngle = v ? v.angle : null;
        player.pull = v ? v.power : 0;
      }
      break;
    case 'aiAim':
      updateAiAim(sdt);
      break;
    case 'fly':
      game.stateT += sdt;
      updateArrows(sdt);
      break;
    case 'resolve':
      game.stateT += dt;
      if (game.stateT >= game.resolveTimer) advanceAfterResolve();
      break;
    case 'stamp':
      game.stateT += dt;
      if (game.stateT > 1.9) {
        if (game.scoreP >= WIN_ROUNDS || game.scoreA >= WIN_ROUNDS) endMatch();
        else setupRound();
      }
      break;
  }

  updateParticles(sdt);
  render();
}

/* ---------------- UI 绑定 ---------------- */
function startMatch(diffKey) {
  ensureAudio(); sndClick();
  game.diff = DIFFS[diffKey];
  game.scoreP = 0; game.scoreA = 0; game.round = 0;
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('match-screen').classList.add('hidden');
  document.getElementById('mute-btn').style.display = 'block';
  setupRound();
}

document.querySelectorAll('.diff-card').forEach(btn => {
  btn.addEventListener('click', () => startMatch(btn.dataset.diff));
});
document.getElementById('btn-rematch').addEventListener('click', () => {
  sndClick();
  game.scoreP = 0; game.scoreA = 0; game.round = 0;
  document.getElementById('match-screen').classList.add('hidden');
  setupRound();
});
document.getElementById('btn-back').addEventListener('click', () => {
  sndClick();
  game.state = 'title';
  document.getElementById('match-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
});
document.getElementById('mute-btn').addEventListener('click', () => { ensureAudio(); setMuted(!muted); saveMuted(muted); });
setMuted(muted);

/* ---------------- 启动 ---------------- */
initMist();
let loopStarted = false;
function startLoop() {
  if (loopStarted) return;
  loopStarted = true;
  requestAnimationFrame(loop);
}
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(startLoop);
  setTimeout(startLoop, 1500);  // 字体兜底
} else {
  startLoop();
}

window.__MOGONG__ = { get state(){ return game.state; }, get diff(){ return game.diff.key; }, get round(){ return game.round; }, get hp(){ return [Math.ceil(player.hp), Math.ceil(ai.hp)]; }, get score(){ return [game.scoreP, game.scoreA]; } };
try{var __d=new URLSearchParams(location.search).get('diff');if(__d&&DIFFS[__d]){var __b=document.querySelector('[data-diff="'+__d+'"]');if(__b)setTimeout(function(){__b.click();},350);}}catch(e){}

})();

}
