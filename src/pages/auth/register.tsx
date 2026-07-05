import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, User, Building2, Phone, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { registerSchema, companyRegisterSchema, type RegisterFormData, type CompanyRegisterFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Step1Data = RegisterFormData;
type Step2Data = CompanyRegisterFormData;
type Step3Data = { subscriptionPlan: 'free' | 'starter' | 'professional' | 'enterprise' };

const plans = [
  { id: 'free', name: 'Free', price: '$0', features: ['Up to 5 users', '100 assets', 'Basic reporting'] },
  { id: 'starter', name: 'Starter', price: '$29', features: ['Up to 25 users', '500 assets', 'Advanced reporting', 'Email support'] },
  { id: 'professional', name: 'Professional', price: '$99', features: ['Unlimited users', 'Unlimited assets', 'Priority support', 'API access'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Everything in Professional', 'SSO', 'Custom integrations', 'Dedicated support'] },
] as const;

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    step1: Partial<Step1Data>;
    step2: Partial<Step2Data>;
    step3: Step3Data;
  }>({
    step1: {},
    step2: {},
    step3: { subscriptionPlan: 'free' },
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(registerSchema),
    defaultValues: formData.step1,
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: formData.step2,
  });

  const handleNextStep1 = async (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }));
    setStep(2);
  };

  const handleNextStep2 = async (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, step2: data }));
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      step1Form.reset(formData.step1);
      setStep(1);
    } else if (step === 3) {
      step2Form.reset(formData.step2);
      setStep(2);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    const data = {
      ...formData.step1,
      ...formData.step2,
      ...formData.step3,
    } as Step1Data & Step2Data & Step3Data;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      const { error: companyError } = await supabase.from('companies').insert({
        name: data.companyName,
        code: data.companyCode.toLowerCase(),
        email: data.companyEmail,
        phone: data.companyPhone || null,
        subscription_plan: data.subscriptionPlan,
      });

      if (companyError) throw companyError;

      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('code', data.companyCode.toLowerCase())
        .maybeSingle();

      if (companyData) {
        await supabase.from('profiles').update({
          company_id: companyData.id,
          role: 'company_admin',
        }).eq('id', authData.user.id);
      }

      toast({ title: 'Account created!', description: 'Your company has been registered successfully.' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container py-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">AIMPro</span>
          </div>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Get started with AIMPro Enterprise</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn('h-2 w-8 rounded-full transition-colors', s <= step ? 'bg-primary' : 'bg-muted')}
            />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(handleNextStep1)}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Enter your personal details to create your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="firstName" placeholder="John" className="pl-10" {...step1Form.register('firstName')} />
                    </div>
                    {step1Form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Doe" {...step1Form.register('lastName')} />
                    {step1Form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@company.com" className="pl-10" {...step1Form.register('email')} />
                  </div>
                  {step1Form.formState.errors.email && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Create a strong password" className="pl-10" {...step1Form.register('password')} />
                  </div>
                  {step1Form.formState.errors.password && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your password" {...step1Form.register('confirmPassword')} />
                  {step1Form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">Continue</Button>
              </CardContent>
            </Card>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2Form.handleSubmit(handleNextStep2)}>
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Tell us about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="companyName" placeholder="Acme Corporation" className="pl-10" {...step2Form.register('companyName')} />
                  </div>
                  {step2Form.formState.errors.companyName && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyCode">Company code</Label>
                  <Input id="companyCode" placeholder="acme-corp" {...step2Form.register('companyCode')} />
                  <p className="text-xs text-muted-foreground">
                    This will be used as your unique company identifier (lowercase, numbers, hyphens)
                  </p>
                  {step2Form.formState.errors.companyCode && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.companyCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="companyEmail" type="email" placeholder="contact@company.com" className="pl-10" {...step2Form.register('companyEmail')} />
                  </div>
                  {step2Form.formState.errors.companyEmail && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.companyEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="companyPhone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" {...step2Form.register('companyPhone')} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                  <Button type="submit" className="flex-1">Continue</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>Select the subscription plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative rounded-lg border-2 p-4 cursor-pointer transition-all',
                      formData.step3.subscriptionPlan === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setFormData((prev) => ({ ...prev, step3: { subscriptionPlan: plan.id } }))}
                  >
                    {formData.step3.subscriptionPlan === plan.id && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold mt-1">
                      {plan.price}
                      {plan.price !== 'Custom' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="h-3 w-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                <Button type="button" className="flex-1" disabled={isLoading} onClick={onSubmit}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
