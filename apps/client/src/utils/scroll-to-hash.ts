/**
 * 滚动到 hash 对应的目标元素
 *
 * 目标内容可能异步渲染（如 MDX 分包加载、路由懒加载），元素不存在时轮询等待
 */
export function scrollToHash(hash: string, options?: ScrollIntoViewOptions): void {
  let attempts = 0;
  const tryScroll = () => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView(options);
    else if (++attempts <= 3) setTimeout(tryScroll, 200);
  };
  tryScroll();
}
