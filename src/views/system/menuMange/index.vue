<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="菜单列表"
      row-key="path"
      :indent="20"
      :columns="columns"
      :data="menuData"
      :request-auto="false"
      :enable-cross-parents="true"
      label-name="meta.title"
      :show-tip="false"
      @static-data-change="staticDataChange"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus">新增菜单 </el-button>
      </template>
      <!-- 菜单图标 -->
      <template #icon="scope">
        <el-icon :size="18">
          <component :is="scope.row.meta.icon"></component>
        </el-icon>
      </template>
      <!-- 菜单操作 -->
      <template #operation>
        <el-button type="primary" link :icon="EditPen"> 编辑 </el-button>
        <el-button type="primary" link :icon="Delete"> 删除 </el-button>
      </template>
      <template #tip="{ nodeObject }">
        <div>
          菜单名称：<el-text type="primary">{{ nodeObject?.meta?.title }}</el-text>
        </div>
        <div>
          菜单路径：<el-text type="primary">{{ nodeObject?.path }}</el-text>
        </div>
      </template>
      <template #graphPreAction="{ nodeObject }">
        <el-button type="primary" :icon="Right" @click="router.push(nodeObject?.path)">
          前往{{ nodeObject?.meta?.title }}
        </el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup name="menuMange">
import { ref } from "vue";
import { Delete, EditPen, CirclePlus, Right } from "@element-plus/icons-vue";
import authMenuList from "@/assets/json/authMenuList.json";
import ProTable from "@/components/ProTable/index.vue";
import { useRouter } from "vue-router";

const proTable = ref();
const router = useRouter();
const menuData = ref(authMenuList.data);

// 表格配置项
const columns = [
  { prop: "meta.title", label: "菜单名称", align: "left", search: { el: "input", key: "meta.title" } },
  { prop: "meta.icon", label: "菜单图标" },
  { prop: "name", label: "菜单 name", search: { el: "input", key: "name" } },
  { prop: "path", label: "菜单路径", width: 300, search: { el: "input", key: "path" } },
  { prop: "component", label: "组件路径", width: 300 },
  { prop: "operation", label: "操作", width: 250, fixed: "right" }
];

const staticDataChange = data => {
  console.log(data);
  menuData.value = data;
};
</script>
