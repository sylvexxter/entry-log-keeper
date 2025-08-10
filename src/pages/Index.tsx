
import React from "react";
import SubmissionForm from "@/components/SubmissionForm";
import SubmissionTable from "@/components/SubmissionTable";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const queryClient = useQueryClient();
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const handleSubmitted = () => {
    console.log("Invalidating submissions query after insert");
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Simple Submission Page</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <Button size="sm" onClick={signInWithGoogle} disabled={loading}>Sign in with Google</Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Enter text below and see it appear in the table with a timestamp.
        </p>

        <div className="mt-6">
          {user ? (
            <SubmissionForm onSubmitted={handleSubmitted} />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Sign in with Google to submit new text.</p>
              <Button onClick={signInWithGoogle} size="sm" disabled={loading}>Sign in</Button>
            </div>
          )}
        </div>

        <div className="mt-8">
          <SubmissionTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
