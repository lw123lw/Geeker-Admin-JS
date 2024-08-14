import { createI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";

import zh from "./modules/zh.js";
import en from "./modules/en.js";

const i18n = createI18n({
  // Use Composition API, Set to false
  allowComposition: true,
  legacy: false,
  locale: getBrowserLang(),
  messages: {
    zh,
    en
  }
});

export default i18n;
