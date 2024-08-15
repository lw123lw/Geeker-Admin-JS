<template>
  <div id="echarts" ref="chartRef" :style="echartsStyle" />
</template>

<script setup name="ECharts">
import { ref, onMounted, onBeforeUnmount, watch, computed, markRaw, nextTick, onActivated } from "vue";
import echarts from "./config";
import { useDebounceFn } from "@vueuse/core";
import { useGlobalStore } from "@/stores/modules/global";
import { storeToRefs } from "pinia";

const props = defineProps({
  option: {
    type: Object,
    default: () => ({})
  },
  echartsStyle: {
    type: Object,
    default: () => ({})
  },
  renderer: {
    type: String,
    default: "canvas"
  },
  resize: {
    type: Boolean,
    default: true
  }
});

const echartsStyle = computed(() => {
  return props.width || props.height
    ? { height: props.height + "px", width: props.width + "px" }
    : { height: "100%", width: "100%" };
});

const chartRef = ref();
const chartInstance = ref();

const draw = () => {
  if (chartInstance.value) {
    chartInstance.value.setOption(props.option, { notMerge: true });
  }
};

watch(props, () => {
  draw();
});

const handleClick = event => props.onClick && props.onClick(event);

const init = () => {
  if (!chartRef.value) return;
  chartInstance.value = echarts.getInstanceByDom(chartRef.value);

  if (!chartInstance.value) {
    chartInstance.value = markRaw(
      echarts.init(chartRef.value, props.theme, {
        renderer: props.renderer
      })
    );
    chartInstance.value.on("click", handleClick);
    draw();
  }
};

const resize = () => {
  if (chartInstance.value && props.resize) {
    chartInstance.value.resize({ animation: { duration: 300 } });
  }
};

const debouncedResize = useDebounceFn(resize, 300, { maxWait: 800 });

const globalStore = useGlobalStore();
const { maximize, isCollapse, tabs, footer } = storeToRefs(globalStore);

watch(
  () => [maximize, isCollapse, tabs, footer],
  () => {
    debouncedResize();
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => init());
  window.addEventListener("resize", debouncedResize);
});

onActivated(() => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
});

onBeforeUnmount(() => {
  chartInstance.value?.dispose();
  window.removeEventListener("resize", debouncedResize);
});

defineExpose({
  getInstance: () => chartInstance.value,
  resize,
  draw
});
</script>
