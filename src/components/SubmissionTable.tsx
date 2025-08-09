
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { format } from "date-fns";
import { importSPKI, jwtVerify, type KeyLike } from "jose";

type Submission = {
  id: string;
  content: string;
  created_at: string;
};

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEcq937rbYJj70wz5zgSbvRvzucPId\ngPAt2ka8F9Rs/QRdhl4WyjxTvjx5pHWMLI218xzfsG/BOGQr5cSZZAApnw==\n-----END PUBLIC KEY-----`;

const fetchSubmissions = async (): Promise<Submission[]> => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Fetch error:", error);
    throw error;
  }
  return data ?? [];
};

const SubmissionTable: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions"],
    queryFn: fetchSubmissions,
  });

  // Import the ES256 public key once
  const [publicKey, setPublicKey] = React.useState<KeyLike | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const key = await importSPKI(PUBLIC_KEY_PEM, "ES256");
        setPublicKey(key);
      } catch (e) {
        console.error("Public key import error:", e);
      }
    })();
  }, []);

  // Compute which rows contain a valid ES256-signed JWT
  const [verifiedIds, setVerifiedIds] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    if (!data || !publicKey) {
      setVerifiedIds(new Set());
      return;
    }

    const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

    (async () => {
      const results = await Promise.all(
        data.map(async (item) => {
          if (!jwtRegex.test(item.content)) return { id: item.id, verified: false };
          try {
            await jwtVerify(item.content, publicKey, { algorithms: ["ES256"] });
            return { id: item.id, verified: true };
          } catch {
            return { id: item.id, verified: false };
          }
        })
      );
      setVerifiedIds(new Set(results.filter((r) => r.verified).map((r) => r.id)));
    })();
  }, [data, publicKey]);

  if (error) {
    return (
      <div className="text-destructive text-sm">
        Failed to load submissions.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption className="text-muted-foreground">
          {isLoading ? "Loading submissions..." : "Latest submissions"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Text</TableHead>
            <TableHead>Submitted at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-sm text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : (data?.length ?? 0) === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-sm text-muted-foreground">
                No submissions yet.
              </TableCell>
            </TableRow>
          ) : (
            data!.map((item) => (
              <TableRow key={item.id} className={verifiedIds.has(item.id) ? "bg-destructive/10" : undefined}>
                <TableCell className="align-top break-words max-w-[0]">
                  {item.content}
                </TableCell>
                <TableCell className="whitespace-nowrap align-top">
                  {format(new Date(item.created_at), "PPpp")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionTable;
