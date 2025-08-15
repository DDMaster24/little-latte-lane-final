'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from '@/components/LoginForm';
import { User, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface AuthRequiredPromptProps {
  title?: string;
  message?: string;
  feature?: string;
}

export default function AuthRequiredPrompt({
  title = 'Account Access Required',
  message = 'You need to be signed in to access your account.',
  feature = 'account',
}: AuthRequiredPromptProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6">
      <Card className="bg-gray-800 border-gray-600 max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-neonCyan to-neonPink rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-black" />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            {title}
          </CardTitle>
          <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Description */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-neonCyan" />
              Access Your {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-neonPink" />
                View and manage your profile
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-neonPink" />
                Track your order history
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-neonPink" />
                Update your personal information
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-neonPink" />
                Faster checkout experience
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                setAuthMode('login');
                setIsLoginModalOpen(true);
              }}
              className="w-full bg-neonCyan text-black hover:bg-cyan-400 font-semibold py-3 transition-all duration-200 hover:scale-105"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In to Your Account
            </Button>

            <Button
              onClick={() => {
                setAuthMode('signup');
                setIsLoginModalOpen(true);
              }}
              variant="outline"
              className="w-full border-neonPink text-neonPink hover:bg-neonPink hover:text-black font-semibold py-3 transition-all duration-200 hover:scale-105"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create New Account
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Don&apos;t have an account? Sign up is quick and free!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              {authMode === 'login'
                ? 'Welcome Back!'
                : 'Join Little Latte Lane'}
            </DialogTitle>
          </DialogHeader>
          <LoginForm setIsModalOpen={setIsLoginModalOpen} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
