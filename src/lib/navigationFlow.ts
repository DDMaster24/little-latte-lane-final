/**
 * Navigation Flow Optimization
 * Handles customer journey validation and error recovery
 */

import { toast } from 'sonner';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export interface NavigationStep {
  id: string;
  name: string;
  path: string;
  required?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

export const customerJourneySteps: NavigationStep[] = [
  {
    id: 'home',
    name: 'Welcome',
    path: '/',
  },
  {
    id: 'menu',
    name: 'Browse Menu',
    path: '/menu',
  },
  {
    id: 'menu-modern',
    name: 'Select Items',
    path: '/ordering',
  },
  {
    id: 'cart',
    name: 'Review Cart',
    path: '/cart',
    validate: () => {
      // Check if cart has items
      const cartData = localStorage.getItem('little-latte-cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        return cart.state?.items?.length > 0;
      }
      return false;
    }
  },
  {
    id: 'checkout',
    name: 'Checkout',
    path: '/checkout',
    required: true,
    validate: async () => {
      // Check if user is authenticated
      const supabase = (await import('@/lib/supabase-client')).getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    }
  },
  {
    id: 'payment',
    name: 'Payment',
    path: '/payment',
    required: true,
  },
  {
    id: 'account',
    name: 'Order Tracking',
    path: '/account',
  }
];

export class NavigationFlow {
  private static instance: NavigationFlow;
  private currentStep: string | null = null;
  private stepHistory: string[] = [];

  static getInstance() {
    if (!NavigationFlow.instance) {
      NavigationFlow.instance = new NavigationFlow();
    }
    return NavigationFlow.instance;
  }

  setCurrentStep(stepId: string) {
    if (this.currentStep && this.currentStep !== stepId) {
      this.stepHistory.push(this.currentStep);
    }
    this.currentStep = stepId;
  }

  getCurrentStep(): NavigationStep | null {
    if (!this.currentStep) return null;
    return customerJourneySteps.find(step => step.id === this.currentStep) || null;
  }

  getNextStep(): NavigationStep | null {
    if (!this.currentStep) return customerJourneySteps[0];
    
    const currentIndex = customerJourneySteps.findIndex(step => step.id === this.currentStep);
    if (currentIndex >= 0 && currentIndex < customerJourneySteps.length - 1) {
      return customerJourneySteps[currentIndex + 1];
    }
    return null;
  }

  getPreviousStep(): NavigationStep | null {
    if (this.stepHistory.length > 0) {
      const previousStepId = this.stepHistory[this.stepHistory.length - 1];
      return customerJourneySteps.find(step => step.id === previousStepId) || null;
    }
    
    if (!this.currentStep) return null;
    
    const currentIndex = customerJourneySteps.findIndex(step => step.id === this.currentStep);
    if (currentIndex > 0) {
      return customerJourneySteps[currentIndex - 1];
    }
    return null;
  }

  async validateCurrentStep(): Promise<boolean> {
    const currentStep = this.getCurrentStep();
    if (!currentStep || !currentStep.validate) return true;

    try {
      return await currentStep.validate();
    } catch (error) {
      console.error('Step validation failed:', error);
      return false;
    }
  }

  async proceedToNextStep(router: AppRouterInstance): Promise<boolean> {
    // Validate current step
    const isValid = await this.validateCurrentStep();
    if (!isValid) {
      const currentStep = this.getCurrentStep();
      toast.error(`Please complete ${currentStep?.name || 'current step'} before proceeding`);
      return false;
    }

    // Get next step
    const nextStep = this.getNextStep();
    if (!nextStep) {
      toast.info('You\'ve completed the journey!');
      return false;
    }

    // Navigate to next step
    this.setCurrentStep(nextStep.id);
    router.push(nextStep.path);
    
    toast.success(`Proceeding to ${nextStep.name}`, {
      duration: 2000,
    });
    
    return true;
  }

  goToPreviousStep(router: AppRouterInstance): boolean {
    const previousStep = this.getPreviousStep();
    if (!previousStep) {
      toast.info('You\'re at the beginning of the journey');
      return false;
    }

    // Remove from history
    if (this.stepHistory.length > 0) {
      this.stepHistory.pop();
    }
    
    this.setCurrentStep(previousStep.id);
    router.push(previousStep.path);
    
    toast.info(`Back to ${previousStep.name}`);
    return true;
  }

  // Recovery functions
  async recoverFromError(error: string, router: AppRouterInstance) {
    console.error('Navigation error:', error);
    
    // Common recovery strategies
    if (error.includes('cart') || error.includes('empty')) {
      // Cart related error - go to menu
      this.setCurrentStep('menu-modern');
      router.push('/ordering');
      toast.error('Cart issue detected. Redirecting to menu...');
      return;
    }

    if (error.includes('auth') || error.includes('login')) {
      // Auth error - stay on current page but prompt login
      toast.error('Please log in to continue');
      return;
    }

    if (error.includes('payment')) {
      // Payment error - go back to cart
      this.setCurrentStep('cart');
      toast.error('Payment issue. Please review your order.');
      return;
    }

    // Generic error - go to safe state (home)
    this.setCurrentStep('home');
    router.push('/');
    toast.error('Something went wrong. Redirecting to home...');
  }

  // Get user-friendly progress indication
  getProgress(): { current: number; total: number; percentage: number } {
    const currentIndex = this.currentStep 
      ? customerJourneySteps.findIndex(step => step.id === this.currentStep)
      : 0;
    
    const current = Math.max(0, currentIndex + 1);
    const total = customerJourneySteps.length;
    const percentage = (current / total) * 100;

    return { current, total, percentage };
  }
}

// Hook for using navigation flow
export function useNavigationFlow() {
  const flow = NavigationFlow.getInstance();
  
  return {
    setCurrentStep: flow.setCurrentStep.bind(flow),
    getCurrentStep: flow.getCurrentStep.bind(flow),
    getNextStep: flow.getNextStep.bind(flow),
    getPreviousStep: flow.getPreviousStep.bind(flow),
    validateCurrentStep: flow.validateCurrentStep.bind(flow),
    proceedToNextStep: flow.proceedToNextStep.bind(flow),
    goToPreviousStep: flow.goToPreviousStep.bind(flow),
    recoverFromError: flow.recoverFromError.bind(flow),
    getProgress: flow.getProgress.bind(flow),
  };
}
