import { defineStore } from "pinia";

export const useKeepAliveStore = defineStore({
  id: "geeker-keepAlive",
  state: () => ({
    keepAliveName: []
  }),
  actions: {
    // Add KeepAliveName
    async addKeepAliveName(name) {
      !this.keepAliveName.includes(name) && this.keepAliveName.push(name);
    },
    // Remove KeepAliveName
    async removeKeepAliveName(name) {
      this.keepAliveName = this.keepAliveName.filter(item => item !== name);
    },
    // Set KeepAliveName
    async setKeepAliveName(keepAliveName) {
      this.keepAliveName = keepAliveName;
    }
  }
});
