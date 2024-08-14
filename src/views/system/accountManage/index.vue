<template>
  <div class="card content-box">
    <span class="text"> 账号管理（待完善） 🍓🍇🍈🍉</span>
    <div>
      <h1>User List</h1>
      <input v-model="newUser" placeholder="Enter user name" />
      <button @click="addUser">Add User</button>
      <ul>
        <li v-for="user in users" :key="user.id">{{ user.name }} <button @click="deleteUser(user.id)">Delete</button></li>
      </ul>
    </div>
  </div>
</template>

<script name="accountManage">
import { socket } from "@/utils/socket"; // 引入工具
import { onBeforeUnmount, onMounted, ref } from "vue";

export default {
  setup() {
    const users = ref([]);
    const newUser = ref("");

    const fetchUsers = async () => {
      // 此处可以调用 API 获取用户列表，示例中省略
      // users.value = await fetchUsersFromApi();
      await fetch("http://localhost:8090/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => {
        console.log({ res });
        users.value = res;
      });
    };

    const addUser = async () => {
      // 假设您有 API 来添加用户
      await fetch("http://localhost:8090/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUser.value })
      });
      newUser.value = "";
    };

    const deleteUser = async id => {
      await fetch(`http://localhost:8090/users/${id}`, { method: "DELETE" });
    };

    const onListeningUserUpdate = () => {
      socket.on("user-update", data => {
        console.log("用户socket消息:", data);
        users.value = data;
      });
    };

    onMounted(() => {
      fetchUsers(); // 首次先加载一次数据

      onListeningUserUpdate(); // 监听广播
    });

    onBeforeUnmount(() => {
      // 卸载监听，因为有keep-alive，因此需要关闭标签页才能真正卸载
      socket.off("user-update");
    });

    return {
      users,
      newUser,
      addUser,
      deleteUser
    };
  }
};
</script>
