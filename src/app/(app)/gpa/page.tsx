"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { getGPASummary } from "@/features/gpa";
import { GPASummary } from "@/features/gpa/types";
import { CreateSemesterDialog, SemesterCard } from "@/features/gpa";

export default function GPACalculatorPage() {
  const [gpaSummary, setGpaSummary] = useState<GPASummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGPASummary = async () => {
    setLoading(true);
    try {
      const summary = await getGPASummary();
      setGpaSummary(summary);
    } catch (error) {
      console.error("Failed to load GPA summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGPASummary();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-12">Loading GPA data...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">GPA Calculator</h1>
          <p className="text-muted-foreground">
            Track your academic performance semester by semester
          </p>
        </div>
        <CreateSemesterDialog onSemesterCreated={loadGPASummary} />
      </div>

      {/* CGPA Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Cumulative GPA</p>
            <p className="text-3xl font-bold">
              {gpaSummary?.cgpa.toFixed(2) || "0.00"}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-3xl font-bold">
              {gpaSummary?.earned_credits || 0}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Semesters</p>
            <p className="text-3xl font-bold">
              {gpaSummary?.semesters.length || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Semesters List */}
      <div className="space-y-4">
        {!gpaSummary || gpaSummary.semesters.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No semesters yet</h3>
            <p className="text-muted-foreground">
              Start tracking your GPA by adding your first semester
            </p>
          </Card>
        ) : (
          gpaSummary.semesters.map((semester) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              onUpdate={loadGPASummary}
            />
          ))
        )}
      </div>

      {/* Grade Scale Reference */}
      {gpaSummary && gpaSummary.semesters.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-4">Grade Scale Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-medium">A+:</span> 4.00
            </div>
            <div>
              <span className="font-medium">A:</span> 4.00
            </div>
            <div>
              <span className="font-medium">A-:</span> 3.67
            </div>
            <div>
              <span className="font-medium">B+:</span> 3.33
            </div>
            <div>
              <span className="font-medium">B:</span> 3.00
            </div>
            <div>
              <span className="font-medium">B-:</span> 2.67
            </div>
            <div>
              <span className="font-medium">C+:</span> 2.33
            </div>
            <div>
              <span className="font-medium">C:</span> 2.00
            </div>
            <div>
              <span className="font-medium">C-:</span> 1.67
            </div>
            <div>
              <span className="font-medium">F:</span> 0.00
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
