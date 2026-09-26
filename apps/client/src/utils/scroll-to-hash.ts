/** 尚未出现的目标元素的监听器；同一时刻至多一个，新的滚动请求会取代旧的（无效 hash 会残留这 1 个，下次滚动时回收） */
let pending: MutationObserver | undefined;

/**
 * 滚动到 hash 对应的目标元素
 *
 * 目标内容可能异步渲染（如 locale MDX 分包），元素不存在时监听 DOM 变化，出现后立即滚动
 */
export function scrollToHash(hash: string, options?: ScrollIntoViewOptions): void {
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // 保留原值
  }

  pending?.disconnect();

  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView(options);
    return;
  }

  const observer = new MutationObserver(() => {
    const el = document.getElementById(id);
    if (!el) return;
    observer.disconnect();
    el.scrollIntoView(options);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  pending = observer;
}
