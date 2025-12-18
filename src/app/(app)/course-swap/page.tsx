"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSwapRequests,
  getMySwapRequests,
  CreateSwapRequestDialog,
  SwapRequestCard,
} from "@/features/course-swap";
import { SwapRequestWithMatch, SwapRequest } from "@/features/course-swap/types";
import { Search, Filter } from "lucide-react";
import { useAuth } from "@/features/auth/components";

export default function CourseSwapPage() {
  const { clientSession } = useAuth();
  const [allRequests, setAllRequests] = useState<SwapRequestWithMatch[]>([]);
  const [myRequests, setMyRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course_code: "",
    semester: "",
    instructor: "",
  });

  const loadAllRequests = async () => {
    setLoading(true);
    try {
      const requests = await getSwapRequests({
        course_code: filters.course_code || undefined,
        semester: filters.semester || undefined,
        instructor: filters.instructor || undefined,
      });
      setAllRequests(requests);
    } catch (error) {
      console.error("Failed to load swap requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const requests = await getMySwapRequests();
      setMyRequests(requests);
    } catch (error) {
      console.error("Failed to load my requests:", error);
    }
  };

  const handleRefresh = () => {
    loadAllRequests();
    loadMyRequests();
  };

  useEffect(() => {
    loadAllRequests();
    loadMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadAllRequests();
  };

  const handleClearFilters = () => {
    setFilters({
      course_code: "",
      semester: "",
      instructor: "",
    });
  };

  // Separate matches from regular requests
  const matches = allRequests.filter((r) => r.is_match);
  const regularRequests = allRequests.filter((r) => !r.is_match);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Course Swap Marketplace</h1>
          <p className="text-muted-foreground">
            Find students to swap course sections with
          </p>
        </div>
        <CreateSwapRequestDialog onRequestCreated={handleRefresh} />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="matches">
            Perfect Matches {matches.length > 0 && `(${matches.length})`}
          </TabsTrigger>
          <TabsTrigger value="mine">My Requests ({myRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <Label className="font-semibold">Filters</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="course_code">Course Code</Label>
                <Input
                  id="course_code"
                  placeholder="e.g., CS 101"
                  value={filters.course_code}
                  onChange={(e) =>
                    setFilters({ ...filters, course_code: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="e.g., Fall 2024"
                  value={filters.semester}
                  onChange={(e) =>
                    setFilters({ ...filters, semester: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="e.g., Dr. Khan"
                  value={filters.instructor}
                  onChange={(e) =>
                    setFilters({ ...filters, instructor: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Requests List */}
          {loading ? (
            <div className="text-center py-12">Loading swap requests...</div>
          ) : allRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No swap requests found</h3>
              <p className="text-muted-foreground">
                Be the first to post a swap request!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {regularRequests.map((request) => (
                <SwapRequestCard
                  key={request.id}
                  request={request}
                  onUpdate={handleRefresh}
                  currentUserId={clientSession?.status === "authenticated" ? clientSession.user.id : undefined}
                  showActions={clientSession?.status === "authenticated" && request.user_id === clientSession.user.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {matches.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No perfect matches yet</h3>
              <p className="text-muted-foreground">
                Post a swap request and we&apos;ll notify you when we find a perfect match!
              </p>
            </Card>
          ) : (
            matches.map((request) => (
              <SwapRequestCard
                key={request.id}
                request={request}
                onUpdate={handleRefresh}
                currentUserId={clientSession?.status === "authenticated" ? clientSession.user.id : undefined}
                showActions={clientSession?.status === "authenticated" && request.user_id === clientSession.user.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {myRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">
                You haven&apos;t posted any swap requests
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a swap request to find someone to swap sections with
              </p>
              <CreateSwapRequestDialog onRequestCreated={handleRefresh} />
            </Card>
          ) : (
            myRequests.map((request) => (
              <SwapRequestCard
                key={request.id}
                request={{ ...request, is_match: false }}
                onUpdate={handleRefresh}
                currentUserId={clientSession?.status === "authenticated" ? clientSession.user.id : undefined}
                showActions={true}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
