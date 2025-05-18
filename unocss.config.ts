import {
  defineConfig,
  presetWind4,
  presetAttributify,
  presetIcons,
  presetWebFonts,
} from "unocss";
import type { IconifyJSON } from "@iconify/types";

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      collections: {
        "material-symbols": () =>
          import("@iconify-json/material-symbols/icons.json").then(
            (i) => i.default
          ) as Promise<IconifyJSON>,
        solar: () =>
          import("@iconify-json/solar/icons.json").then(
            (i) => i.default
          ) as Promise<IconifyJSON>,
      },
    }),
    presetWebFonts(),
  ],
  theme: {
    font: {
      poppins: "Poppins",
    },
  },
});
