## useTrpcReducer

- A trpc-ified react useReducer hook that lets you perform state logic in reducers but still maintaining typesafety from trpc's api.
- This hook solves a specific problem which is updating the cache on mutations, but with actions and dispatches that comes from the useReducer architecture
