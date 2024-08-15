import { reactive, computed, toRefs, ref } from "vue";

/**
 * @description table 页面操作方法封装
 * @param {Function} api 获取表格数据 api 方法 (必传)
 * @param {Object} initParam 获取数据初始化参数 (非必传，默认为{})
 * @param {Boolean} isPageable 是否有分页 (非必传，默认为true)
 * @param {Function} dataCallBack 对后台返回的数据进行处理的方法 (非必传)
 * @param requestError
 * */
export const useTable = (api, initParam = {}, isPageable = true, dataCallBack = null, requestError) => {
  const state = ref({
    // 表格数据
    tableData: [],
    // 分页数据
    pageable: {
      // 当前页数
      pageNum: 1,
      // 每页显示条数
      pageSize: 10,
      // 总条数
      total: 0
    },
    // 查询参数(只包括查询)
    searchParam: {},
    // 初始化默认的查询参数
    searchInitParam: {},
    // 总参数(包含分页和查询参数)
    totalParam: {}
  });

  // 数据是否为树形结构
  const isTreeData = ref(false);

  /**
   * @description 分页查询参数(只包括分页和表格字段排序,其他排序方式可自行配置)
   * */
  const pageParam = computed({
    get: () => {
      return {
        pageNum: state.value.pageable.pageNum,
        pageSize: state.value.pageable.pageSize
      };
    },
    set: newVal => {
      console.log("我是分页更新之后的值", newVal);
    }
  });

  /**
   * @description 获取表格数据
   * @return void
   * */
  const getTableList = async () => {
    if (!api) return;
    try {
      // 先把初始化参数和分页参数放到总参数里面
      Object.assign(state.value.totalParam, initParam, isPageable ? pageParam.value : {});
      let res = await api({ ...state.value.searchInitParam, ...state.value.totalParam });
      state.value.tableData = isPageable ? res.data.list : res.data;
      // 解构后台返回的分页数据 (如果有分页更新分页信息)
      if (isPageable) state.value.pageable.total = res.data.total;
      // 简单判断data是否树结构
      if (res.data.list.find(item => item?.children || item?.child || item?._children)) isTreeData.value = true;
    } catch (error) {
      console.log({ error });
      requestError && requestError(error);
    }
  };

  /**
   * @description 更新查询参数
   * @return void
   * */
  const updatedTotalParam = () => {
    state.value.totalParam = {};
    // 处理查询参数，可以给查询参数加自定义前缀操作
    let nowSearchParam = {};
    // 防止手动清空输入框携带参数（这里可以自定义查询参数前缀）
    for (let key in state.value.searchParam) {
      // 某些情况下参数为 false/0 也应该携带参数
      if (state.value.searchParam[key] || state.value.searchParam[key] === false || state.value.searchParam[key] === 0) {
        nowSearchParam[key] = state.value.searchParam[key];
      }
    }
    Object.assign(state.value.totalParam, nowSearchParam);
  };

  /**
   * @description 表格数据查询
   * @return void
   * */
  const search = () => {
    state.value.pageable.pageNum = 1;
    updatedTotalParam();
    getTableList();
  };

  /**
   * @description 表格数据重置
   * @return void
   * */
  const reset = () => {
    state.value.pageable.pageNum = 1;
    // 重置搜索表单的时，如果有默认搜索参数，则重置默认的搜索参数
    state.value.searchParam = { ...state.value.searchInitParam };
    updatedTotalParam();
    getTableList();
  };

  /**
   * @description 每页条数改变
   * @param {Number} val 当前条数
   * @return void
   * */
  const handleSizeChange = val => {
    state.value.pageable.pageNum = 1;
    state.value.pageable.pageSize = val;
    getTableList();
  };

  /**
   * @description 当前页改变
   * @param {Number} val 当前页
   * @return void
   * */
  const handleCurrentChange = val => {
    state.value.pageable.pageNum = val;
    getTableList();
  };

  return {
    ...toRefs(state.value),
    isTreeData,
    getTableList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange,
    updatedTotalParam
  };
};
