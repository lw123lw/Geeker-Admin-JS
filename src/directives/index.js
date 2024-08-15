import auth from "./modules/auth.js";
import copy from "./modules/copy.js";
import waterMarker from "./modules/waterMarker.js";
import draggable from "./modules/draggable.js";
import debounce from "./modules/debounce.js";
import throttle from "./modules/throttle.js";
import longpress from "./modules/longpress.js";

const directivesList = {
  auth,
  copy,
  waterMarker,
  draggable,
  debounce,
  throttle,
  longpress
};

const directives = {
  install(app) {
    Object.keys(directivesList).forEach(key => {
      app.directive(key, directivesList[key]);
    });
  }
};

export default directives;
