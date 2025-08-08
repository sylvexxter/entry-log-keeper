
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SubmissionFormProps = {
  onSubmitted?: () => void;
};

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmitted }) => {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = value.trim();
    if (!content) {
      toast({ title: "Please enter some text before submitting." });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("submissions").insert({ content });
    setIsSubmitting(false);

    if (error) {
      console.error("Insert error:", error);
      toast({ title: "Something went wrong", description: error.message });
      return;
    }

    setValue("");
    toast({ title: "Submitted!" });
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="Type something..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting} className="shrink-0">
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};

export default SubmissionForm;
