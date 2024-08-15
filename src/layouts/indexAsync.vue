<!-- 💥 这里是异步加载 LayoutComponents -->
<template>
  <el-watermark id="watermark" :font="font" :content="watermark ? ['Geeker Admin', 'Happy Working'] : ''">
    <suspense>
      <template #default>
        <component :is="LayoutComponents[layout]" />
      </template>
      <template #fallback>
        <Loading />
      </template>
    </suspense>
    <ThemeDrawer />
  </el-watermark>
</template>

<script setup name="layoutAsync">
import { computed, reactive, watch } from "vue";
import { useGlobalStore } from "@/stores/modules/global";
import Loading from "@/components/Loading/index.vue";
import ThemeDrawer from "./components/ThemeDrawer/index.vue";

const LayoutComponents = {
  vertical: () => import("./LayoutVertical/index.vue"),
  classic: () => import("./LayoutClassic/index.vue"),
  transverse: () => import("./LayoutTransverse/index.vue"),
  columns: () => import("./LayoutColumns/index.vue")
};

const globalStore = useGlobalStore();

const isDark = computed(() => globalStore.isDark);
const layout = computed(() => globalStore.layout);
const watermark = computed(() => globalStore.watermark);

const font = reactive({ color: "rgba(0, 0, 0, .15)" });
watch(isDark, () => (font.color = isDark.value ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)"), {
  immediate: true
});
</script>

<style scoped lang="scss">
.layout {
  min-width: 600px;
}
</style>
