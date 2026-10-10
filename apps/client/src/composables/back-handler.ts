import { useRoute, useRouter } from "vue-router";

export function useBackHandler() {
  const route = useRoute();
  const router = useRouter();
  return () => {
    if (router.options.history.state.back) router.back();
    else if (route.matched.length < 2) router.replace("/");
    else {
      const lastSegmentEnd = route.path.lastIndexOf("/");
      router.replace(lastSegmentEnd > 0 ? route.path.slice(0, lastSegmentEnd) : "/");
    }
  };
}
