import { useEffect, useRef } from "react";

export function MMFJobWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    // Load the ADP recruitment script
    const script = document.createElement("script");
    script.src = "https://workforcenow.adp.com/mascsr/default/mdf/recwebcomponents/recruitment/main-config/recruitment.js";
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-card rounded-xl border border-border p-6">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
        MMF & Affiliates Job Openings
      </h2>
      <p className="text-muted-foreground mb-6">
        Current openings at the Manitoba Métis Federation and affiliated organizations.
      </p>
      <div 
        className="min-h-[400px]"
        dangerouslySetInnerHTML={{
          __html: `
            <recruitment-current-openings 
              cid="ca0617c6-6df8-4bbf-a08c-f93c43be1616" 
              ccid="9201516486785_3" 
              host="DP" 
              locale="en_CA" 
              env="DP" 
              width="w-full" 
              class="hydrated">
            </recruitment-current-openings>
          `
        }}
      />
    </div>
  );
}
