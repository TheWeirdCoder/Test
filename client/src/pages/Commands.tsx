import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command } from "@shared/schema";
import CommandCard from "@/components/CommandCard";
import CommandForm from "@/components/CommandForm";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Commands() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch commands
  const { data: commands, isLoading, refetch } = useQuery<Command[]>({ 
    queryKey: ['/api/commands'],
    // Use default API fetch setup
  });

  // Filter commands based on search and active tab
  const filteredCommands = commands?.filter(command => {
    // Filter by search query
    const matchesSearch = command.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          command.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab category
    const matchesCategory = activeTab === 'all' || command.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  // Handle successful command creation or update
  const handleCommandSuccess = () => {
    setShowAddForm(false);
    refetch();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-4">
        <BackButton />
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Commands</h1>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
        >
          {showAddForm ? "Cancel" : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Command
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6">
          <CommandForm onSuccess={handleCommandSuccess} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search commands..."
          className="pl-10 bg-[#40444B] border-gray-700 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="bg-[#2F3136] border border-gray-700">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="fun">Fun</TabsTrigger>
          <TabsTrigger value="utility">Utility</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <Card className="flex justify-center items-center py-8 bg-[#2F3136] text-white border-gray-700">
              <Loader2 className="h-8 w-8 animate-spin text-[#5865F2]" />
            </Card>
          ) : filteredCommands && filteredCommands.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommands.map(command => (
                <CommandCard 
                  key={command.id} 
                  command={command} 
                  onUpdate={() => refetch()} 
                />
              ))}
            </div>
          ) : (
            <Card className="bg-[#2F3136] text-white border-gray-700">
              <CardHeader>
                <CardTitle className="text-center">No Commands Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-400">
                  {searchQuery ? "No commands match your search criteria." : "No commands in this category yet. Create one!"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}