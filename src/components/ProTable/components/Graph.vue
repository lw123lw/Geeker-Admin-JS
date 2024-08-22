<template>
  <div ref="page" class="graph" @click="isShowNodeMenuPanel = false">
    <div class="graph-box" v-if="treeData">
      <RelationGraph
        class="graph-box-main"
        ref="relationGraph$"
        :options="options"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick"
        :on-canvas-click="onCanvasClick"
        @before-create-line="beforeCreateLine"
        @mousemove="onMouseMove"
      >
        <template #node="{ node }">
          <div class="line-text" @click="showNodeMenus(node, $event)" @contextmenu.prevent.stop="showNodeMenus(node, $event)">
            {{ node.text }}
          </div>
        </template>
        <template #graph-plug>
          <RGEditingConnectController />
          <RGEditingLineController />
          <!-- tip显示，显示除了虚设的根节点 -->
          <div
            class="c-tips"
            v-if="isShowNodeTips && currentNode?.text !== ROOT_NAME && showTip"
            :style="{ left: nodeTipsPosition.x + 'px', top: nodeTipsPosition.y + 'px' }"
          >
            <!-- 默认 tip, slot -->
            <slot name="tip" :node-object="currentNode?.data">
              <div>节点名称: {{ currentNode?.text }}</div>
            </slot>
          </div>
        </template>
      </RelationGraph>
    </div>

    <!-- 右键菜单 -->
    <div
      v-show="isShowNodeMenuPanel"
      class="rc-menu"
      :style="{ left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }"
    >
      <el-space :direction="'vertical'" v-if="currentNode">
        <slot name="preAction" :node-object="currentNode?.data"></slot>
        <slot name="action" :node-object="currentNode?.data">
          <el-button type="primary" :icon="View" @click.stop="doAction('查看')">查 看</el-button>
          <el-button type="primary" :icon="EditPen" @click.stop="doAction('编辑')">编 辑</el-button>
          <el-button type="primary" :icon="Delete" @click.stop="doAction('删除')">删 除</el-button>
        </slot>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import RelationGraph, { RGEditingConnectController, RGEditingLineController } from "relation-graph-vue3";
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { ElNotification } from "element-plus";
import graphConfig from "../config/graphConfig.json";
import { useGraph } from "../../../hooks/useGraph";

const props = defineProps({
  treeData: { type: Array, default: () => [] },
  labelKey: { type: String, default: "id" },
  labelName: { type: String, default: "name" },
  childrenName: { type: String, default: "children" },
  showTip: { type: Boolean, default: true },
  enableCrossParents: { type: Boolean, default: false },
  highLight: { type: Boolean, default: false },
  graph: { type: Object, default: () => {} }
});

const emit = defineEmits(["action"]);

const page = ref();
const relationGraph$ = ref(); // 图谱实例
const options = ref(graphConfig); // 图谱配置
const isShowNodeTips = ref(false); // 是否展示节点提示
const isShowNodeMenuPanel = ref(false); // 是否展示节点菜单
const nodeTipsPosition = ref({ x: 0, y: 0 });
const nodeMenuPanelPosition = ref({ x: 0, y: 0 }); // 节点菜单定位
const currentNode = ref({}); // 当前选择的节点
const originalLine = ref({ from: "", to: "" }); // 被操作的原节点
const jsonData = ref({ rootId: "graph", nodes: [], lines: [] }); // 图谱数据
const graphInstance = computed(() => relationGraph$.value?.getInstance()); // 图谱实例
const nodeHighLight = ref(props.highLight); // 是否高亮节点

// 图谱配置与 option 合并
const { layouts, ...withoutLayouts } = props?.graph;
if (props.graph) Object.assign(options.value, withoutLayouts);
if (layouts?.length > 0) Object.assign(options.value.layouts[0], layouts[0]);

watch(
  () => props.highLight,
  val => {
    nodeHighLight.value = val;
  }
);

const { ROOT_NAME, resetPosition, setRootNode, showNodeRelationShip, processGraphData, onCanvasClick, replyLine, focusOnNode } =
  useGraph(jsonData, graphInstance, props.labelName, props.childrenName, nodeHighLight, originalLine);

// 监听外部数据变化，重新渲染图谱
watch(
  () => props.treeData,
  val => renderGraph(val),
  { deep: true }
);

// 渲染图谱
const renderGraph = val => {
  jsonData.value.nodes = [];
  jsonData.value.lines = [];
  setRootNode(val);
  processGraphData(val);
  resetPosition();
};

onMounted(() => renderGraph(props.treeData));

const showNodeTips = ($event, nodeObject) => {
  const _base_position = graphInstance.value.options.fullscreen ? { x: 0, y: 0 } : graphInstance.value.getBoundingClientRect();
  currentNode.value = nodeObject;
  nodeTipsPosition.value.x = $event.clientX - _base_position.x + 10;
  nodeTipsPosition.value.y = $event.clientY - _base_position.y + 10;
};

const onMouseMove = $event => {
  const node = graphInstance.value.isNode($event.target);
  if (node) {
    showNodeTips($event, node);
    isShowNodeTips.value = true;
    showNodeRelationShip(node);
    return;
  } else {
    onCanvasClick();
  }
  isShowNodeTips.value = false;
};

// 显示 / 隐藏节点菜单
const showNodeMenus = (nodeObject, $event) => {
  isShowNodeTips.value = false;
  currentNode.value = nodeObject;
  showNodeRelationShip(nodeObject);
  graphInstance.value.setCheckedNode(nodeObject.id);
  options.value.checkedNodeId = nodeObject.id;
  // -3的目的是为了在鼠标右键节点的时候，显示菜单的同时，鼠标指针还能在菜单上，防止tip还能显示
  nodeMenuPanelPosition.value.x = $event.clientX - 3;
  nodeMenuPanelPosition.value.y = $event.clientY - 3;
  isShowNodeMenuPanel.value = true;
};

// 节点菜单操作
const doAction = actionName => {
  emit("action", actionName, currentNode.value?.data);
  isShowNodeMenuPanel.value = false;
};

// 节点点击事件
const onNodeClick = nodeObject => {
  currentNode.value = nodeObject;
  showNodeRelationShip(nodeObject);
};

/* 连线点击事件 */
const onLineClick = (lineObject, linkObject) => {
  originalLine.value = { from: lineObject.from, to: lineObject.to };
  graphInstance.value.setEditingLine(lineObject, linkObject);
};

const beforeCreateLine = (rgActionParams, setEventReturnValue) => {
  const { fromNode, toNode } = rgActionParams;
  if (!props.enableCrossParents) {
    if (fromNode.text !== originalLine.value.from) {
      setEventReturnValue(true);
      replyLine();
      return ElNotification({ title: "警告", message: "禁止跨父节点连线", type: "warning" });
    }
  }
  jsonData.value.lines.map((item, index) => {
    if (item?.to === fromNode?.text) {
      delete jsonData.value.lines[index];
      const newLine = { from: toNode.text, to: fromNode.text };
      jsonData.value.lines.unshift(newLine);
      return;
    }
    if (item[props.childrenName] && item[props.childrenName].length > 0) beforeCreateLine(rgActionParams);
  });
};

defineExpose({
  jsonData: jsonData.value,
  focusOnNode
});
</script>

<style lang="scss" scoped>
::v-deep(.graph-box-main) {
  .rel-map {
    background-color: var(--el-bg-color);
  }
}
</style>
