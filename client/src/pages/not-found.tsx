import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 mb-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 mt-4"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
