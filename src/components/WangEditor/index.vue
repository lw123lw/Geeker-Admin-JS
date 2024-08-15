<template>
  <div :class="['editor-box', self_disabled ? 'editor-disabled' : '']">
    <Toolbar v-if="!hideToolBar" class="editor-toolbar" :editor="editorRef" :default-config="toolbarConfig" :mode="mode" />
    <Editor
      v-model="valueHtml"
      class="editor-content"
      :style="{ height }"
      :mode="mode"
      :default-config="computedEditorConfig"
      @on-created="handleCreated"
      @on-blur="handleBlur"
    />
  </div>
</template>

<script setup name="WangEditor">
import { nextTick, computed, inject, shallowRef, onBeforeUnmount } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { uploadImg, uploadVideo } from "@/api/modules/upload";
import "@wangeditor/editor/dist/css/style.css";
import { formContextKey, formItemContextKey } from "element-plus";

// 富文本 DOM 元素
const editorRef = shallowRef();

// 实列化编辑器
const handleCreated = editor => {
  editorRef.value = editor;
};
const emit = defineEmits(["update:value"]);
const props = defineProps({
  toolbarConfig: {
    type: Object,
    default: () => {}
  },
  editorConfig: {
    type: Object,
    default: () => ({
      placeholder: "请输入内容...",
      MENU_CONF: { uploadImg: null, uploadVideo: null }
    })
  },
  height: {
    type: String,
    default: () => "500px"
  },
  mode: {
    type: String,
    default: () => "default"
  },
  hideToolBar: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0);
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0);
// 判断是否禁用上传和删除
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled;
});

// 判断当前富文本编辑器是否禁用
if (self_disabled.value) nextTick(() => editorRef.value.disable());

// 富文本的内容监听，触发父组件改变，实现双向数据绑定
const valueHtml = computed({
  get() {
    return props.value;
  },
  set(val) {
    // 防止富文本内容为空时，校验失败
    if (editorRef.value.isEmpty()) val = "";
    emit("update:value", val);
  }
});

/**
 * @description 图片自定义上传
 * @param file 上传的文件
 * @param insertFn 上传成功后的回调函数（插入到富文本编辑器中）
 * */
// props.editorConfig.MENU_CONF.uploadImage = {
//   async customUpload(file, insertFn) {
//     if (!uploadImgValidate(file)) return;
//     let formData = new FormData();
//     formData.append("file", file);
//     try {
//       const { data } = await uploadImg(formData);
//       insertFn(data.fileUrl);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// };

// 图片上传前判断
const uploadImgValidate = file => {
  console.log(file);
  return true;
};

const computedEditorConfig = computed(() => {
  return {
    ...props.editorConfig,
    MENU_CONF: {
      ...props.editorConfig.MENU_CONF,
      uploadImage: {
        async customUpload(file, insertFn) {
          if (!uploadImgValidate(file)) return;
          let formData = new FormData();
          formData.append("file", file);
          try {
            const { data } = await uploadImg(formData);
            insertFn(data.fileUrl);
          } catch (error) {
            console.log(error);
          }
        }
      },
      uploadVideo: {
        async customUpload(file, insertFn) {
          if (!uploadVideoValidate(file)) return;
          let formData = new FormData();
          formData.append("file", file);
          try {
            const { data } = await uploadVideo(formData);
            insertFn(data.fileUrl);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  };
});

/**
 * @description 视频自定义上传
 * @param file 上传的文件
 * @param insertFn 上传成功后的回调函数（插入到富文本编辑器中）
 * */
// props.editorConfig.MENU_CONF.uploadVideo = {
//   async customUpload(file, insertFn) {
//     if (!uploadVideoValidate(file)) return;
//     let formData = new FormData();
//     formData.append("file", file);
//     try {
//       const { data } = await uploadVideo(formData);
//       insertFn(data.fileUrl);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// };

// 视频上传前判断
const uploadVideoValidate = file => {
  console.log(file);
  return true;
};

// 编辑框失去焦点时触发
const handleBlur = () => {
  formItemContext?.prop && formContext?.validateField([formItemContext.prop]);
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  if (!editorRef.value) return;
  editorRef.value.destroy();
});

defineExpose({
  editor: editorRef
});
</script>

<style scoped lang="scss">
@import "./index";
</style>
