<!-- 📚📚📚 Pro-Table 文档: https://juejin.cn/post/7166068828202336263 -->
<template>
  <!-- 查询表单 -->
  <SearchForm
    v-show="isShowSearch"
    :search="_search"
    :reset="_reset"
    :columns="searchColumns"
    :search-param="searchParam"
    :search-col="searchCol"
  />

  <!-- 表格主体 -->
  <div class="card table-main">
    <!-- 表格头部 操作按钮 -->
    <div class="table-header">
      <div class="header-button-lf">
        <slot name="tableHeader" :selected-list="selectedList" :selected-list-ids="selectedListIds" :is-selected="isSelected" />
      </div>
      <div v-if="toolButton" class="header-button-ri">
        <slot name="toolButton">
          <el-space>
            <el-tooltip v-if="showToolButton('refresh')" content="刷新" placement="top">
              <el-button :icon="Refresh" circle @click="getTableList" />
            </el-tooltip>
            <el-tooltip v-if="showToolButton('setting') && columns.length" content="列设置" placement="top">
              <el-button circle :icon="Operation" @click="openColSetting" />
            </el-tooltip>
            <el-tooltip v-if="showToolButton('search') && searchColumns?.length" content="开/关搜索" placement="top">
              <el-button :icon="Search" circle @click="isShowSearch = !isShowSearch" />
            </el-tooltip>
            <el-tooltip v-if="isTreeData" content="开/关图谱" placement="top">
              <el-button :icon="Share" circle @click="switchGraphStatus" />
            </el-tooltip>
          </el-space>
        </slot>
      </div>
    </div>
    <!-- 表格主体 -->
    <el-table
      v-if="!isShowGraph"
      ref="tableRef"
      v-bind="$attrs"
      :id="uuid"
      :data="tableData"
      :border="border"
      :row-key="rowKey"
      @selection-change="selectionChange"
    >
      <!-- 默认插槽 -->
      <slot />
      <template v-for="item in tableColumns" :key="item">
        <!-- selection || radio || index || expand || sort -->
        <el-table-column
          v-if="item.type && columnTypes.includes(item.type)"
          v-bind="item"
          :align="item.align ?? 'center'"
          :reserve-selection="item.type === 'selection'"
        >
          <template #default="scope">
            <!-- expand -->
            <template v-if="item.type === 'expand'">
              <component :is="item.render" v-bind="scope" v-if="item.render" />
              <slot v-else :name="item.type" v-bind="scope" />
            </template>
            <!-- radio -->
            <el-radio v-if="item.type === 'radio'" v-model="radio" :label="scope.row[rowKey]">
              <i></i>
            </el-radio>
            <!-- sort -->
            <el-tag v-if="item.type === 'sort'" class="move">
              <el-icon>
                <DCaret />
              </el-icon>
            </el-tag>
          </template>
        </el-table-column>
        <!-- other -->
        <TableColumn v-else :column="item">
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope">
              <el-text>{{ scope.row[item.prop] }}</el-text>
            </slot>
          </template>
        </TableColumn>
      </template>
      <!-- 插入表格最后一行之后的插槽 -->
      <template #append>
        <slot name="append">{{ defaultAppendValue }}</slot>
      </template>
      <!-- 无数据 -->
      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无数据</div>
          </slot>
        </div>
      </template>
    </el-table>
    <!-- 图谱组件 -->
    <Graph
      ref="relationGraph"
      v-if="(data || tableData) && isShowGraph"
      :tree-data="data || tableData"
      :children-name="childrenName"
      :label-name="labelName"
      :label-key="labelKey"
      :enable-cross-parents="enableCrossParents"
      @action="action"
    >
      <template #action="{ nodeObject }">
        <slot name="graphAction" :node-object="nodeObject"></slot>
      </template>
      <template #preAction="{ nodeObject }">
        <slot name="graphPreAction" :node-object="nodeObject"></slot>
      </template>
    </Graph>
    <!-- 分页组件 -->
    <slot name="pagination">
      <Pagination
        v-if="pagination"
        :pageable="pageable"
        :handle-size-change="handleSizeChange"
        :handle-current-change="handleCurrentChange"
      />
    </slot>
  </div>
  <!-- 列设置 -->
  <ColSetting v-if="toolButton" ref="colRef" v-model:col-setting="colSetting" />
</template>

