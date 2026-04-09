// Collage portfolio data transcribed from reference/webflow/collage.html
// and collage-series.html. Image URLs point to /collage/ for files
// present in public/collage/, Webflow CDN for hosted ones, or empty
// string ("") when the source image is missing and we should fall back
// to a placeholder tile.

export type CollageImage = {
  url: string;
  alt: string;
};

export type CollageSeries = {
  title: string;
  description: string;
  images: CollageImage[];
};

export const collagePortfolio: CollageImage[] = [
  { url: "/collage/cutouts-22.jpg", alt: "cutouts 22" },
  { url: "/collage/191007_v2.jpg", alt: "191007 v2" },
  { url: "https://uploads-ssl.webflow.com/57d2acc0578a8a81597b1030/5aac7b08e8d43c6d062e809d_Octopus_LocomotiveBrett.jpg", alt: "Octopus LocomotiveBrett" },
  { url: "https://uploads-ssl.webflow.com/57d2acc0578a8a81597b1030/5aac7a73c776cc9bad8e20c6_Octopus_Echoes2%20(1).jpg", alt: "Octopus Echoes2 (1)" },
  { url: "/collage/BD_FEB19_SQ.jpg", alt: "BD FEB19 SQ" },
  { url: "", alt: "Gotama web" },
  { url: "", alt: "MAR 22" },
  { url: "/collage/10_NOV_p.jpg", alt: "10 NOV p" },
  { url: "/collage/BackstageDiaries_Q2_sq.jpg", alt: "BackstageDiaries Q2 sq" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/58e65ad344b92de14226456e_Octopus_Zephyr.jpg", alt: "Octopus Zephyr" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/58e65b1c7bff9b0220568071_Octopus_Peaches_v2.jpg", alt: "Octopus Peaches v2" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2b4dcdfabefe729e23733_idees_au_logis_p.jpg", alt: "idees au logis p" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45df61c882348567c6a46_-desconhecidos-_21640284805_o.jpg", alt: "desconhecidos  21640284805 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2b4327157a0022ab29567_Grund.jpg", alt: "Grund" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/588aa1e9b370ec203e7c7645_Dantallion_LITE_web2.jpg", alt: "Dantallion LITE web2" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/588aa2879211dae901140feb_Dantalion_FULL_web.jpg", alt: "Dantalion FULL web" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2ae6f7157a0022ab28bc5_mahalakshmiyei-namaha_21766823423_o.jpg", alt: "mahalakshmiyei namaha 21766823423 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2ad296ade7ec05d5ac7ba_quiromania_24754823796_o.jpg", alt: "quiromania 24754823796 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2f9a18da457f069b4ab8d_ewe_21998870100_o.jpg", alt: "ewe 21998870100 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2f9e2746c2acf32ecd24a_the-jump_21354919448_o.jpg", alt: "the jump 21354919448 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2faaeeb4ae50729cf4127_earth-over-fire_21354722810_o.jpg", alt: "earth over fire 21354722810 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2ae0a578a8a81597b10f8_you-know_7840978036_o.jpg", alt: "you know 7840978036 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2ae35dfabefe729e22d68_aya_21998865950_o.jpg", alt: "aya 21998865950 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2f1628da457f069b485f2_SET-21-16.jpg", alt: "SET 21 16" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d96d053e00175638176add_SET-12-16.jpg", alt: "SET 12 16" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45720ab1957093a830ab3_SET-22-16.jpg", alt: "SET 22 16" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2fa1bfa63e0f428a7b5c0_entrega_24838563920_o.png", alt: "entrega 24838563920 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2fa6a8da457f069b4aed9_fisch_25040938611_o.png", alt: "fisch 25040938611 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2ae9beeca0efd5d9e759b_peixe-bom_25015970632_o.png", alt: "peixe bom 25015970632 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d32a1f07885418518c3d68_fair-play_9199721631_o.jpg", alt: "fair play 9199721631 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d32a2084000bc60ddb070a_branches_9202506240_o.jpg", alt: "branches 9202506240 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d32a1f72089b045ad28db4_archer_9199720391_o.jpg", alt: "archer 9199720391 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d32a1fa1924bb30d7b5b01_deer-legs_9202503274_o.jpg", alt: "deer legs 9202503274 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d32a1fc4bd65d559a5a4bb_gato-sobe-desce_9202503076_o.jpg", alt: "gato sobe desce 9202503076 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d32a1f9520dcdb50934373_go-figure_9202506642_o.jpg", alt: "go figure 9202506642 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e46103d0ac813956dc96f6_yans-1_19043762641_o.jpg", alt: "yans 1 19043762641 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e4610326afb15e5e6d88e2_xang_18854435109_o.jpg", alt: "xang 18854435109 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e461031c882348567c7954_yans-2_19035071922_o.jpg", alt: "yans 2 19035071922 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45dfe26afb15e5e6d85e5_argument_23727904955_o.jpg", alt: "argument 23727904955 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57d2ad4e25e8c28c596217fa_schneiden--fgen_24218440735_o.jpg", alt: "schneiden  fgen 24218440735 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45e14f0345c214ef1f377_irre_23305190526_o.jpg", alt: "irre 23305190526 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2f135cdde29fb69ba96c2_SET-15-16.jpg", alt: "SET 15 16" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e2f1628da457f069b485f1_SET-16-16.jpg", alt: "SET 16 16" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e4607326afb15e5e6d8831_the-switch-and-the-spur_5500940463_o.jpg", alt: "the switch and the spur 5500940463 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45fd926afb15e5e6d8814_brln0_22223525530_o.jpg", alt: "brln0 22223525530 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45ffed82fa82e4e443e3b_klubnacht_22607019715_o.jpg", alt: "klubnacht 22607019715 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e45ffd5ca171515efc1ef3_permanence_22698718427_o.jpg", alt: "permanence 22698718427 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e460965ca171515efc1f63_cosmic-trigger_6831258005_o.jpg", alt: "cosmic trigger 6831258005 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e46058d82fa82e4e443e57_life-is-short_7204119776_o.jpg", alt: "life is short 7204119776 o" },
  { url: "https://daks2k3a4ib2z.cloudfront.net/57d2acc0578a8a81597b1030/57e4607f26afb15e5e6d8834_split-chopsticks_7363771344_o.jpg", alt: "split chopsticks 7363771344 o" },
];

