import { defineStore } from "pinia";
import { KeepAliveState } from "@/stores/interface";

export const useKeepAliveStore = defineStore({
  id: "geeker-keepAlive",
  state: (): KeepAliveState => ({
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
