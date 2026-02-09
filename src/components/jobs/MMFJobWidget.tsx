import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export function MMFJobWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Build the sandboxed HTML that loads the ADP widget in isolation
  const iframeContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <recruitment-current-openings 
    cid="ca0617c6-6df8-4bbf-a08c-f93c43be1616" 
    ccid="9201516486785_3" 
    host="DP" 
    locale="en_CA" 
    env="DP" 
    width="w-full" 
    class="hydrated">
  </recruitment-current-openings>
  <script src="https://workforcenow.adp.com/mascsr/default/mdf/recwebcomponents/recruitment/main-config/recruitment.js" async></script>
</body>
</html>
  `.trim();

  const iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(iframeContent)}`;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
        MMF &amp; Affiliates Job Openings
      </h2>
      <p className="text-muted-foreground mb-6">
        Current openings at the Manitoba Métis Federation and affiliated organizations.
      </p>
      <div className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          sandbox="allow-scripts allow-same-origin"
          title="MMF & Affiliates Job Openings"
          className="w-full border-0"
          style={{ minHeight: "400px", height: "600px" }}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