export const collageSeries: CollageSeries[] = [
  {
    title: "Orgia dos signos",
    description: "Orgia dos signos (Orgy of signs, 2020) is a series made of 13 images: twelve smaller individual illustrations representing each of the zodiac signs, contrasted with a larger image in which the same individual elements are remixed within a single chaotic mass. The pieces were designed to work both separately and in combination with each other, allowing for a number of possible arrangements. Prints available soon.",
    images: [
      { url: "", alt: "ORGIA SIGNS BorderSquare 01" },
      { url: "", alt: "Layer Visibility 0011 ORGIA SIGNS Aries" },
      { url: "", alt: "Layer Visibility 0010 ORGIA SIGNS Taurus" },
      { url: "", alt: "Layer Visibility 0009 ORGIA SIGNS Gemini" },
      { url: "", alt: "ORGIA SIGNS BorderSquare 04" },
      { url: "", alt: "Layer Visibility 0000 Orgy of Signs Pisces" },
      { url: "", alt: "ORGIA CENTER web 1600" },
      { url: "", alt: "Layer Visibility 0008 ORGIA SIGNS Cancer" },
      { url: "", alt: "Layer Visibility 0002 ORGIA SIGNS Aquarius" },
      { url: "", alt: "Layer Visibility 0007 ORGIA SIGNS Leo" },
      { url: "", alt: "Layer Visibility 0001 ORGIA SIGNS Capricorn" },
      { url: "", alt: "Layer Visibility 0006 ORGIA SIGNS Virgo" },
      { url: "", alt: "ORGIA SIGNS BorderSquare 02" },
      { url: "", alt: "Layer Visibility 0003 ORGIA SIGNS Sagittarius" },
      { url: "", alt: "Layer Visibility 0004 ORGIA SIGNS Scorpio" },
      { url: "", alt: "Layer Visibility 0005 ORGIA SIGNS Libra" },
      { url: "", alt: "ORGIA SIGNS BorderSquare 03" },
    ],
  },
  {
    title: "gemstones",
    description: "The Gemstones (2019) Exhibited for the first time in January 2019 at BeijosXXXX – Agora’s goodbye party, the Gemstones are a bijou of virility cut together with geometric influence centered upon a vivid background, or as the artist himself describes them: “a series of pseudo-cubist origami pieces of stone and flesh.”. Prints available.",
    images: [
      { url: "https://uploads-ssl.webflow.com/57d2acc0578a8a81597b1030/5c919cb3e8b0db0b9589f508_GEMSTONE_1_SQ_web.jpg", alt: "GEMSTONE 1 SQ web" },
      { url: "https://uploads-ssl.webflow.com/57d2acc0578a8a81597b1030/5c919cc49b11943ac3fe657b_GEMSTONE_3_SQ_web.jpg", alt: "GEMSTONE 3 SQ web" },
      { url: "https://uploads-ssl.webflow.com/57d2acc0578a8a81597b1030/5c919cc555ff5c273ec8f1a3_GEMSTONE_2_SQ_web.jpg", alt: "GEMSTONE 2 SQ web" },
      { url: "https://uploads-ssl.webflow.com/57d2acc0578a8a81597b1030/5c919cc5c6c3aa08781879f5_GEMSTONE_4_SQ_web.jpg", alt: "GEMSTONE 4 SQ web" },
      { url: "", alt: "IMG 4700" },
      { url: "", alt: "IMG 4697" },
    ],
  },
];
