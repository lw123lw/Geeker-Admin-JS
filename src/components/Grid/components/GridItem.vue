<template>
  <div v-show="isShow" :style="style">
    <slot></slot>
  </div>
</template>
<script setup name="GridItem">
import { computed, inject, ref, useAttrs, watch } from "vue";

const props = defineProps({
  offset: { type: Number, default: 0 },
  span: { type: Number, default: 1 },
  suffix: { type: Boolean, default: false },
  xs: { type: [Number, Object], default: undefined },
  sm: { type: [Number, Object], default: undefined },
  md: { type: [Number, Object], default: undefined },
  lg: { type: [Number, Object], default: undefined },
  xl: { type: [Number, Object], default: undefined }
});

const attrs = useAttrs();
const isShow = ref(true);

// 注入断点
const breakPoint = inject("breakPoint", ref("xl"));
const shouldHiddenIndex = inject("shouldHiddenIndex", ref(-1));
watch(
  () => [shouldHiddenIndex.value, breakPoint.value],
  n => {
    if (!!attrs.index) {
      isShow.value = !(n[0] !== -1 && parseInt(attrs.index) >= Number(n[0]));
    }
  },
  { immediate: true }
);

const gap = inject("gap", 0);
const cols = inject("cols", ref(4));
const style = computed(() => {
  let span = props[breakPoint.value]?.span ?? props.span;
  let offset = props[breakPoint.value]?.offset ?? props.offset;
  if (props.suffix) {
    return {
      gridColumnStart: cols.value - span - offset + 1,
      gridColumnEnd: `span ${span + offset}`,
      marginLeft: offset !== 0 ? `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})` : "unset"
    };
  } else {
    return {
      gridColumn: `span ${span + offset > cols.value ? cols.value : span + offset}/span ${
        span + offset > cols.value ? cols.value : span + offset
      }`,
      marginLeft: offset !== 0 ? `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})` : "unset"
    };
  }
});
</script>
