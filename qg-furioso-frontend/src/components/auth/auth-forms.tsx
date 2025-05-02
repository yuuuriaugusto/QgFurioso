import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  primaryIdentity: z.string().min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  primaryIdentity: z.string().min(3, "Email deve ter pelo menos 3 caracteres"),
  identityType: z.enum(["email", "phone"]).default("email"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  status: z.string().default("active"),
  confirmPassword: z.string(),
  // Sempre define termsAccepted como true para o envio ao servidor
  termsAccepted: z.boolean().default(true),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      primaryIdentity: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      primaryIdentity: "",
      identityType: "email",
      password: "",
      confirmPassword: "",
      status: "active",
      termsAccepted: true, // Definido como true por padrão
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword as it's not part of the API
    const { confirmPassword, ...registerData } = data;
    console.log("Registering with data:", registerData);
    registerMutation.mutate(registerData);
  };

  return (
    <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="login">Entrar</TabsTrigger>
        <TabsTrigger value="register">Criar conta</TabsTrigger>
      </TabsList>
      
      {/* Login Tab */}
      <TabsContent value="login">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h2>
          <p className="text-muted-foreground">
            Entre com sua conta para acessar o QG FURIOSO
          </p>
        </div>
        
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="primaryIdentity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com" 
                      type="email"
                      autoComplete="email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      autoComplete="current-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setActiveTab("register")} 
            className="text-sm text-primary hover:underline"
          >
            Não tem uma conta? Crie uma aqui
          </button>
        </div>
      </TabsContent>
      
      {/* Register Tab */}
      <TabsContent value="register">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Criar uma nova conta</h2>
          <p className="text-muted-foreground">
            Junte-se à comunidade do QG FURIOSO
          </p>
        </div>
        
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <FormField
              control={registerForm.control}
              name="primaryIdentity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com" 
                      type="email"
                      autoComplete="email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      autoComplete="new-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      autoComplete="new-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="terms"
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel htmlFor="terms" className="text-sm font-medium">
                      Aceito os Termos de Uso e Política de Privacidade
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Ao criar uma conta, você concorda com os nossos <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormMessage className="text-red-500">
              {registerForm.formState.errors.termsAccepted && registerForm.formState.errors.termsAccepted.message}
            </FormMessage>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setActiveTab("login")} 
            className="text-sm text-primary hover:underline"
          >
            Já tem uma conta? Entre aqui
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
}