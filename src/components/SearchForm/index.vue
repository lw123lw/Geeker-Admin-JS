<template>
  <div v-if="columns.length" class="card table-search">
    <el-form ref="formRef" :model="searchParam">
      <Grid ref="gridRef" :collapsed="collapsed" :gap="[20, 0]" :cols="searchCol">
        <GridItem v-for="(item, index) in columns" :key="item.prop" v-bind="getResponsive(item)" :index="index">
          <el-form-item>
            <template #label>
              <el-space :size="4">
                <span>
                  <span>{{ `${item.search?.label ?? item.label}` }}</span>
                  <el-tooltip v-if="item.search?.tooltip" effect="dark" :content="item.search?.tooltip" placement="top">
                    <i :class="'iconfont icon-yiwen'"></i>
                  </el-tooltip>
                </span>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <SearchFormItem :column="item" :search-param="searchParam" />
          </el-form-item>
        </GridItem>
        <GridItem suffix>
          <div class="operation">
            <el-button type="primary" :icon="Search" @click="search"> 搜索</el-button>
            <el-button :icon="Delete" @click="reset"> 重置</el-button>
            <el-button v-if="showCollapse" type="primary" link class="search-isOpen" @click="collapsed = !collapsed">
              {{ collapsed ? "展开" : "合并" }}
              <el-icon class="el-icon--right">
                <component :is="collapsed ? ArrowDown : ArrowUp"></component>
              </el-icon>
            </el-button>
          </div>
        </GridItem>
      </Grid>
    </el-form>
  </div>
</template>
<script setup name="SearchForm">
import { computed, ref } from "vue";

import { Delete, Search, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import SearchFormItem from "./components/SearchFormItem.vue";
import Grid from "@/components/Grid/index.vue";
import GridItem from "@/components/Grid/components/GridItem.vue";

// 默认值
const props = defineProps({
  searchParam: {
    type: Object,
    default: () => ({})
  },
  columns: {
    type: Array,
    default: () => []
  },
  searchCol: {
    type: [Number, Object],
    default: () => {}
  },
  search: {
    type: Function,
    default: () => {}
  },
  reset: {
    type: Function,
    default: () => {}
  }
});

// 获取响应式设置
const getResponsive = item => {
  return {
    span: item.search?.span,
    offset: item.search?.offset ?? 0,
    xs: item.search?.xs,
    sm: item.search?.sm,
    md: item.search?.md,
    lg: item.search?.lg,
    xl: item.search?.xl
  };
};

// 是否默认折叠搜索项
const collapsed = ref(true);

// 获取响应式断点
const gridRef = ref();
const breakPoint = computed(() => gridRef.value?.breakPoint);

// 判断是否显示 展开/合并 按钮
const showCollapse = computed(() => {
  let show = false;
  props.columns.reduce((prev, current) => {
    prev +=
      (current.search[breakPoint.value]?.span ?? current.search?.span ?? 1) +
      (current.search[breakPoint.value]?.offset ?? current.search?.offset ?? 0);
    if (typeof props.searchCol !== "number") {
      if (prev >= props.searchCol[breakPoint.value]) show = true;
    } else {
      if (prev >= props.searchCol) show = true;
    }
    return prev;
  }, 0);
  return show;
});
</script>
