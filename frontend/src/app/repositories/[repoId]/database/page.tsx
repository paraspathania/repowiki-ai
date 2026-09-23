"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { DatabaseErdViewer } from "@/components/database/DatabaseErdViewer";
import { DatabaseTable } from "@/types";
import { Database, Loader2 } from "lucide-react";

export default function DatabasePage({ params }: { params: { repoId: string } }) {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient
      .get(`/repositories/${params.repoId}/database`)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === 202) {
          setStatusMsg(res.data?.message || "Analysis is currently processing...");
          setTables([]);
        } else {
          const rawTables = res.data?.tables || [];
          const formatted: DatabaseTable[] = rawTables.map((t: any) => ({
            name: t.name,
            description: t.source_file
              ? `Defined in ${t.source_file}`
              : "Auto-detected relational database entity",
            columns: (t.columns || []).map((c: any) => ({
              name: c.name,
              type: c.data_type,
              isPrimary: c.is_primary_key,
              isNullable: c.is_nullable,
              isForeign: c.is_foreign_key,
              references: c.references_table
                ? `${c.references_table}.${c.references_column || "id"}`
                : undefined,
            })),
            indexes: [],
          }));
          setTables(formatted);
          setStatusMsg(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatusMsg("Failed to load database schema.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-mono">Extracting database models & ERD schema...</span>
        </div>
      ) : tables.length > 0 ? (
        <DatabaseErdViewer tables={tables} />
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border border-white/[0.08] rounded-2xl bg-[#090b12] text-center max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No Database Models Detected</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
            {statusMsg ||
              "No database schema files or ORM models were detected. We automatically parse SQLAlchemy models, SQL DDL migrations, and Prisma schemas."}
          </p>
        </div>
      )}
    </div>
  );
}
