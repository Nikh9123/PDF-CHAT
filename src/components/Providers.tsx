'use client'

import React from 'react';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

type Props = {
  children: React.ReactNode
}

// Create a client
const queryClient = new QueryClient();

// Create a provider which wraps your app and makes the client available to any nested components that need to fetch data
//instead of making the request to backend we will cache the data using provider
const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>)
}

export default Providers ;