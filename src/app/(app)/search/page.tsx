"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchCampus, SearchResult } from "@/features/search/server";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileText, Hash, User, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchCampus(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText className="h-5 w-5" />;
      case "channel":
        return <Hash className="h-5 w-5" />;
      case "user":
        return <User className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case "post":
        return `/channel/${result.id}/post/${result.id}`;
      case "channel":
        return `/channel/${result.id}`;
      case "user":
        return `/profile/${result.id}`;
      default:
        return "#";
    }
  };

  const groupedResults = {
    posts: results.filter((r) => r.type === "post"),
    channels: results.filter((r) => r.type === "channel"),
    users: results.filter((r) => r.type === "user"),
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? `Results for "${query}"` : "Enter a search query"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {query ? "No results found" : "Start searching to find posts, channels, and users"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Posts */}
          {groupedResults.posts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts ({groupedResults.posts.length})
              </h2>
              <div className="space-y-3">
                {groupedResults.posts.map((result) => (
                  <Link key={`post-${result.id}`} href={getResultLink(result)}>
                    <Card className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{result.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {result.description}
                          </p>
                          {result.channelName && (
                            <Badge variant="secondary" className="text-xs">
                              #{result.channelName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Channels */}
          {groupedResults.channels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Channels ({groupedResults.channels.length})
              </h2>
              <div className="space-y-3">
                {groupedResults.channels.map((result) => (
                  <Link key={`channel-${result.id}`} href={getResultLink(result)}>
                    <Card className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">#{result.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {groupedResults.users.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Users ({groupedResults.users.length})
              </h2>
              <div className="space-y-3">
                {groupedResults.users.map((result) => (
                  <Link key={`user-${result.id}`} href={getResultLink(result)}>
                    <Card className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={result.avatarUrl} />
                          <AvatarFallback>
                            {result.title.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{result.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
