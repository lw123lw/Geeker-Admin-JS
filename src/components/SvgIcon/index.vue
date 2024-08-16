<template>
  <svg :style="iconStyle" aria-hidden="true" :title="name">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup name="SvgIcon">
import { computed } from "vue";

const props = defineProps({
  iconStyle: {
    type: Object,
    default: () => ({ width: "100px", height: "100px" })
  },
  prefix: {
    type: String,
    default: "icon"
  },
  name: {
    type: String,
    default: ""
  }
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>
