/** Renders funnel HTML inside an isolated iframe so pasted page styles cannot break the site layout. */
export function CaseStudyFunnel({ html }: { html: string }) {
  const trimmed = html.trim();
  if (!trimmed) return null;

  const iframeOnly = /^<iframe[\s>]/i.test(trimmed);
  const srcDoc = trimmed.includes("<html")
    ? trimmed
    : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0;padding:0;overflow-x:hidden;width:100%;}</style></head><body>${trimmed}</body></html>`;

  if (iframeOnly) {
    return (
      <div
        className="funnel-embed funnel-embed--iframe-only"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return (
    <iframe
      title="Funnel preview"
      srcDoc={srcDoc}
      className="case-study-funnel-frame"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      loading="lazy"
    />
  );
}
