/**
 * v-debounce
 * 按钮防抖指令，可自行扩展至input
 * 接收参数：function类型
 */
const debounce = {
  mounted(el, binding) {
    if (typeof binding.value !== "function") {
      throw "callback must be a function";
    }
    let timer = null;
    el.__handleClick__ = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setTimeout(() => {
        binding.value();
      }, 500);
    };
    el.addEventListener("click", el.__handleClick__);
  },
  beforeUnmount(el) {
    el.removeEventListener("click", el.__handleClick__);
  }
};

export default debounce;
