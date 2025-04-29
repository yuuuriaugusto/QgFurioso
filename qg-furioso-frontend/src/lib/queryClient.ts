import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: false,
      // Adicionando cache de 10 minutos para melhorar performance
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});

// Prefetch helpers para melhorar navegação
export const prefetchHomeData = async () => {
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ['/api/matches'] }),
    queryClient.prefetchQuery({ queryKey: ['/api/streams'] }),
    queryClient.prefetchQuery({ queryKey: ['/api/content/news'] }),
    queryClient.prefetchQuery({ queryKey: ['/api/surveys'] })
  ]);
};

export const prefetchContentData = async () => {
  await queryClient.prefetchQuery({ queryKey: ['/api/content/news'] });
};

export const prefetchShopData = async () => {
  await queryClient.prefetchQuery({ queryKey: ['/api/shop/items'] });
};
