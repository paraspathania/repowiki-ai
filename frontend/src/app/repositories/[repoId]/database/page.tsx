"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { DatabaseErdViewer } from "@/components/database/DatabaseErdViewer";
import { DatabaseTable } from "@/types";

export default function DatabasePage({ params }: { params: { repoId: string } }) {
  const [tables, setTables] = useState<DatabaseTable[]>([]);

  useEffect(() => {
    repoService.getDatabaseSchema(params.repoId).then(setTables);
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      {tables.length > 0 ? (
        <DatabaseErdViewer tables={tables} />
      ) : (
        <div className="text-slate-500 text-xs font-mono p-8">Loading database schema...</div>
      )}
    </div>
  );
}
