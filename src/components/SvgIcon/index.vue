<template>
  <svg :style="iconStyle" aria-hidden="true">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup name="SvgIcon">
import { computed, CSSProperties } from "vue";

const props = withDefaults(defineProps(["iconStyle", "prefix"]), {
  prefix: "icon",
  iconStyle: () => ({ width: "100px", height: "100px" })
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>
