import { useState } from "react";
import { X, Mail, Github, Chrome, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication when Supabase is connected
    console.log("Auth form submitted:", { email, password, isSignUp });
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social authentication when Supabase is connected
    console.log("Social login with:", provider);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Enux
            </span>
          </div>
          <DialogTitle className="text-center">
            Welcome to the future of business knowledge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Sign In */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => handleSocialLogin("google")}
            >
              <Chrome className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => handleSocialLogin("github")}
            >
              <Github className="h-5 w-5 mr-2" />
              Continue with GitHub
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => handleSocialLogin("email")}
            >
              <Mail className="h-5 w-5 mr-2" />
              Continue with Email
            </Button>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or create account
              </span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Create Account
            </Button>
          </form>

          {/* Terms and Privacy */}
          <div className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" target="_blank" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}