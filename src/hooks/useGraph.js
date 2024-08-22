import { computed } from "vue";

export const useGraph = (jsonData, graphInstance, labelName, childrenName, highLight, originalLine) => {
  const ROOT_NAME = "表格"; // 根节点名称
  const LINE_DEFAULT_COLOR = "#b28a60"; // 默认连线颜色
  const opacity = 0.2;

  // 获取完数据直接渲染会出现大部分节点超出边界，引入计算节点数量，延迟渲染
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
        to: labelName.split(".").reduce((acc, part) => acc && acc[part], item)
      });
    });
  };

  // 与 { nodeObject } 直接相关连的 *节点* 和 *连线* 高亮
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
    if (highLight.value) {
      const clickedNodeChildrenNodes = graphInstance.value.getNodes();
      if (highLight.value) clickedNodeChildrenNodes.every(node => (node.opacity = opacity));
      clickedNodeChildrenLines
        .filter(link => link.fromNode !== nodeObject && link.toNode !== nodeObject)
        .forEach(link => {
          link.relations.forEach(line => {
            line.opacity = opacity;
          });
        });
      clickedNodeChildrenNodes.forEach(node => {
        if (hasRelationShipNodes.has(node.id)) node.opacity = 1;
        else node.opacity = opacity;
      });
    }
  };

  // 处理图谱数据
  const processGraphData = data => {
    data?.map(item => {
      // 节点数据
      jsonData.value.nodes.push({
        id: labelName.split(".").reduce((acc, part) => acc && acc[part], item),
        text: labelName.split(".").reduce((acc, part) => acc && acc[part], item),
        data: item
      });
      if (item?.[childrenName] && item?.[childrenName].length > 0) {
        item?.[childrenName].map(child => {
          jsonData.value.lines.push({
            from: labelName.split(".").reduce((acc, part) => acc && acc[part], item),
            to: labelName.split(".").reduce((acc, part) => acc && acc[part], child)
          });
        });
        processGraphData(item?.[childrenName]);
      }
    });
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

  const focusOnNode = node => graphInstance.value.focusNodeById(node);

  return {
    ROOT_NAME,
    time,
    resetPosition,
    setRootNode,
    showNodeRelationShip,
    processGraphData,
    onCanvasClick,
    replyLine,
    focusOnNode
  };
};
