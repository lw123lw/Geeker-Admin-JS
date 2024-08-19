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
import RelationGraph, { RGEditingConnectController, RGEditingLineController, RGMiniView } from "relation-graph-vue3";
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { ElNotification } from "element-plus";
import graphConfig from "../config/graphConfig.json";

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
const ROOT_NAME = "表格"; // 根节点名称
const LINE_DEFAULT_COLOR = "#b28a60";
const opacity = 0.1;
const options = ref(graphConfig); // 图谱配置
const isShowNodeTips = ref(false); // 是否展示节点提示
const isShowNodeMenuPanel = ref(false); // 是否展示节点菜单
const nodeTipsPosition = ref({ x: 0, y: 0 });
const nodeMenuPanelPosition = ref({ x: 0, y: 0 }); // 节点菜单定位
const currentNode = ref({}); // 当前选择的节点
const originalLine = ref({ from: "", to: "" }); // 被操作的原节点
const jsonData = ref({ rootId: "graph", nodes: [], lines: [] }); // 图谱数据

const graphInstance = computed(() => relationGraph$.value?.getInstance()); // 图谱实例

if (props.graph) Object.assign(options.value, props.graph);

// 监听外部数据变化，重新渲染图谱
watch(
  () => props.treeData,
  () => renderGraph(),
  { deep: true }
);

// 根据节点数量计算定位时间
const time = computed(() => {
  return Math.ceil(jsonData.value?.lines?.length / 20) * 1000;
});

const resetPosition = () => {
  graphInstance.value.setJsonData(jsonData.value);
  setTimeout(async () => {
    graphInstance.value.setZoom(100);
    await graphInstance.value.moveToCenter();
    await graphInstance.value.zoomToFit();
  }, time.value);
};

// 设置跟节点
const setRootNode = data => {
  jsonData.value.nodes.push({ id: ROOT_NAME, text: ROOT_NAME });
  data?.map(item => {
    jsonData.value.lines.push({
      from: ROOT_NAME,
      to: props.labelName.split(".").reduce((acc, part) => acc && acc[part], item)
    });
  });
};

// 处理图谱数据
const processGraphData = data => {
  data?.map(item => {
    // 节点数据
    jsonData.value.nodes.push({
      id: props.labelName.split(".").reduce((acc, part) => acc && acc[part], item),
      text: props.labelName.split(".").reduce((acc, part) => acc && acc[part], item),
      data: item
    });
    if (item?.[props.childrenName] && item?.[props.childrenName].length > 0) {
      item?.[props.childrenName].map(child => {
        jsonData.value.lines.push({
          from: props.labelName.split(".").reduce((acc, part) => acc && acc[part], item),
          to: props.labelName.split(".").reduce((acc, part) => acc && acc[part], child)
        });
      });
      processGraphData(item?.[props.childrenName]);
    }
  });
};

// 渲染图谱
const renderGraph = () => {
  jsonData.value.nodes = [];
  jsonData.value.lines = [];
  setRootNode(props?.treeData);
  processGraphData(props?.treeData);
  resetPosition();
};

onMounted(async () => {
  await renderGraph();
});

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

const showNodeRelationShip = nodeObject => {
  const clickedNodeChildrenLines = graphInstance.value.getLinks();

  clickedNodeChildrenLines.forEach(link => {
    link.relations.forEach(line => {
      line.opacity = 1;
      line.color = LINE_DEFAULT_COLOR;
      line.fontColor = LINE_DEFAULT_COLOR;
      line.lineWidth = line.data.originLineWidth;
    });
  });

  let hasRelationShipNodes = new Set();
  // 让与{nodeObject}相关的所有连线高亮
  clickedNodeChildrenLines
    .filter(link => link.fromNode === nodeObject || link.toNode === nodeObject)
    .forEach(link => {
      link.relations.forEach(line => {
        line.opacity = 1;
        line.color = LINE_DEFAULT_COLOR;
        line.fontColor = LINE_DEFAULT_COLOR;
        line.lineWidth = 3;
      });
      hasRelationShipNodes.add(link.fromNode.id);
      hasRelationShipNodes.add(link.toNode.id);
    });

  if (props.highLight) {
    const clickedNodeChildrenNodes = graphInstance.value.getNodes();
    if (props.highLight) clickedNodeChildrenNodes.every(node => (node.opacity = opacity));
    clickedNodeChildrenLines
      .filter(link => link.fromNode !== nodeObject && link.toNode !== nodeObject)
      .forEach(link => {
        link.relations.forEach(line => {
          line.opacity = opacity;
        });
      });
    clickedNodeChildrenNodes.forEach(node => {
      if (hasRelationShipNodes.has(node.id)) {
        node.opacity = 1;
      } else {
        node.opacity = opacity;
      }
    });
  }
};

// 显示 / 隐藏节点菜单
const showNodeMenus = (nodeObject, $event) => {
  isShowNodeTips.value = false;
  currentNode.value = nodeObject;
  showNodeRelationShip(nodeObject);
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

const onCanvasClick = () => {
  graphInstance.value.getLinks().forEach(link => {
    link.relations.forEach(line => {
      line.opacity = 1;
      line.color = LINE_DEFAULT_COLOR;
      line.fontColor = LINE_DEFAULT_COLOR;
      line.lineWidth = line.data.originLineWidth;
    });
  });
  graphInstance.value.getNodes().forEach(node => (node.opacity = 1));
};

// 恢复线条
const replyLine = () => graphInstance.value.addLines([originalLine.value]);

const beforeCreateLine = (rgActionParams, setEventReturnValue) => {
  const fromNode = rgActionParams.fromNode;
  const toNode = rgActionParams.toNode;

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

const focusOnNode = node => graphInstance.value.focusNodeById(node);

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
.graph {
  width: 100%;
  height: 100%;
  &-box {
    width: 100%;
    height: 100%;
    border: var(--el-border-color) solid 1px;
  }
  .rc-menu {
    position: absolute;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background-color: #ffffff;
    border: #eeeeee solid 1px;
    border-radius: 10px;
    box-shadow: 0 0 8px #cccccc;
    .node-menu-item {
      padding: 0 10px;
      font-size: 14px;
      line-height: 30px;
      color: #444444;
      cursor: pointer;
      border-top: #efefef solid 1px;
    }
    .node-menu-item:hover {
      background-color: rgb(66 187 66 / 20%);
    }
  }
}
.line-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 23px;
  font-weight: bold;
  line-height: 24px;
}
.c-tips {
  position: absolute;
  z-index: 999;
  width: auto;
  padding: 10px;
  color: #ffffff;
  background-color: #444444;
  border: #eeeeee solid 1px;
  border-radius: 10px;
  box-shadow: 0 0 8px #cccccc;
  & > div {
    padding-left: 10px;
    font-size: 12px;
    line-height: 25px;
  }
}
</style>
