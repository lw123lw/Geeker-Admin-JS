<template>
  <div class="card content-box">
    <span class="text"> 角色管理（待完善） 🍓🍇🍈🍉</span>
    <div>
      <h1>Order List</h1>
      <input v-model="newOrderItem" placeholder="Enter order item" />
      <input v-model="userId" type="number" placeholder="Enter user ID" />
      <button @click="addOrder">Add Order</button>
      <ul>
        <li v-for="order in orders" :key="order.id">
          {{ order.item }} (User ID: {{ order.userId }}) <button @click="deleteOrder(order.id)">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script name="roleManage">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { socket } from "@/utils/socket";

export default {
  setup() {
    const orders = ref([]);
    const newOrderItem = ref("");
    const userId = ref(null);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fetchOrders = async () => {
      await fetch("http://localhost:8090/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => {
        console.log({ res });
        orders.value = res;
      });
    };

    const addOrder = async () => {
      // 假设您有 API 来添加订单
      await fetch("http://localhost:8090/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: newOrderItem.value, userId: userId.value })
      });
      newOrderItem.value = "";
      userId.value = null;
    };

    const deleteOrder = async id => {
      await fetch(`http://localhost:8090/orders/${id}`, { method: "DELETE" });
    };

    // 监听订单变化
    const onListeningOrderUpdate = () => {
      socket.on("order-update", data => {
        console.log("订单socket消息:", { data });
        orders.value = data;
      });
    };

    onMounted(() => {
      fetchOrders();
      onListeningOrderUpdate();
    });

    onBeforeUnmount(() => {
      socket.off("order-update");
    });

    return {
      orders,
      newOrderItem,
      userId,
      addOrder,
      deleteOrder
    };
  }
};
</script>
