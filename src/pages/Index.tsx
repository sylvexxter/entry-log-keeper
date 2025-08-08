
import React from "react";
import SubmissionForm from "@/components/SubmissionForm";
import SubmissionTable from "@/components/SubmissionTable";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const queryClient = useQueryClient();

  const handleSubmitted = () => {
    console.log("Invalidating submissions query after insert");
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Simple Submission Page</h1>
        <p className="text-muted-foreground mt-2">
          Enter text below and see it appear in the table with a timestamp.
        </p>

        <div className="mt-6">
          <SubmissionForm onSubmitted={handleSubmitted} />
        </div>

        <div className="mt-8">
          <SubmissionTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
