<template>
  <van-field v-model="account" label="账号"></van-field>
  <van-field v-model="password" label="密码"></van-field>
  <van-button @click="handleLoginClick">登录</van-button>

  <van-field v-model="userId" label="要查询的用户的ID"></van-field>
  <van-button :loading="isFetching" @click="handleRefreshClick">刷新</van-button>
  姓名：{{ error ? "请求失败" : profileData?.name }}
</template>

<script setup lang="ts">
import { useMutation, useQuery } from "@tanstack/vue-query";
import { RequestError } from "shared";
import { showNotify } from "vant";
import { ref } from "vue";

import { ADMIN_QUERY_KEY } from "@/configs";
import { walkAdminService } from "@/utils";

// mutate类请求，如登录登出、修改数据等
// https://tanstack.com.cn/query/latest/docs/framework/react/guides/mutations
// useMutation返回值里的mutate是发起请求用的函数
// 这类请求的特点是发起时机通常由用户决定，比如用户点击按钮时触发
/** 账号 */
const account = ref("");
/** 密码 */
const password = ref("");
// 登录（示例）（这里不用写jsdoc /** */，没效果）
const { mutate: mutateLogin } = useMutation({
  mutationFn: () =>
    walkAdminService.LoginExample({
      // 这个大括号就是请求参数。是body json还是query params取决于接口的定义（LoginExample）里面是data还是params
      account: account.value,
      password: password.value
    }),
  onSuccess: (data) => {
    // data就是后端返回的响应体中的data（注意，响应体中的code和msg这里是访问不到的）
    showNotify({ type: "success", message: "登录成功" });
    if (data.user_type === "sudo") {
      // ......
    }
  },
  onError: (err) => {
    // 这是请求失败的情况
    // 如果HTTP失败，err.code就是HTTP状态码，如404
    // 如果HTTP成功，但响应体中的code不是200，也属于失败。此时err.message就是响应体中的msg，err.code就是响应体中的code
    showNotify({ type: "danger", message: err.message || "登录失败" });
    console.error(err.message);
    if (err instanceof RequestError) {
      // 使用err.code需要先判断err instanceof RequestError，否则TS会认为err不一定有code这个成员
      console.error(err.code);
    }
  }
});
/** 点击登录按钮（示例） */
const handleLoginClick = mutateLogin;

// query类请求，如获取列表、查询信息等
// https://tanstack.com.cn/query/latest/docs/framework/react/guides/query-functions
// useQuery返回值里的data是从后端返回的响应体中的data，拿到返回之前默认是undefined; error是失败时的错误，同上;
// isFetching可以得知请求是否正在进行中，可以用来设置加载态等
// 这类请求自动发起。queryKey数组中任意响应式变量变化时，都会自动重发请求，更新数据; 返回值里的refetch也可以手动重发请求
/** 要获取的用户的ID */
const userId = ref("");
// 获取用户信息（示例）
const {
  data: profileData,
  error,
  isFetching,
  refetch
} = useQuery({
  // queryKey相当于依赖项列表。第一个元素在ADMIN_QUERY_KEY中进行定义
  // 从第二个元素开始应当使用响应式变量，而非响应式变量的当前值，例如此处不可以写userId.value
  // queryKey中的元素变化时，请求将会自动重发
  // https://tanstack.com.cn/query/latest/docs/framework/react/guides/query-keys
  queryKey: [ADMIN_QUERY_KEY.USER.INFO, userId] as const,
  queryFn: ({ queryKey }) =>
    walkAdminService.QueryProfileExample({
      // 这里是请求参数，同上
      // 如果某个请求参数的响应式变量在queryKey里出现过，直接使用queryKey[n]来指定该参数，以确保发给后端的值与触发更新的值是一致的
      user_id: queryKey[1] /* eslint-disable-line camelcase*/
    })
});
/** 手动刷新用户信息（示例） */
const handleRefreshClick = refetch;
</script>
