
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

type Submission = {
  id: string;
  content: string;
  created_at: string;
};

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
              <TableRow key={item.id}>
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
