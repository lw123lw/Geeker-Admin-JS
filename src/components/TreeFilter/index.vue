<template>
  <div class="card filter">
    <h4 v-if="title" class="title sle">
      {{ title }}
    </h4>
    <div class="search">
      <el-input v-model="filterText" placeholder="输入关键字进行过滤" clearable />
      <el-dropdown trigger="click">
        <el-icon size="20">
          <More />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="toggleTreeNodes(true)">展开全部</el-dropdown-item>
            <el-dropdown-item @click="toggleTreeNodes(false)">折叠全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-scrollbar :style="{ height: title ? `calc(100% - 95px)` : `calc(100% - 56px)` }">
      <el-tree
        ref="treeRef"
        default-expand-all
        :node-key="id"
        :data="multiple ? treeData : treeAllData"
        :show-checkbox="multiple"
        :check-strictly="false"
        :current-node-key="!multiple ? selected : ''"
        :highlight-current="!multiple"
        :expand-on-click-node="false"
        :check-on-click-node="multiple"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :default-checked-keys="multiple ? selected : []"
        @node-click="handleNodeClick"
        @check="handleCheckChange"
      >
        <template #default="scope">
          <span class="el-tree-node__label">
            <slot :row="scope">
              {{ scope.node.label }}
            </slot>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script setup name="TreeFilter">
import { ref, watch, nextTick, onMounted } from "vue";
import { ElTree } from "element-plus";

const props = defineProps({
  id: {
    type: String,
    default: "id",
    required: false
  },
  title: {
    type: String,
    default: () => ""
  },
  label: {
    type: String,
    default: "label"
  },
  multiple: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: [String, Array],
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  },
  requestApi: {
    type: Function,
    default: () => {}
  }
});

const defaultProps = {
  children: "children",
  label: props.label
};

const treeRef = ref();
const treeData = ref([]);
const treeAllData = ref([]);

const selected = ref();
const setSelected = () => {
  if (props.multiple) selected.value = Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
  else selected.value = typeof props.defaultValue === "string" ? props.defaultValue : "";
};

// 使用 nextTick 防止打包后赋值不生效，开发环境是正常的
watch(
  () => props.defaultValue,
  () => nextTick(() => setSelected()),
  { deep: true, immediate: true }
);

watch(
  () => props.data,
  () => {
    if (props.data) {
      treeData.value = props.data;
      treeAllData.value = [{ id: "", [props.label]: "全部" }, ...props.data];
    }
  },
  { deep: true, immediate: true }
);

const filterText = ref("");
watch(filterText, val => {
  treeRef.value.filter(val);
});

// 过滤
const filterNode = (value, data, node) => {
  if (!value) return true;
  let parentNode = node?.parent,
    labels = [node.label],
    level = 1;
  while (level < node.level) {
    labels = [...labels, parentNode?.label];
    parentNode = parentNode?.parent;
    level++;
  }
  return labels.some(label => label.indexOf(value) !== -1);
};

// 切换树节点的展开或折叠状态
const toggleTreeNodes = isExpand => {
  let nodes = treeRef.value?.store.nodesMap;
  if (!nodes) return;
  for (const node in nodes) {
    if (nodes.hasOwnProperty(node)) {
      nodes[node].expanded = isExpand;
    }
  }
};

// emit
const emit = defineEmits(["change"]);

// 单选
const handleNodeClick = data => {
  if (props.multiple) return;
  emit("change", data[props.id]);
};

// 多选
const handleCheckChange = () => {
  emit("change", treeRef.value?.getCheckedKeys());
};

onMounted(async () => {
  setSelected();
  if (props.data.length > 0) {
    treeData.value = props.data;
    treeAllData.value = [{ id: "", [props.label]: "全部" }, ...props.data];
    return;
  }
  try {
    const response = await props.requestApi();
    const { data } = response;
    treeData.value = data;
    treeAllData.value = [{ id: "", [props.label]: "全部" }, ...data];
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// 暴露给父组件使用
defineExpose({ treeData, treeAllData, treeRef });
</script>

<style scoped lang="scss">
@import "./index";
</style>
