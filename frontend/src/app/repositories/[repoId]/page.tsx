import { redirect } from "next/navigation";

export default function RepositoryRootPage({ params }: { params: { repoId: string } }) {
  redirect(`/repositories/${params.repoId}/overview`);
}
