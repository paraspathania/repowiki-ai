"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { ApiEndpointExplorer } from "@/components/apis/ApiEndpointExplorer";
import { ApiEndpoint } from "@/types";

export default function ApisPage({ params }: { params: { repoId: string } }) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);

  useEffect(() => {
    repoService.getApiEndpoints(params.repoId).then(setEndpoints);
  }, [params.repoId]);

  return (
    <div className="h-full overflow-hidden p-6 bg-[#07090e]">
      {endpoints.length > 0 ? (
        <ApiEndpointExplorer endpoints={endpoints} />
      ) : (
        <div className="text-slate-500 text-xs font-mono p-8">Loading API documentation...</div>
      )}
    </div>
  );
}