<script setup name="ProTable">
import { ref, watch, provide, onMounted, unref, computed, reactive } from "vue";
import { ElTable } from "element-plus";
import { useTable } from "@/hooks/useTable";
import { useSelection } from "@/hooks/useSelection";
import { Refresh, Operation, Search, Share } from "@element-plus/icons-vue";
import { generateUUID, handleProp, hasTreeStructure } from "@/utils";
import SearchForm from "@/components/SearchForm/index.vue";
import Pagination from "./components/Pagination.vue";
import ColSetting from "./components/ColSetting.vue";
import TableColumn from "./components/TableColumn.vue";
import Graph from "./components/Graph.vue";
import Sortable from "sortablejs";

// 接受父组件参数，配置默认值
const props = defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: [Array, null], default: () => null },
  requestApi: { type: Function, default: () => {} },
  requestError: { type: Function, default: () => {} },
  dataCallback: { type: Function, default: () => {} },
  title: { type: String, default: () => "", required: false },
  requestAuto: { type: Boolean, default: () => true },
  pagination: { type: Boolean, default: () => true },
  initParam: { type: Object, default: () => ({}) },
  border: { type: Boolean, default: () => true },
  toolButton: { type: [Boolean, Array], default: () => true },
  rowKey: { type: String, default: () => "id" },
  searchCol: { type: [Number, Object], default: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }) },
  labelKey: { type: String, default: () => "id" },
  labelName: { type: String, default: () => "name" },
  childrenName: { type: String, default: () => "children" },
  enableCrossParents: { type: Boolean, default: () => false }
});

// table 实例
const tableRef = ref();
const relationGraph = ref();

// 生成组件唯一id
const uuid = ref("id-" + generateUUID());

// column 列类型
const columnTypes = ["selection", "radio", "index", "expand", "sort"];

// 是否显示搜索模块
const isShowSearch = ref(true);

// 是否展示图谱
const isShowGraph = ref(false);

const defaultAppendValue = ref("");

// 控制 ToolButton 显示
const showToolButton = key => {
  return Array.isArray(props.toolButton) ? props.toolButton.includes(key) : props.toolButton;
};

// 单选值
const radio = ref("");

// 表格多选 Hooks
const { selectionChange, selectedList, selectedListIds, isSelected } = useSelection(props.rowKey);

// 表格操作 Hooks
const {
  isTreeData,
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange
} = useTable(props.requestApi, props.initParam, props.pagination, props.dataCallback, props.requestError);

if (props.data) {
  isTreeData.value = hasTreeStructure(props.data, "children");
}

// 清空选中数据列表
const clearSelection = () => tableRef.value.clearSelection();

// 初始化表格数据 && 拖拽排序
onMounted(() => {
  dragSort();
  props.requestAuto && getTableList();
  props.data && (pageable.value.total = props.data.length);
  if (props.data) {
    tableData.value = props.data;
  }
});

// 处理表格数据
const processTableData = computed(() => {
  if (!props.data) return tableData.value;
  if (!props.pagination) return props.data;
  return props.data.slice(
    (pageable.value.pageNum - 1) * pageable.value.pageSize,
    pageable.value.pageSize * pageable.value.pageNum
  );
});

// 监听页面 initParam 改化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true });

// 接收 columns 并设置为响应式
const tableColumns = reactive(props.columns);

// 扁平化 columns
const flatColumns = computed(() => flatColumnsFunc(tableColumns));

// 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
const enumMap = ref(new Map());
const setEnumMap = async ({ prop, enum: enumValue }) => {
  if (!enumValue) return;

  // 如果当前 enumMap 存在相同的值 return
  if (enumMap.value.has(prop) && (typeof enumValue === "function" || enumMap.value.get(prop) === enumValue)) return;

  // 当前 enum 为静态数据，则直接存储到 enumMap
  if (typeof enumValue !== "function") return enumMap.value.set(prop, unref(enumValue));

  // 为了防止接口执行慢，而存储慢，导致重复请求，所以预先存储为[]，接口返回后再二次存储
  enumMap.value.set(prop, []);

  // 当前 enum 为后台数据需要请求数据，则调用该请求接口，并存储到 enumMap
  const { data } = await enumValue();
  enumMap.value.set(prop, data);
};

// 注入 enumMap
provide("enumMap", enumMap);

// 扁平化 columns 的方法
const flatColumnsFunc = (columns, flatArr = []) => {
  columns.forEach(async col => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children));
    flatArr.push(col);

    // column 添加默认 isShow && isSetting && isFilterEnum 属性值
    col.isShow = col.isShow ? col.isShow : true;
    col.isSetting = col.isSetting ? col.isSetting : true;
    col.isFilterEnum = col.isFilterEnum ? col.isFilterEnum : true;

    // 设置 enumMap
    await setEnumMap(col);
  });
  return flatArr.filter(item => !item._children?.length);
};

