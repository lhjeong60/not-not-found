export async function captureCurrentPage(): Promise<{ html: string; title: string }> {
  const title = document.title;

  // Clone the document to avoid modifying the live page
  const clone = document.documentElement.cloneNode(true) as HTMLElement;

  // Inline stylesheets
  const links = clone.querySelectorAll('link[rel="stylesheet"]');
  for (const link of Array.from(links)) {
    const href = (link as HTMLLinkElement).href;
    if (!href) continue;
    try {
      const res = await fetch(href);
      const css = await res.text();
      const style = document.createElement('style');
      style.textContent = css;
      link.parentNode?.replaceChild(style, link);
    } catch {
      // Keep original link if fetch fails
    }
  }

  // Inline images as base64
  const images = clone.querySelectorAll('img[src]');
  for (const img of Array.from(images)) {
    const src = (img as HTMLImageElement).src;
    if (!src || src.startsWith('data:')) continue;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      (img as HTMLImageElement).src = dataUrl;
    } catch {
      // Keep original src if fetch fails
    }
  }

  const html = `<!DOCTYPE html>\n${clone.outerHTML}`;
  return { html, title };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
