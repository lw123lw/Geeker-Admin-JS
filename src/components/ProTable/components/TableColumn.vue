<template>
  <RenderTableColumn v-bind="column" />
</template>

<script setup lang="jsx" name="TableColumn">
import { inject, ref, useSlots } from "vue";
import { filterEnum, formatValue, handleProp, handleRowAccordingToProp } from "@/utils";

const props = defineProps({
  column: {
    type: Object,
    default: () => ({})
  }
});

const slots = useSlots();

const enumMap = inject("enumMap", ref(new Map()));

// 渲染表格数据
const renderCellData = (item, scope) => {
  return enumMap.value.get(item.prop) && item.isFilterEnum
    ? filterEnum(handleRowAccordingToProp(scope.row, item.prop), enumMap.value.get(item.prop), item.fieldNames)
    : formatValue(handleRowAccordingToProp(scope.row, item.prop));
};

// 获取 tag 类型
const getTagType = (item, scope) => {
  return (
    filterEnum(handleRowAccordingToProp(scope.row, item.prop), enumMap.value.get(item.prop), item.fieldNames, "tag") || "primary"
  );
};

const RenderTableColumn = item => {
  return (
    <>
      {item.isShow && (
        <el-table-column
          {...item}
          align={item.align ?? "center"}
          showOverflowTooltip={item.showOverflowTooltip ?? item.prop !== "operation"}
        >
          {{
            default: scope => {
              if (item._children) return item._children.map(child => RenderTableColumn(child));
              if (item.render) return item.render(scope);
              if (item.prop && slots[handleProp(item.prop)]) return slots[handleProp(item.prop)](scope);
              if (item.tag) return <el-tag type={getTagType(item, scope)}>{renderCellData(item, scope)}</el-tag>;
              return renderCellData(item, scope);
            },
            header: scope => {
              if (item.headerRender) return item.headerRender(scope);
              if (item.prop && slots[`${handleProp(item.prop)}Header`]) return slots[`${handleProp(item.prop)}Header`](scope);
              return item.label;
            }
          }}
        </el-table-column>
      )}
    </>
  );
};
</script>