// 过滤需要搜索的配置项 && 排序
const searchColumns = computed(() => {
  return flatColumns.value
    ?.filter(item => item.search?.el || item.search?.render)
    .sort((a, b) => a.search.order - b.search.order);
});

// 设置 搜索表单默认排序 && 搜索表单项的默认值
searchColumns.value?.forEach((column, index) => {
  column.search.order = column.search?.order ?? index + 2;
  const key = column.search?.key ?? handleProp(column.prop);
  const defaultValue = column.search?.defaultValue;
  if (defaultValue) {
    searchParam.value[key] = defaultValue;
    searchInitParam.value[key] = defaultValue;
  }
});

// 列设置 ==> 需要过滤掉不需要设置的列
const colRef = ref();
const colSetting = tableColumns.filter(item => {
  const { type, prop, isSetting } = item;
  return !columnTypes.includes(type) && prop !== "operation" && isSetting;
});
const openColSetting = () => colRef.value.openColSetting();

// 定义 emit 事件
const emit = defineEmits([
  "search",
  "reset",
  "dragSort",
  "updateAction",
  "action",
  "deleteAction",
  "staticDataChange",
  "rowClick"
]);

const _search = () => {
  console.log(isShowGraph.value);
  if (!isShowGraph.value) {
    search();
    return;
  }
  const labelName = props.labelName;
  relationGraph.value.focusOnNode(searchParam.value[labelName]);
  emit("search");
};

const _reset = () => {
  reset();
  emit("reset");
};

// 表格拖拽排序
const dragSort = () => {
  const tbody = document.querySelector(`#${uuid.value} tbody`);
  Sortable.create(tbody, {
    handle: ".move",
    animation: 300,
    onEnd({ newIndex, oldIndex }) {
      const [removedItem] = processTableData.value.splice(oldIndex, 1);
      processTableData.value.splice(newIndex, 0, removedItem);
      emit("dragSort", { newIndex, oldIndex });
    }
  });
};

const action = (actionStr, data) => {
  if (actionStr === "删除") {
    return emit("deleteAction", data);
  }
  emit("action", actionStr, data);
};

// 表格/图谱切换
const switchGraphStatus = async () => {
  isShowGraph.value = !isShowGraph.value;
  if (isShowGraph.value) return;
  const nodes = relationGraph.value.jsonData.nodes;
  const lines = relationGraph.value.jsonData.lines;

  // 删除表格中仅作为展示的节点
  nodes.map((item, index) => {
    if (item.text === "表格") delete nodes[index];
  });

  // 创建树结构
  let treeStructure = [];

  // 构建树结构
  const buildTree = async () => {
    const map = new Map();
    // 初始化每个节点
    lines.forEach(line => {
      if (!map.has(line.from)) map.set(line.from, { name: line.from, children: [] });
      if (!map.has(line.to)) map.set(line.to, { name: line.to, children: [] });
    });
    // 构建树结构
    lines.forEach(line => {
      const parent = map.get(line.from);
      const child = map.get(line.to);
      parent.children.push(child);
    });
    // 获取根节点
    const rootNames = [...new Set(lines.map(line => line.from))];
    const childNames = new Set(lines.map(line => line.to));
    const rootNodes = rootNames.filter(name => !childNames.has(name));
    treeStructure = rootNodes.map(rootName => map.get(rootName));
  };

  // 将数据嵌入树状结构的函数
  const embedDataIntoTree = async (treeArray, nodes) => {
    treeArray.forEach(tree => {
      // 查找与当前项的 name 匹配的节点
      const matchingNode = nodes.find(node => node?.text === tree.name);
      if (matchingNode) {
        delete tree.name;
        // 如果找到匹配的节点，将其 data 放入树结构中
        delete matchingNode.data.children;
        Object.assign(tree, matchingNode.data);
      }
      if (tree.children && tree.children.length > 0) embedDataIntoTree(tree.children, nodes);
    });
  };
  await buildTree();
  treeStructure = JSON.parse(JSON.stringify(treeStructure, null, 2))[0].children;

  await embedDataIntoTree(treeStructure, nodes);
  tableData.value = treeStructure;
  // 兼容静态数据(非promise获取)的数据更新
  emit("staticDataChange", tableData.value);
};

// 暴露给父组件的参数和方法 (外部需要什么，都可以从这里暴露出去)
defineExpose({
  element: tableRef,
  tableData: processTableData,
  radio,
  pageable,
  searchParam,
  searchInitParam,
  isSelected,
  selectedList,
  selectedListIds,

  // 下面为 function
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  clearSelection,
  enumMap
});
</script>
